import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../db/prisma';
import { asyncHandler, validate } from '../middleware/validation';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// Profile update schema
const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    university: z.string().optional(),
    major: z.string().optional(),
    graduationYear: z.number().int().optional(),
    skills: z.array(z.string()).optional(),
    companyName: z.string().optional(),
    industry: z.string().optional(),
    companySize: z.number().int().optional(),
  }),
});

async function getUserWithProfile(id: string) {
  return prisma.user.findUnique({
    where: { id },
    include: { student: true, employer: true, factory: true, worker: true },
  });
}

function profileShape(user: any) {
  if (user?.student) {
    return {
      university: user.student.university,
      major: user.student.major,
      graduationYear: user.student.graduationYear,
      skills: user.student.skills,
    };
  }
  if (user?.employer) {
    return {
      companyName: user.employer.companyName,
      industry: user.employer.industry,
      companySize: user.employer.companySize,
      verified: user.employer.verified,
    };
  }
  if (user?.factory) {
    return {
      name: user.factory.name,
      location: user.factory.location,
      capacity: user.factory.capacity,
      verified: user.factory.verified,
    };
  }
  if (user?.worker) {
    return { skills: user.worker.skills };
  }
  return {};
}

// Get own profile
router.get(
  '/profile',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const user = await getUserWithProfile(req.user!.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        profile: profileShape(user),
      },
    });
  })
);

// Update own profile
router.put(
  '/profile',
  authenticate,
  validate(updateProfileSchema),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { name, university, major, graduationYear, skills, companyName, industry, companySize } =
      req.body;

    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Update base User fields
    if (name) {
      await prisma.user.update({ where: { id: user.id }, data: { name } });
    }

    // Update role-specific profile
    if (user.role === 'student') {
      await prisma.student.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          university: university ?? null,
          major: major ?? null,
          graduationYear: graduationYear ?? null,
          skills: skills ?? [],
        },
        update: {
          ...(university !== undefined ? { university } : {}),
          ...(major !== undefined ? { major } : {}),
          ...(graduationYear !== undefined ? { graduationYear } : {}),
          ...(skills !== undefined ? { skills } : {}),
        },
      });
    } else if (user.role === 'employer') {
      await prisma.employer.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          companyName: companyName ?? name ?? 'Unknown Company',
          industry: industry ?? null,
          companySize: companySize ?? 0,
        },
        update: {
          ...(companyName !== undefined ? { companyName } : {}),
          ...(industry !== undefined ? { industry } : {}),
          ...(companySize !== undefined ? { companySize } : {}),
        },
      });
    }

    const updated = await getUserWithProfile(req.user!.id);
    res.json({
      message: 'Profile updated successfully',
      user: {
        id: updated!.id,
        email: updated!.email,
        name: updated!.name,
        role: updated!.role,
        profile: profileShape(updated),
      },
    });
  })
);

// Get all users (admin only)
router.get(
  '/',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    if (req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { role, page = '1', limit = '20' } = req.query as Record<string, string>;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));

    const where = role ? { role: role as any } : {};
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        select: { id: true, email: true, name: true, role: true, createdAt: true },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      users,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  })
);

// Get user by ID
router.get(
  '/:id',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const user = await getUserWithProfile(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        profile: profileShape(user),
      },
    });
  })
);


// Change user role (admin only)
router.put(
  '/:id/role',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    if (req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    const { role } = req.body as { role: 'student' | 'employer' | 'admin' };
    
    if (!['student', 'employer', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    
    // If changing from student, remove student profile
    if (role !== 'student') {
      await prisma.student.deleteMany({ where: { userId: req.params.id } });
    }
    // If changing from employer, remove employer profile
    if (role !== 'employer') {
      await prisma.employer.deleteMany({ where: { userId: req.params.id } });
    }
    
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { role },
    });
    
    res.json({ message: 'Role updated', user });
  })
);


export default router;
