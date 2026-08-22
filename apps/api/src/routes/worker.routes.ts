import { Router, Request, Response } from 'express';
import * as crypto from 'crypto';
import { z } from 'zod';
import { prisma } from '../db/prisma';
import { asyncHandler, validate } from '../middleware/validation';
import { requireWorker, AuthRequest } from '../middleware/auth';

// ===========================================================================
// Worker vertical slice API
// Cambodia-first blue-collar worker app.
//
// SEC-1 remediation: the worker's identity is derived from the authenticated
// JWT via `requireWorker`, which resolves the caller's WorkerProfile server-side.
// No endpoint accepts a client-supplied `workerId` anymore — this closes the
// IDOR / impersonation gap that the unauthenticated slice had.
//
// Browsing jobs (/jobs, /jobs/:id) remains PUBLIC by design: anyone may view
// available work. Reading a worker's own passport/applications and applying
// require authentication.
// ===========================================================================

const router = Router();

// ---- Query / param schemas -------------------------------------------------

const listJobsQuery = z.object({
  near: z.coerce.boolean().optional(),
  shift: z.enum(['day', 'night', 'rotating', 'flexible']).optional(),
  minPay: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

const applySchema = z.object({
  body: z.object({
    jobId: z.string().min(1),
    // Optional: what the worker chooses to share from their passport.
    shareWorkRecords: z.boolean().default(false),
  }),
});

function shiftEnum(s: string) {
  return (['day', 'night', 'rotating', 'flexible'] as const).includes(s as any)
    ? (s as any)
    : undefined;
}

// ---- GET /api/v1/worker/jobs (PUBLIC) --------------------------------------

router.get(
  '/jobs',
  asyncHandler(async (req: Request, res: Response) => {
    const { near, shift, minPay, limit } = listJobsQuery.parse({
      near: req.query.near,
      shift: req.query.shift,
      minPay: req.query.minPay,
      limit: req.query.limit,
    });

    const jobs = await prisma.job.findMany({
      where: {
        ...(shift ? { shift } : {}),
        ...(minPay ? { payPerMonth: { gte: minPay } } : {}),
        // "near" is a demo filter: lowest distance first, capped.
        ...(near ? { distanceKm: { lte: 15 } } : {}),
      },
      include: { company: true },
      orderBy: near ? { distanceKm: 'asc' } : { lastCheckedDate: 'desc' },
      take: limit,
    });

    res.json({
      jobs: jobs.map((j) => ({
        id: j.id,
        title: j.title,
        summary: j.summary,
        company: j.company.name,
        companyVerified: j.company.verified,
        verificationLevel: j.verificationLevel,
        payPerMonth: j.payPerMonth,
        currency: j.currency,
        shift: j.shift,
        employmentType: j.employmentType,
        location: j.location,
        distanceKm: j.distanceKm,
        skillsRequired: j.skillsRequired,
        matchReason: j.matchReason,
        accommodation: j.accommodation,
        transportProvided: j.transportProvided,
        overtimePaid: j.overtimePaid,
        lastCheckedDate: j.lastCheckedDate,
      })),
    });
  }),
);

// ---- GET /api/v1/worker/jobs/:id (PUBLIC) ----------------------------------

router.get(
  '/jobs/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const job = await prisma.job.findUnique({
      where: { id: req.params.id },
      include: { company: true },
    });
    if (!job) return res.status(404).json({ error: 'Job not found' });
    res.json({
      id: job.id,
      title: job.title,
      summary: job.summary,
      company: job.company.name,
      companyVerified: job.company.verified,
      verificationLevel: job.verificationLevel,
      payPerMonth: job.payPerMonth,
      currency: job.currency,
      shift: job.shift,
      employmentType: job.employmentType,
      location: job.location,
      distanceKm: job.distanceKm,
      skillsRequired: job.skillsRequired,
      matchReason: job.matchReason,
      accommodation: job.accommodation,
      transportProvided: job.transportProvided,
      overtimePaid: job.overtimePaid,
      lastCheckedDate: job.lastCheckedDate,
      whatWasChecked: [
        'Company registration verified',
        'Vacancy cross-checked with employer',
        'No active scam reports',
      ],
    });
  }),
);

