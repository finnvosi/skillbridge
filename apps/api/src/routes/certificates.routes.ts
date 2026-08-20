import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../db/prisma';
import { asyncHandler, validate } from '../middleware/validation';
import { authenticate, AuthRequest } from '../middleware/auth';
import {
  assertCertificateSignature,
  buildCertificateKey,
  createCertificateDownloadUrl,
  decodeCertificateBase64,
  deleteCertificateObject,
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

function validationMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Invalid certificate file';
}

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
          // This field stores the private object key. It is never returned as a public URL.
          fileUrl: fileKey,
          fileKey,
          mimeType: file.mimeType,
          fileSize: buffer.length,
        },
      });
      const signedUrl = await createCertificateDownloadUrl(fileKey);

      return res.status(201).json({
        message: 'Certificate uploaded successfully',
        certificate: {
          id: certificate.id,
          title: certificate.title,
          description: certificate.description,
          fileUrl: signedUrl,
          mimeType: certificate.mimeType,
          fileSize: certificate.fileSize,
          verified: certificate.verified,
          createdAt: certificate.createdAt.toISOString(),
        },
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
            fileUrl: true,
            fileKey: true,
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

    const certificates = await Promise.all(
      student.certificates.map(async (certificate) => ({
        id: certificate.id,
        title: certificate.title,
        description: certificate.description,
        fileUrl: await createCertificateDownloadUrl(certificate.fileKey),
        mimeType: certificate.mimeType,
        fileSize: certificate.fileSize,
        verified: certificate.verified,
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
