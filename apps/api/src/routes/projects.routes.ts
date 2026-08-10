import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../db/prisma';
import { asyncHandler, validate } from '../middleware/validation';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

const createProjectSchema = z.object({
  body: z.object({
    title: z.string().min(5),
    description: z.string().min(20),
    type: z.enum(['internship', 'part_time', 'freelance', 'full_time']),
    budget: z.number().positive().optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    skillsRequired: z.array(z.string()).min(1),
    location: z.string().optional(),
    remote: z.boolean().default(false),
  }),
});

const updateApplicationSchema = z.object({
  body: z.object({
    status: z.enum(['accepted', 'rejected', 'withdrawn']),
  }),
});

// List projects with filters + pagination
router.get(
  '/',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { type, skills, location, remote, search, page = '1', limit = '20' } = req.query as Record<
      string,
      string
    >;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));

    const where: any = {};
    if (type) where.type = type;
    if (remote === 'true') where.remote = true;
    if (location) where.location = { contains: location, mode: 'insensitive' };
    if (skills) {
      const arr = Array.isArray(skills) ? (skills as string[]) : [skills];
      where.skillsRequired = { hasSome: arr };
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: { employer: { include: { user: { select: { name: true } } } } },
      }),
      prisma.project.count({ where }),
    ]);

    res.json({ projects, total, page: pageNum, limit: limitNum });
  })
);

// Get the current student's applications with project info
// NOTE: must be declared BEFORE '/:id' so 'student' is not captured as :id
router.get(
  '/student/applications',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    if (req.user!.role !== 'student') {
      return res.status(403).json({ error: 'Only students can view their applications' });
    }

    const student = await prisma.student.findUnique({ where: { userId: req.user!.id } });
    if (!student) return res.status(404).json({ error: 'Student profile not found' });

    const applications = await prisma.application.findMany({
      where: { studentId: student.id },
      include: { project: { include: { employer: { include: { user: { select: { name: true } } } } } } },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ applications });
  })
);

// Get the current employer's own projects
// NOTE: declared before '/:id' so 'employer' is not captured as :id
router.get(
  '/employer/projects',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    if (req.user!.role !== 'employer') {
      return res.status(403).json({ error: 'Only employers can view their projects' });
    }
    const employer = await prisma.employer.findUnique({
      where: { userId: req.user!.id },
    });
    if (!employer) return res.status(404).json({ error: 'Employer profile not found' });

    const projects = await prisma.project.findMany({
      where: { employerId: employer.id },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { applications: true } },
      },
    });
    res.json({ projects });
  })
);

// Get all applications across the current employer's projects
router.get(
  '/employer/applications',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    if (req.user!.role !== 'employer') {
      return res.status(403).json({ error: 'Only employers can view applications' });
    }
    const employer = await prisma.employer.findUnique({
      where: { userId: req.user!.id },
    });
    if (!employer) return res.status(404).json({ error: 'Employer profile not found' });

    const applications = await prisma.application.findMany({
      where: { project: { employerId: employer.id } },
      include: {
        project: { select: { id: true, title: true } },
        student: { include: { user: { select: { name: true, email: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ applications });
  })
);

// Get project by ID
router.get(
  '/:id',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: { employer: { include: { user: { select: { name: true } } } } },
    });
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json({ project });
  })
);

// Create project (employers only)
router.post(
  '/',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    if (req.user!.role !== 'employer') {
      return res.status(403).json({ error: 'Only employers can create projects' });
    }

    const employer = await prisma.employer.findUnique({ where: { userId: req.user!.id } });
    if (!employer) return res.status(403).json({ error: 'Employer profile not found' });

    const {
      title,
      description,
      type,
      budget,
      startDate,
      endDate,
      skillsRequired,
      location,
      remote,
    } = req.body;

    const project = await prisma.project.create({
      data: {
        title,
        description,
        type,
        budget,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        skillsRequired,
        location,
        remote,
        employerId: employer.id,
      },
    });

    res.status(201).json({ message: 'Project created successfully', project });
  })
);

// Apply to project (students only)
router.post(
  '/:id/apply',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    if (req.user!.role !== 'student') {
      return res.status(403).json({ error: 'Only students can apply to projects' });
    }

    const project = await prisma.project.findUnique({ where: { id: req.params.id } });
    if (!project) return res.status(404).json({ error: 'Project not found' });
    if (project.status !== 'open') {
      return res.status(400).json({ error: 'Project is not accepting applications' });
    }

    const student = await prisma.student.findUnique({ where: { userId: req.user!.id } });
    if (!student) return res.status(403).json({ error: 'Student profile not found' });

    const existing = await prisma.application.findUnique({
      where: { projectId_studentId: { projectId: project.id, studentId: student.id } },
    });
    if (existing) {
      return res.status(409).json({ error: 'You have already applied to this project' });
    }

    const { coverLetter, proposedBudget } = req.body;

    const application = await prisma.application.create({
      data: {
        projectId: project.id,
        studentId: student.id,
        coverLetter,
        proposedBudget,
        status: 'pending',
      },
    });

    res.status(201).json({ message: 'Application submitted successfully', application });
  })
);

// Get applications for a project (owner employer or admin)
router.get(
  '/:id/applications',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const project = await prisma.project.findUnique({ where: { id: req.params.id } });
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const isOwner = await prisma.employer.findFirst({
      where: { id: project.employerId, userId: req.user!.id },
    });
    if (!isOwner && req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const applications = await prisma.application.findMany({
      where: { projectId: project.id },
      include: {
        student: { include: { user: { select: { name: true, email: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ applications });
  })
);

// Update application status (owner employer or admin)
router.put(
  '/:projectId/applications/:applicationId',
  authenticate,
  validate(updateApplicationSchema),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { status } = req.body;
    const { applicationId, projectId } = req.params;

    const application = await prisma.application.findUnique({ where: { id: applicationId } });
    if (!application) return res.status(404).json({ error: 'Application not found' });
    if (application.projectId !== projectId) {
      return res.status(400).json({ error: 'Application does not belong to this project' });
    }

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const isOwner = await prisma.employer.findFirst({
      where: { id: project.employerId, userId: req.user!.id },
    });
    if (!isOwner && req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updated = await prisma.application.update({
      where: { id: applicationId },
      data: { status },
    });

    res.json({ message: 'Application status updated', application: updated });
  })
);

export default router;