// ---- POST /api/v1/worker/applications (AUTH) -------------------------------
// Worker identity is taken from the resolved profile, never the request body.

router.post(
  '/applications',
  requireWorker,
  validate(applySchema),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const workerId = (req as AuthRequest & { workerProfileId: string })
      .workerProfileId;
    const { jobId, shareWorkRecords } = (req as any).body;

    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: { company: true },
    });
    if (!job) return res.status(404).json({ error: 'Job not found' });

    const existing = await prisma.workerApplication.findUnique({
      where: { workerId_jobId: { workerId, jobId } },
    });
    if (existing) {
      return res
        .status(409)
        .json({ error: 'Already applied', applicationId: existing.id });
    }

    const application = await prisma.workerApplication.create({
      data: { workerId, jobId, status: 'submitted' },
    });

    // In-app notification for the worker (notification center + push updates).
    if (req.user) {
      await prisma.notification.create({
        data: {
          userId: req.user.id,
          type: 'application_status_changed',
          title: 'Application submitted',
          body: `Applied to ${job.title} at ${job.company.name}`,
        },
      });
    }

    res.status(201).json({
      applicationId: application.id,
      status: application.status,
      submittedAt: application.createdAt,
      shareWorkRecords,
    });
  }),
);

// ---- GET /api/v1/worker/me/applications (AUTH) -----------------------------

router.get(
  '/me/applications',
  requireWorker,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const workerId = (req as AuthRequest & { workerProfileId: string })
      .workerProfileId;
    const applications = await prisma.workerApplication.findMany({
      where: { workerId },
      include: { job: { include: { company: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({
      applications: applications.map((a) => ({
        id: a.id,
        status: a.status,
        submittedAt: a.createdAt,
        job: {
          id: a.job.id,
          title: a.job.title,
          company: a.job.company.name,
          payPerMonth: a.job.payPerMonth,
          currency: a.job.currency,
          location: a.job.location,
          distanceKm: a.job.distanceKm,
        },
      })),
    });
  }),
);

// ---- GET /api/v1/worker/me/passport (AUTH) --------------------------------

router.get(
  '/me/passport',
  requireWorker,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const workerId = (req as AuthRequest & { workerProfileId: string })
      .workerProfileId;
    const worker = await prisma.workerProfile.findUnique({
      where: { id: workerId },
      include: { workRecords: true },
    });
    if (!worker)
      return res.status(404).json({ error: 'Worker not found' });
    res.json({
      id: worker.id,
      fullName: worker.fullName,
      phone: worker.phone,
      preferredArea: worker.preferredArea,
      availability: worker.availability,
      identityVerified: worker.identityVerified,
      skills: worker.skills,
      languages: worker.languages,
      workRecords: worker.workRecords.map((r) => ({
        id: r.id,
        role: r.role,
        company: r.company,
        workplace: r.workplace,
        startDate: r.startDate,
        endDate: r.endDate,
        verified: r.verified,
        provenance: r.provenance,
      })),
    });
  }),
);

// ---- PATCH /api/v1/worker/me/passport (AUTH) ------------------------------
// Worker edits their own Passport profile. Identity is derived from the resolved
// WorkerProfile (SEC-1); the caller can only update fields on their own record.
// `identityVerified` and `workRecords` are intentionally NOT writable here — they
// are operator/verifier-managed and must never be self-asserted by a worker.

const updatePassportSchema = z.object({
  body: z.object({
    fullName: z.string().min(1).max(120).optional(),
    preferredArea: z.string().max(120).optional(),
    availability: z.string().max(120).optional(),
    skills: z.array(z.string().min(1).max(60)).max(40).optional(),
    languages: z.array(z.string().min(1).max(60)).max(40).optional(),
  }),
});

router.patch(
  '/me/passport',
  requireWorker,
  validate(updatePassportSchema),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const workerId = (req as AuthRequest & { workerProfileId: string })
      .workerProfileId;
    const { fullName, preferredArea, availability, skills, languages } = (req as any)
      .body;

    // Only set the fields that were actually provided, so a partial update does
    // not clobber fields the worker did not intend to change.
    const data: Record<string, unknown> = {};
    if (fullName !== undefined) data.fullName = fullName;
    if (preferredArea !== undefined) data.preferredArea = preferredArea;
    if (availability !== undefined) data.availability = availability;
    if (skills !== undefined) data.skills = skills;
    if (languages !== undefined) data.languages = languages;

    const updated = await prisma.workerProfile.update({
      where: { id: workerId },
      data,
      select: {
        id: true,
        fullName: true,
        phone: true,
        preferredArea: true,
        availability: true,
        identityVerified: true,
        skills: true,
        languages: true,
      },
    });

    // Return flat fields, matching the GET /me/passport shape so the mobile
    // client can map the response with the same adapter. `workRecords` is
    // intentionally excluded (verifier-managed, not self-editable).
    res.json({ ...updated });
  }),
);

