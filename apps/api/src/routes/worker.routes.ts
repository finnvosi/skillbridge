import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../db/prisma';
import { asyncHandler, validate } from '../middleware/validation';

// ===========================================================================
// Worker vertical slice API
// Cambodia-first blue-collar worker app. Unauthenticated for the local demo
// slice (the mobile app has no auth yet). Replace `workerId` headers/params
// with real auth once the worker identity flow lands.
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
    workerId: z.string().min(1),
    jobId: z.string().min(1),
    // Optional: what the worker chooses to share from their passport.
    shareWorkRecords: z.boolean().default(false),
  }),
});

const workerIdParam = z.object({
  params: z.object({ workerId: z.string().min(1) }),
});

function shiftEnum(s: string) {
  return (['day', 'night', 'rotating', 'flexible'] as const).includes(s as any)
    ? (s as any)
    : undefined;
}

// ---- GET /api/v1/worker/jobs ----------------------------------------------

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

// ---- GET /api/v1/worker/jobs/:id -------------------------------------------

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

// ---- POST /api/v1/worker/applications --------------------------------------

router.post(
  '/applications',
  validate(applySchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { workerId, jobId, shareWorkRecords } = (req as any).body;
    const worker = await prisma.workerProfile.findUnique({
      where: { id: workerId },
    });
    if (!worker)
      return res.status(404).json({ error: 'Worker not found' });
    const job = await prisma.job.findUnique({ where: { id: jobId } });
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

    res.status(201).json({
      applicationId: application.id,
      status: application.status,
      submittedAt: application.createdAt,
      shareWorkRecords,
    });
  }),
);

// ---- GET /api/v1/worker/workers/:workerId/applications ---------------------

router.get(
  '/workers/:workerId/applications',
  validate(workerIdParam),
  asyncHandler(async (req: Request, res: Response) => {
    const { workerId } = (req as any).params;
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

// ---- GET /api/v1/worker/workers/:workerId/passport -------------------------

router.get(
  '/workers/:workerId/passport',
  validate(workerIdParam),
  asyncHandler(async (req: Request, res: Response) => {
    const { workerId } = (req as any).params;
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

export default router;
