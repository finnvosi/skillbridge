import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../db/prisma';
import { asyncHandler, validate } from '../middleware/validation';
import { authenticate, AuthRequest } from '../middleware/auth';
import {
  assertCertificateSignature,
  buildCertificateKey,
  createCertificateDownloadUrl,
  createCertificateUploadUrl,
  decodeCertificateBase64,
  deleteCertificateObject,
  downloadCertificateObject,
  isManagedCertificateKey,
  uploadCertificateObject,
  validateCertificateMetadata,
} from '../services/certificate-storage';

const router = Router();

const uploadSchema = z.object({
  body: z.object({
    title: z.string().trim().min(1, 'Title is required').max(160),
    description: z.string().trim().max(2000).optional(),
    file: z.object({
      base64: z.string().min(1, 'File data is required'),
      mimeType: z.string().min(1, 'MIME type is required'),
      originalName: z.string().trim().min(1, 'Original filename is required').max(255),
    }),
  }),
});

const uploadUrlSchema = z.object({
  body: z.object({
    mimeType: z.string().min(1, 'MIME type is required'),
    originalName: z.string().trim().min(1, 'Original filename is required').max(255),
    fileSize: z.number().int().positive(),
  }),
});

const completeSchema = z.object({
  body: z.object({
    title: z.string().trim().min(1, 'Title is required').max(160),
    description: z.string().trim().max(2000).optional(),
    fileKey: z.string().min(1, 'File key is required'),
    mimeType: z.string().min(1, 'MIME type is required'),
    originalName: z.string().trim().min(1, 'Original filename is required').max(255),
    fileSize: z.number().int().positive(),
  }),
});

function validationMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Invalid certificate file';
}

function certificateResponse(
  certificate: {
    id: string;
    title: string;
    description: string | null;
    mimeType: string;
    fileSize: number;
    verified: boolean;
    createdAt: Date;
  },
  fileUrl: string | null,
) {
  return {
    id: certificate.id,
    title: certificate.title,
    description: certificate.description,
    fileUrl,
    mimeType: certificate.mimeType,
    fileSize: certificate.fileSize,
    verified: certificate.verified,
    createdAt: certificate.createdAt.toISOString(),
  };
}

router.post(
  '/upload-url',
  authenticate,
  validate(uploadUrlSchema),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    if (req.user!.role !== 'student') {
      return res.status(403).json({ error: 'Only students can upload certificates' });
    }
    const student = await prisma.student.findUnique({ where: { userId: req.user!.id } });
    if (!student) return res.status(403).json({ error: 'Student profile not found' });

    const { mimeType, originalName, fileSize } = req.body;
    let extension: string;
    try {
      extension = validateCertificateMetadata(mimeType, originalName, fileSize);
    } catch (error) {
      return res.status(400).json({ error: validationMessage(error) });
    }

    const fileKey = buildCertificateKey(student.id, extension);
    const upload = await createCertificateUploadUrl(fileKey);
    return res.json({ upload: { ...upload, expiresIn: 300 } });
  }),
);