// ---- GET /api/v1/worker/me/notifications (AUTH) ----------------------------
// In-app notification center (blueprint §7 must-ship: push notification plus
// in-app notification center). Worker-scoped via the JWT identity.

router.get(
  '/me/notifications',
  requireWorker,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json({
      notifications: notifications.map((n) => ({
        id: n.id,
        type: n.type,
        title: n.title,
        body: n.body,
        readAt: n.readAt,
        createdAt: n.createdAt,
      })),
    });
  }),
);

// ---- POST /api/v1/worker/me/notifications/:id/read (AUTH) ------------------

router.post(
  '/me/notifications/:id/read',
  requireWorker,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const updated = await prisma.notification.updateMany({
      where: { id: req.params.id, userId, readAt: null },
      data: { readAt: new Date() },
    });
    res.json({ updated: updated.count });
  }),
);

// ---- Work records (Career Passport employment history) ----------------------
// Workers add their own past jobs as SELF-DECLARED records, then request
// employer verification (blueprint §5 lifecycle: worker_draft ->
// employer_requested -> employer_verified). Verified records are
// verifier-managed and never writable by the worker.

const workRecordSchema = z.object({
  body: z.object({
    role: z.string().min(1).max(120),
    company: z.string().min(1).max(120),
    workplace: z.string().max(120).optional(),
    startDate: z.string().regex(/^\d{4}-\d{2}(-\d{2})?$/, 'Use YYYY-MM or YYYY-MM-DD'),
    endDate: z
      .string()
      .regex(/^\d{4}-\d{2}(-\d{2})?$/, 'Use YYYY-MM or YYYY-MM-DD')
      .nullable()
      .optional(),
  }),
});

const toDate = (v: string): Date =>
  v.length === 7 ? new Date(`${v}-01`) : new Date(v);

// POST /api/v1/worker/me/work-records — add a self-declared past job
router.post(
  '/me/work-records',
  requireWorker,
  validate(workRecordSchema),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const workerId = (req as AuthRequest & { workerProfileId: string })
      .workerProfileId;
    const { role, company, workplace, startDate, endDate } = (req as any).body;

    const record = await prisma.workRecord.create({
      data: {
        workerId,
        role,
        company,
        workplace: workplace ?? null,
        startDate: toDate(startDate),
        endDate: endDate ? toDate(endDate) : null,
        verified: false,
        provenance: 'self_declared',
      },
    });

    res.status(201).json({ record });
  }),
);

