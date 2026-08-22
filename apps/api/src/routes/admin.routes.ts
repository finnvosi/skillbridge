import { Router, Request, Response } from 'express';
import { prisma } from '../db/prisma';
import { asyncHandler } from '../middleware/validation';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { createCertificateDownloadUrl } from '../services/certificate-storage';

const router = Router();

// All admin routes require the admin role
router.use(authenticate, authorize('admin'));

// Platform overview stats
router.get(
  '/overview',
  asyncHandler(async (_req: AuthRequest, res: Response) => {
    const [students, employers, opportunities, applications] = await Promise.all([
      prisma.user.count({ where: { role: 'student' } }),
      prisma.user.count({ where: { role: 'employer' } }),
      prisma.project.count(),
      prisma.application.count(),
    ]);
    res.json({ students, employers, opportunities, applications });
  })
);

// List pending verifications (students without university, unverified employers)
router.get(
  '/verifications',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const studentsNeedingVerify = await prisma.student.findMany({
      where: { university: null },
      include: { user: { select: { name: true, email: true } } },
      take: 50,
    });

    const employersNeedingVerify = await prisma.employer.findMany({
      where: { verified: false },
      include: { user: { select: { name: true, email: true } } },
      take: 50,
    });

    res.json({
      students: studentsNeedingVerify.map((s: any) => ({
        id: s.id,
        type: 'student' as const,
        name: s.user.name,
        email: s.user.email,
        major: s.major,
        createdAt: s.createdAt,
      })),
      employers: employersNeedingVerify.map((e: any) => ({
        id: e.id,
        type: 'employer' as const,
        name: e.companyName || e.user.name,
        email: e.user.email,
        industry: e.industry,
        verified: e.verified,
        createdAt: e.createdAt,
        userId: e.userId,
      })),
    });
  })
);

// Verify a student or employer
router.put(
  '/verifications/:type/:id',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { type, id } = req.params;
    
    if (type === 'student') {
      await prisma.student.update({
        where: { id },
        data: { university: 'Verified Student' },
      });
    } else if (type === 'employer') {
      await prisma.employer.update({
        where: { id },
        data: { verified: true, verifiedAt: new Date() },
      });
    }

    res.json({ message: `${type} verified successfully` });
  })
);

// List certificates awaiting review. Preview URLs are short-lived and admin-only.
router.get(
  '/certificates',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const requestedStatus = typeof req.query.status === 'string' ? req.query.status : 'pending';
    const status = ['pending', 'verified', 'rejected'].includes(requestedStatus)
      ? requestedStatus
      : 'pending';
    const certificates = await prisma.certificate.findMany({
      where: { verificationStatus: status as any },
      include: {
        student: { include: { user: { select: { name: true, email: true } } } },
      },
      orderBy: { createdAt: 'asc' },
      take: 100,
    });

    res.json({
      status,
      certificates: await Promise.all(
        certificates.map(async (certificate) => ({
          id: certificate.id,
          title: certificate.title,
          description: certificate.description,
          mimeType: certificate.mimeType,
          fileSize: certificate.fileSize,
          verificationStatus: certificate.verificationStatus,
          verificationNote: certificate.verificationNote,
          rejectionReason: certificate.rejectionReason,
          verifiedAt: certificate.verifiedAt,
          verifiedBy: certificate.verifiedBy,
          createdAt: certificate.createdAt,
          student: {
            id: certificate.student.id,
            name: certificate.student.user.name,
            email: certificate.student.user.email,
          },
          previewUrl: await createCertificateDownloadUrl(certificate.fileKey),
        })),
      ),
    });
  }),
);

// Approve or reject a certificate. Rejection requires a candidate-facing reason.
router.patch(
  '/certificates/:id',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { status, rejectionReason, verificationNote } = req.body as {
      status?: string;
      rejectionReason?: string;
      verificationNote?: string;
    };
    if (status !== 'verified' && status !== 'rejected') {
      return res.status(400).json({ error: 'Status must be verified or rejected' });
    }
    if (status === 'rejected' && (!rejectionReason || rejectionReason.trim().length < 3)) {
      return res.status(400).json({ error: 'A rejection reason is required' });
    }

    const existing = await prisma.certificate.findUnique({
      where: { id: req.params.id },
      include: { student: { select: { userId: true } } },
    });
    if (!existing) return res.status(404).json({ error: 'Certificate not found' });

    const previousStatus = existing.verificationStatus;

    const certificate = await prisma.$transaction(async (tx) => {
      const updated = await tx.certificate.update({
        where: { id: existing.id },
        data: {
          verificationStatus: status as any,
          verified: status === 'verified',
          verifiedAt: status === 'verified' ? new Date() : null,
          verifiedBy: req.user!.id,
          verificationNote: verificationNote?.trim() || null,
          rejectionReason: status === 'rejected' ? rejectionReason!.trim() : null,
        },
      });

      // Immutable audit row. `internalNote` is admin-only and must never be
      // surfaced to the student; `candidateReason` is the public rejection note.
      await tx.certificateVerificationHistory.create({
        data: {
          certificateId: updated.id,
          actorId: req.user!.id,
          previousStatus,
          newStatus: status as any,
          candidateReason:
            status === 'rejected' ? rejectionReason!.trim() : null,
          internalNote: verificationNote?.trim() || null,
        },
      });

      // Notify the student. Copy is candidate-safe: only the decision and, on
      // rejection, the candidate-facing reason. No internal verificationNote.
      await tx.notification.create({
        data: {
          userId: existing.student.userId,
          type: status === 'verified' ? 'certificate_verified' : 'certificate_rejected',
          title:
            status === 'verified'
              ? 'Certificate verified'
              : 'Certificate rejected',
          body:
            status === 'verified'
              ? `Your certificate "${existing.title}" has been verified.`
              : `Your certificate "${existing.title}" was rejected${
                  rejectionReason ? `: ${rejectionReason.trim()}` : ''
                }.`,
        },
      });

      return updated;
    });

    res.json({
      message: `Certificate ${status}`,
      certificate: {
        id: certificate.id,
        verificationStatus: certificate.verificationStatus,
        verified: certificate.verified,
        verifiedAt: certificate.verifiedAt,
        rejectionReason: certificate.rejectionReason,
      },
    });
  }),
);