router.post(
  '/complete',
  authenticate,
  validate(completeSchema),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    if (req.user!.role !== 'student') {
      return res.status(403).json({ error: 'Only students can complete certificate uploads' });
    }
    const student = await prisma.student.findUnique({ where: { userId: req.user!.id } });
    if (!student) return res.status(403).json({ error: 'Student profile not found' });

    const { title, description, fileKey, mimeType, originalName, fileSize } = req.body;
    if (!isManagedCertificateKey(fileKey, student.id)) {
      return res.status(400).json({ error: 'Invalid certificate upload key' });
    }

    let storedBuffer: Buffer;
    try {
      validateCertificateMetadata(mimeType, originalName, fileSize);
      const downloaded = await downloadCertificateObject(fileKey);
      if (!downloaded || downloaded.length !== fileSize) {
        return res.status(400).json({ error: 'Uploaded file size does not match metadata' });
      }
      assertCertificateSignature(downloaded, mimeType);
      storedBuffer = downloaded;
    } catch (error) {
      return res.status(400).json({ error: validationMessage(error) });
    }

    const existing = await prisma.certificate.findFirst({ where: { fileKey } });
    if (existing) {
      const signedUrl = await createCertificateDownloadUrl(fileKey);
      return res.status(200).json({ certificate: certificateResponse(existing, signedUrl) });
    }

    try {
      const certificate = await prisma.certificate.create({
        data: {
          studentId: student.id,
          title,
          description: description || null,
          fileUrl: fileKey,
          fileKey,
          mimeType,
          fileSize: storedBuffer.length,
        },
      });
      const signedUrl = await createCertificateDownloadUrl(fileKey);
      return res.status(201).json({
        message: 'Certificate upload completed successfully',
        certificate: certificateResponse(certificate, signedUrl),
      });
    } catch (error) {
      await prisma.certificate.deleteMany({ where: { fileKey } }).catch(() => undefined);
      await deleteCertificateObject(fileKey).catch(() => undefined);
      throw error;
    }
  }),
);

// Backward-compatible server upload for existing mobile clients.
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

    let buffer: Buffer;
    let extension: string;
    try {
      buffer = decodeCertificateBase64(file.base64);
      extension = validateCertificateMetadata(file.mimeType, file.originalName, buffer.length);
      assertCertificateSignature(buffer, file.mimeType);
    } catch (error) {
      return res.status(400).json({ error: validationMessage(error) });
    }

    const fileKey = buildCertificateKey(student.id, extension);
    await uploadCertificateObject(fileKey, buffer, file.mimeType);

    try {
      const certificate = await prisma.certificate.create({
        data: {
          studentId: student.id,
          title,
          description: description || null,
          fileUrl: fileKey,
          fileKey,
          mimeType: file.mimeType,
          fileSize: buffer.length,
        },
      });
      const signedUrl = await createCertificateDownloadUrl(fileKey);
      return res.status(201).json({
        message: 'Certificate uploaded successfully',
        certificate: certificateResponse(certificate, signedUrl),
      });
    } catch (error) {
      await deleteCertificateObject(fileKey).catch(() => undefined);
      throw error;
    }
  }),
);

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
            fileKey: true,
            mimeType: true,
            fileSize: true,
            verified: true,
            verificationStatus: true,
            rejectionReason: true,
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

    const certificates = await Promise.all(
      student.certificates.map(async (certificate) => ({
        id: certificate.id,
        title: certificate.title,
        description: certificate.description,
        fileUrl: await createCertificateDownloadUrl(certificate.fileKey),
        mimeType: certificate.mimeType,
        fileSize: certificate.fileSize,
        verified: certificate.verified,
        verificationStatus: certificate.verificationStatus,
        rejectionReason:
          certificate.verificationStatus === 'rejected' ? certificate.rejectionReason : null,
        verifiedAt: certificate.verifiedAt,
        createdAt: certificate.createdAt,
        updatedAt: certificate.updatedAt,
      })),
    );

    return res.json({ certificates });
  }),
);

router.get(
  '/:id/download',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const certificate = await prisma.certificate.findUnique({
      where: { id: req.params.id },
      include: { student: true },
    });

    if (!certificate) return res.status(404).json({ error: 'Certificate not found' });

    const isOwner = certificate.student.userId === req.user!.id;
    const isAdmin = req.user!.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(404).json({ error: 'Certificate not found' });
    }

    const signedUrl = await createCertificateDownloadUrl(certificate.fileKey);
    if (!signedUrl) return res.status(410).json({ error: 'Certificate file is no longer available' });
    return res.json({ url: signedUrl, expiresIn: 300 });
  }),
);

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

    await deleteCertificateObject(certificate.fileKey);
    await prisma.certificate.delete({ where: { id: req.params.id } });

    return res.json({ message: 'Certificate deleted successfully' });
  }),
);

export default router;