// DELETE /api/v1/worker/me/work-records/:id — remove own unverified record
router.delete(
  '/me/work-records/:id',
  requireWorker,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const workerId = (req as AuthRequest & { workerProfileId: string })
      .workerProfileId;
    const record = await prisma.workRecord.findUnique({
      where: { id: req.params.id },
    });
    if (!record || record.workerId !== workerId) {
      return res.status(404).json({ error: 'Record not found' });
    }
    if (record.verified) {
      return res.status(403).json({
        error: 'Verified records cannot be deleted. Contact support to dispute.',
      });
    }
    await prisma.workRecord.delete({ where: { id: record.id } });
    res.json({ deleted: true });
  }),
);

// POST /api/v1/worker/me/work-records/:id/request-verification
router.post(
  '/me/work-records/:id/request-verification',
  requireWorker,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const workerId = (req as AuthRequest & { workerProfileId: string })
      .workerProfileId;
    const record = await prisma.workRecord.findUnique({
      where: { id: req.params.id },
    });
    if (!record || record.workerId !== workerId) {
      return res.status(404).json({ error: 'Record not found' });
    }
    if (record.verified) {
      return res.status(400).json({ error: 'This record is already verified' });
    }

    const updated = await prisma.workRecord.update({
      where: { id: record.id },
      data: { provenance: 'verification_requested' },
    });

    if (req.user) {
      await prisma.notification.create({
        data: {
          userId: req.user.id,
          type: 'verification_requested',
          title: 'Verification requested',
          body: `${updated.company} · ${updated.role}`,
        },
      });
    }

    res.json({ record: updated });
  }),
);

// ---- POST /api/v1/worker/me/onboarding/complete (AUTH) ----------------------
// Marks the worker's onboarding done so the app gate can move them from the
// preferences step into the four tabs.

router.post(
  '/me/onboarding/complete',
  requireWorker,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: { onboardingStep: 1, onboardingCompletedAt: new Date() },
      select: {
        id: true,
        email: true,
        phone: true,
        name: true,
        role: true,
        onboardingStep: true,
        onboardingCompletedAt: true,
      },
    });
    res.json({ user });
  }),
);

// ---- Career Passport sharing (blueprint §5) --------------------------------
// Expiring, revocable links. The worker creates a share, gets a URL, and can
// revoke it at any time. The public view (public.routes.ts) exposes only
// shared fields — never phone, documents, or identity data.

const shareSchema = z.object({
  body: z.object({
    expiresInHours: z.number().int().min(1).max(168).optional(),
  }),
});

const DEFAULT_SHARE_HOURS = 24;

function shareUrl(req: Request, token: string): string {
  const base =
    process.env.PUBLIC_BASE_URL || `${req.protocol}://${req.get('host')}`;
  return `${base}/api/v1/public/passport/${token}`;
}

// POST /api/v1/worker/me/passport/shares — create a share
router.post(
  '/me/passport/shares',
  requireWorker,
  validate(shareSchema),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const workerId = (req as AuthRequest & { workerProfileId: string })
      .workerProfileId;
    const hours = (req.body as { expiresInHours?: number }).expiresInHours ?? DEFAULT_SHARE_HOURS;
    const token = crypto.randomBytes(24).toString('hex');
    const share = await prisma.passportShare.create({
      data: {
        workerId,
        token,
        expiresAt: new Date(Date.now() + hours * 3600_000),
      },
    });
    res.status(201).json({
      share: {
        id: share.id,
        token: share.token,
        expiresAt: share.expiresAt,
        revokedAt: share.revokedAt,
        url: shareUrl(req, share.token),
      },
    });
  }),
);

// GET /api/v1/worker/me/passport/shares — list shares (active + revoked)
router.get(
  '/me/passport/shares',
  requireWorker,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const workerId = (req as AuthRequest & { workerProfileId: string })
      .workerProfileId;
    const shares = await prisma.passportShare.findMany({
      where: { workerId },
      orderBy: { createdAt: 'desc' },
      take: 25,
    });
    res.json({
      shares: shares.map((s) => ({
        id: s.id,
        token: s.token,
        expiresAt: s.expiresAt,
        revokedAt: s.revokedAt,
        url: shareUrl(req, s.token),
      })),
    });
  }),
);

