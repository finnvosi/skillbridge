// Phone OTP auth — the worker app's default sign-in (blueprint §12).
//
// Flow: POST /request { phone } -> 6-digit code sent via SMS (mock provider
// returns `demoCode` for the demo app) -> POST /verify { phone, code } -> JWT.
// Codes are stored hashed, expire after OTP_TTL_MS, are limited to
// OTP_MAX_ATTEMPTS wrong tries, and are never returned once verified.
//
// Security posture for the prototype: IP-level rate limits plus per-OTP-row
// attempt caps and a resend cooldown. Production needs a real SMS provider,
// per-phone distributed rate limiting, and abuse detection (see blueprint §12).
import { Router, Request, Response } from 'express';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import { prisma } from '../db/prisma';
import { asyncHandler, validate } from '../middleware/validation';
import { sendOtpSms } from '../services/sms';
import { signTokens, publicUser } from '../services/auth-tokens';

const router = Router();

const OTP_TTL_MS = parseInt(process.env.OTP_TTL_MS || '300000', 10); // 5 minutes
const OTP_MAX_ATTEMPTS = parseInt(process.env.OTP_MAX_ATTEMPTS || '5', 10);
const OTP_RESEND_COOLDOWN_MS = parseInt(
  process.env.OTP_RESEND_COOLDOWN_MS || '30000',
  10
); // 30s

// IP-level brute-force protection. Phone-level protection lives on the OTP row
// (attempts cap + expiry) because the code is the only secret the caller has.
const requestLimiter = rateLimit({
  windowMs: 60_000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many code requests. Try again in a minute.' },
});
const verifyLimiter = rateLimit({
  windowMs: 15 * 60_000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many verification attempts. Try again later.' },
});

// --- Phone helpers -----------------------------------------------------------

// Light normalization for the Khmer numbering plan: accept local
// 0XXXXXXXXX, bare 855XXXXXXXXX, or E.164 +855XXXXXXXXX. Prototype-only;
// production should validate with a real numbering-plan library.
function normalizePhone(raw: string): string {
  const digits = raw.replace(/[\s\-().]/g, '');
  // Local Khmer numbers: 0 followed by 8–9 digits (landline/mobile).
  if (/^0\d{8,9}$/.test(digits)) return `+855${digits.slice(1)}`;
  if (/^855\d{8,9}$/.test(digits)) return `+${digits}`;
  if (/^\+?\d{8,15}$/.test(digits)) return digits.startsWith('+') ? digits : `+${digits}`;
  throw new Error('Invalid phone number');
}

// --- Validation ---------------------------------------------------------------

const requestSchema = z.object({
  body: z.object({
    phone: z
      .string()
      .min(8)
      .max(20)
      .refine((p) => /^\+?[\d\s\-().]{8,20}$/.test(p), 'Enter a valid phone number'),
  }),
});

const verifySchema = z.object({
  body: z.object({
    phone: z.string().min(8).max(20),
    code: z.string().regex(/^\d{6}$/, 'Code must be 6 digits'),
  }),
});

function generateCode(): string {
  return String(crypto.randomInt(0, 1_000_000)).padStart(6, '0');
}

// --- Routes ------------------------------------------------------------------

// POST /api/v1/auth/otp/request  { phone }
router.post(
  '/request',
  requestLimiter,
  validate(requestSchema),
  asyncHandler(async (req: Request, res: Response) => {
    let phone: string;
    try {
      phone = normalizePhone(req.body.phone);
    } catch {
      return res.status(400).json({ error: 'Invalid phone number' });
    }

    // Resend cooldown: reuse an existing unexpired code rather than minting a
    // fresh one every tap (keeps brute-force surface small, too).
    const existing = await prisma.phoneOtp.findFirst({
      where: { phone, verifiedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
    });
    if (existing) {
      const age = Date.now() - existing.createdAt.getTime();
      if (age < OTP_RESEND_COOLDOWN_MS) {
        return res.status(429).json({
          error: 'A code was just sent. Please wait before requesting another.',
          retryAfterMs: OTP_RESEND_COOLDOWN_MS - age,
        });
      }
    }

    const code = generateCode();
    const codeHash = await bcrypt.hash(code, 10);
    await prisma.phoneOtp.create({
      data: { phone, codeHash, expiresAt: new Date(Date.now() + OTP_TTL_MS) },
    });

    const sms = await sendOtpSms(phone, code);

    res.json({
      message: 'Code sent',
      provider: sms.provider,
      // Demo mode only — never present with a real SMS provider.
      ...(sms.demoCode ? { demoCode: sms.demoCode } : {}),
      expiresInMs: OTP_TTL_MS,
    });
  })
);

// POST /api/v1/auth/otp/verify  { phone, code }
router.post(
  '/verify',
  verifyLimiter,
  validate(verifySchema),
  asyncHandler(async (req: Request, res: Response) => {
    let phone: string;
    try {
      phone = normalizePhone(req.body.phone);
    } catch {
      return res.status(400).json({ error: 'Invalid phone number' });
    }
    const { code } = req.body;

    const otp = await prisma.phoneOtp.findFirst({
      where: { phone, verifiedAt: null },
      orderBy: { createdAt: 'desc' },
    });
    if (!otp) {
      return res.status(401).json({ error: 'No active code for this number. Request a new one.' });
    }
    if (otp.expiresAt.getTime() < Date.now()) {
      return res.status(410).json({ error: 'Code expired. Request a new one.' });
    }
    if (otp.attempts >= OTP_MAX_ATTEMPTS) {
      return res.status(429).json({ error: 'Too many wrong attempts. Request a new code.' });
    }

    const ok = await bcrypt.compare(code, otp.codeHash);
    if (!ok) {
      await prisma.phoneOtp.update({
        where: { id: otp.id },
        data: { attempts: { increment: 1 } },
      });
      return res.status(401).json({ error: 'Incorrect code' });
    }

    await prisma.phoneOtp.update({
      where: { id: otp.id },
      data: { verifiedAt: new Date() },
    });

    // Find-or-create the phone-first worker account. The phone number becomes
    // the unique identity; name/email are filled in later onboarding.
    let user = await prisma.user.findUnique({ where: { phone } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          phone,
          role: 'worker',
          name: '',
          email: null,
          passwordHash: null,
          workerProfile: { create: { phone } },
        },
      });
    }

    const { token, refreshToken } = signTokens(user);

    res.json({
      message: 'Verified',
      user: publicUser(user),
      token,
      refreshToken,
    });
  })
);

export default router;