// List opportunities (with applicant counts)
router.get(
  '/opportunities',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { page = '1', limit = '20' } = req.query as Record<string, string>;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const [opportunities, total] = await Promise.all([
      prisma.project.findMany({
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          employer: { include: { user: { select: { name: true } } } },
          _count: { select: { applications: true } },
        },
      }),
      prisma.project.count(),
    ]);
    res.json({
      opportunities,
      pagination: { page: pageNum, limit: limitNum, total },
    });
  })
);

// List applications
router.get(
  '/applications',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { page = '1', limit = '20' } = req.query as Record<string, string>;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          project: { select: { id: true, title: true } },
          student: { include: { user: { select: { name: true, email: true } } } },
        },
      }),
      prisma.application.count(),
    ]);
    res.json({
      applications,
      pagination: { page: pageNum, limit: limitNum, total },
    });
  })
);

// Delete a user (admin)
router.delete(
  '/users/:id',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'User not found' });
    if (existing.role === 'admin') {
      return res.status(400).json({ error: 'Cannot delete an admin user' });
    }
    await prisma.user.delete({ where: { id } });
    res.json({ message: 'User deleted successfully' });
  })
);

// Delete an opportunity (admin)
router.delete(
  '/opportunities/:id',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const existing = await prisma.project.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Opportunity not found' });
    await prisma.project.delete({ where: { id } });
    res.json({ message: 'Opportunity deleted successfully' });
  })
);

// Update an application status (admin)
router.put(
  '/applications/:id',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { status } = req.body as { status: string };
    const existing = await prisma.application.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Application not found' });
    const updated = await prisma.application.update({
      where: { id },
      data: { status: status as any },
    });
    res.json({ message: 'Application updated', application: updated });
  })
);

// ---- Worker application status (admin) --------------------------------------
// Advances a worker application's status and fires the in-app notification so
// the worker tracker + notification center reflect real decisions (blueprint:
// status tracking + push/in-app updates). Valid statuses mirror the
// WorkerApplicationStatus enum.

const WORKER_STATUS_COPY: Record<string, { title: string; body: (job: string, company: string) => string }> = {
  submitted: {
    title: 'Application submitted',
    body: (job, company) => `Applied to ${job} at ${company}`,
  },
  reviewing: {
    title: 'Application under review',
    body: (job, company) => `${company} is reviewing your application for ${job}.`,
  },
  shortlisted: {
    title: "You've been shortlisted",
    body: (job, company) => `Good news — ${company} shortlisted you for ${job}.`,
  },
  interview: {
    title: 'Interview scheduled',
    body: (job, company) => `${company} wants to interview you for ${job}.`,
  },
  hired: {
    title: 'You were hired',
    body: (job, company) => `Congratulations — ${company} hired you for ${job}.`,
  },
  rejected: {
    title: 'Application not accepted',
    body: (job, company) => `${company} did not accept your application for ${job}.`,
  },
  withdrawn: {
    title: 'Application withdrawn',
    body: (job, company) => `Your application for ${job} at ${company} was withdrawn.`,
  },
};

router.patch(
  '/worker-applications/:id/status',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { status } = req.body as { status: string };
    if (!WORKER_STATUS_COPY[status]) {
      return res.status(400).json({
        error: `Status must be one of: ${Object.keys(WORKER_STATUS_COPY).join(', ')}`,
      });
    }

    const existing = await prisma.workerApplication.findUnique({
      where: { id: req.params.id },
      include: {
        worker: { select: { userId: true } },
        job: { include: { company: true } },
      },
    });
    if (!existing) {
      return res.status(404).json({ error: 'Worker application not found' });
    }

    const updated = await prisma.workerApplication.update({
      where: { id: existing.id },
      data: { status: status as any },
    });

    // Notify the worker if their profile is linked to a User account.
    const workerUserId = existing.worker.userId;
    if (workerUserId) {
      const copy = WORKER_STATUS_COPY[status];
      await prisma.notification.create({
        data: {
          userId: workerUserId,
          type: 'application_status_changed',
          title: copy.title,
          body: copy.body(existing.job.title, existing.job.company.name),
        },
      });
    }

    res.json({
      message: `Worker application ${status}`,
      application: {
        id: updated.id,
        status: updated.status,
        notified: Boolean(workerUserId),
      },
    });
  })
);

// List user reports
router.get(
  '/reports',
  asyncHandler(async (_req: AuthRequest, res: Response) => {
    // Mock data - in production this would query a Report model
    const reports: any[] = [];
    res.json({ reports });
  })
);

export default router;