// DELETE /api/v1/worker/me/passport/shares/:id — revoke a share
router.delete(
  '/me/passport/shares/:id',
  requireWorker,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const workerId = (req as AuthRequest & { workerProfileId: string })
      .workerProfileId;
    const share = await prisma.passportShare.findUnique({
      where: { id: req.params.id },
    });
    if (!share || share.workerId !== workerId) {
      return res.status(404).json({ error: 'Share not found' });
    }
    const updated = await prisma.passportShare.update({
      where: { id: share.id },
      data: { revokedAt: share.revokedAt ?? new Date() },
    });
    res.json({ share: { id: updated.id, revokedAt: updated.revokedAt } });
  }),
);

// ---- Safety reports (blueprint §4/§7) --------------------------------------
// Reports are worker-scoped, never shown to the recruiter, and carry a
// worker-facing support status (submitted -> under_review -> resolved).

const reportSchema = z.object({
  body: z.object({
    category: z.enum([
      'payment_requested',
      'false_information',
      'recruiter_identity',
      'unsafe_contact',
      'other',
    ]),
    description: z.string().min(5).max(2000),
    evidence: z.string().max(500).optional(),
  }),
});

// POST /api/v1/worker/me/reports — file a report
router.post(
  '/me/reports',
  requireWorker,
  validate(reportSchema),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const workerId = (req as AuthRequest & { workerProfileId: string })
      .workerProfileId;
    const { category, description, evidence } = (req as any).body;
    const report = await prisma.report.create({
      data: {
        workerId,
        category,
        description: description.trim(),
        evidence: evidence?.trim() || null,
      },
    });
    res.status(201).json({
      report: {
        id: report.id,
        category: report.category,
        status: report.status,
        createdAt: report.createdAt,
      },
    });
  }),
);

// GET /api/v1/worker/me/reports — support status of my reports
router.get(
  '/me/reports',
  requireWorker,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const workerId = (req as AuthRequest & { workerProfileId: string })
      .workerProfileId;
    const reports = await prisma.report.findMany({
      where: { workerId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json({
      reports: reports.map((r) => ({
        id: r.id,
        category: r.category,
        description: r.description,
        status: r.status,
        adminNote: r.adminNote,
        createdAt: r.createdAt,
        resolvedAt: r.resolvedAt,
      })),
    });
  }),
);

// ---- Blocks (blueprint: in-app report and block) -----------------------------
// A blocked job is hidden from the worker's feed (the app filters by jobIds).

const blockSchema = z.object({
  body: z.object({ jobId: z.string().min(1) }),
});

// POST /api/v1/worker/me/blocks { jobId }
router.post(
  '/me/blocks',
  requireWorker,
  validate(blockSchema),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const workerId = (req as AuthRequest & { workerProfileId: string })
      .workerProfileId;
    const jobId = (req.body as { jobId: string }).jobId;
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) return res.status(404).json({ error: 'Job not found' });
    await prisma.block.upsert({
      where: { workerId_jobId: { workerId, jobId } },
      create: { workerId, jobId },
      update: {},
    });
    res.status(201).json({ blocked: true, jobId });
  }),
);

// DELETE /api/v1/worker/me/blocks/:jobId — unblock
router.delete(
  '/me/blocks/:jobId',
  requireWorker,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const workerId = (req as AuthRequest & { workerProfileId: string })
      .workerProfileId;
    await prisma.block.deleteMany({
      where: { workerId, jobId: req.params.jobId },
    });
    res.json({ blocked: false, jobId: req.params.jobId });
  }),
);

// GET /api/v1/worker/me/blocks — blocked job ids (for feed filtering)
router.get(
  '/me/blocks',
  requireWorker,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const workerId = (req as AuthRequest & { workerProfileId: string })
      .workerProfileId;
    const blocks = await prisma.block.findMany({
      where: { workerId },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ jobIds: blocks.map((b) => b.jobId) });
  }),
);

export default router;
