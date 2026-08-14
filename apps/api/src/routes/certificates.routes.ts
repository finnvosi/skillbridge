import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../db/prisma';
import { asyncHandler, validate } from '../middleware/validation';
import { authenticate, AuthRequest } from '../middleware/auth';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

const router = Router();

// Storage directory for certificates.
// Vercel serverless has a read-only cwd (/var/task); only /tmp is writable,
// so fall back to /tmp in production. Wrapped so a missing dir can never crash
// the function at import time.
const CERT_UPLOAD_DIR =
  process.env.NODE_ENV === 'production'
    ? path.join('/tmp', 'skillbridge', 'uploads', 'certificates')
    : path.join(process.cwd(), 'uploads', 'certificates');

// Ensure upload directory exists (non-fatal — uploads are best-effort).
try {
  if (!fs.existsSync(CERT_UPLOAD_DIR)) {
    fs.mkdirSync(CERT_UPLOAD_DIR, { recursive: true });
  }
} catch {
  // Read-only filesystem (e.g. missing /tmp) — certificate file storage
  // simply won't persist; API still serves.
}

// Upload a certificate (base64-encoded file in JSON body)
// The client sends: { title, description?, file: { base64, mimeType, originalName } }
const uploadSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    file: z.object({
      base64: z.string().min(1, 'File data is required'),
      mimeType: z.string().min(1, 'MIME type is required'),
      originalName: z.string().min(1, 'Original filename is required'),
    }),
  }),
});

router.post(
  '/',
  authenticate,
  validate(uploadSchema),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    if (req.user!.role !== 'student') {
      return res.status(403).json({ error: 'Only students can upload certificates' });
    }

    const { title, description, file } = req.body;
    const student = await prisma.student.findUnique({ where: { userId: req.user!.id } });
    if (!student) return res.status(403).json({ error: 'Student profile not found' });

    // Decode base64
    const buffer = Buffer.from(file.base64, 'base64');
    const fileSize = buffer.length;

    // Limit to 10MB
    if (fileSize > 10 * 1024 * 1024) {
      return res.status(400).json({ error: 'File too large. Maximum 10MB.' });
    }

    // Generate unique filename
    const ext = path.extname(file.originalName);
    const filename = `${crypto.randomBytes(16).toString('hex')}${ext}`;
    const filePath = path.join(CERT_UPLOAD_DIR, filename);
    const fileUrl = `/uploads/certificates/${filename}`;

    // Save to disk
    fs.writeFileSync(filePath, buffer);

    // Save record to database
    const certificate = await prisma.certificate.create({
      data: {
        studentId: student.id,
        title,
        description: description || null,
        fileUrl,
        fileKey: filename,
        mimeType: file.mimeType,
        fileSize,
      },
    });

    res.status(201).json({
      message: 'Certificate uploaded successfully',
      certificate: {
        id: certificate.id,
        title: certificate.title,
        description: certificate.description,
        fileUrl: certificate.fileUrl,
        mimeType: certificate.mimeType,
        fileSize: certificate.fileSize,
        verified: certificate.verified,
        createdAt: certificate.createdAt.toISOString(),
      },
    });
  })
);

// List student's certificates
router.get(
  '/',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const student = await prisma.student.findUnique({
      where: { userId: req.user!.id },
      include: {
        certificates: {
          select: {
            id: true,
            title: true,
            description: true,
            fileUrl: true,
            mimeType: true,
            fileSize: true,
            verified: true,
            verifiedAt: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!student) {
      return res.status(404).json({ error: 'Student profile not found' });
    }

    res.json({ certificates: student.certificates });
  })
);

// Delete a certificate
router.delete(
  '/:id',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const certificate = await prisma.certificate.findUnique({
      where: { id: req.params.id },
      include: { student: true },
    });

    if (!certificate || certificate.student.userId !== req.user!.id) {
      return res.status(404).json({ error: 'Certificate not found' });
    }

    // Delete file from disk
    const filePath = path.join(CERT_UPLOAD_DIR, certificate.fileKey);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await prisma.certificate.delete({ where: { id: req.params.id } });

    res.json({ message: 'Certificate deleted successfully' });
  })
);

export default router;
