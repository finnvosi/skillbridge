import { Router, Response } from 'express';
import { prisma } from '../db/prisma';
import { asyncHandler } from '../middleware/validation';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// Employer talent search — browse students with filters.
router.get(
  '/',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    if (req.user!.role !== 'employer') {
      return res.status(403).json({ error: 'Only employers can search talent' });
    }

    const { skill, university, major, search, limit = '30' } = req.query as Record<
      string,
      string | undefined
    >;
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 30));

    const where: any = {};
    if (skill) where.skills = { hasSome: [skill] };
    if (university) where.university = { contains: university, mode: 'insensitive' };
    if (major) where.major = { contains: major, mode: 'insensitive' };
    if (search) {
      where.OR = [
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { university: { contains: search, mode: 'insensitive' } },
        { major: { contains: search, mode: 'insensitive' } },
        { skills: { hasSome: [search] } },
      ];
    }

    const students = await prisma.student.findMany({
      where,
      take: limitNum,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true, avatar: true } },
        certificates: { select: { id: true, verified: true } },
        _count: { select: { applications: true } },
      },
    });

    const results = students.map((s: any) => ({
      id: s.id,
      name: s.user.name,
      email: s.user.email,
      avatar: s.user.avatar,
      university: s.university,
      major: s.major,
      graduationYear: s.graduationYear,
      skills: s.skills,
      certCount: s.certificates.length,
      verifiedCertCount: s.certificates.filter((c: any) => c.verified).length,
      applicationCount: s._count.applications,
    }));

    res.json({ students: results, total: results.length });
  })
);

export default router;
