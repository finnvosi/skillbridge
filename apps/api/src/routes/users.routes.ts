import { Router, Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../db/prisma";
import { asyncHandler, validate } from "../middleware/validation";
import { authenticate, AuthRequest } from "../middleware/auth";

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

const opportunityType = z.enum([
  "internship",
  "part_time",
  "freelance",
  "full_time",
]);
const workPreference = z.enum(["remote", "onsite", "hybrid", "either"]);

const studentOnboardingSchema = z.object({
  university: z.string().trim().min(2).max(120),
  major: z.string().trim().min(2).max(120),
  graduationYear: z
    .number()
    .int()
    .min(new Date().getFullYear())
    .max(new Date().getFullYear() + 10),
  location: z.string().trim().min(2).max(120),
  skills: z.array(z.string().trim().min(1).max(60)).min(1).max(10),
  opportunityTypes: z.array(opportunityType).min(1).max(4),
  workPreference,
});

const employerOnboardingSchema = z.object({
  companyName: z.string().trim().min(2).max(160),
  position: z.string().trim().min(2).max(120),
  industry: z.string().trim().min(2).max(120),
  companySize: z.number().int().min(1).max(1_000_000),
  website: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.string().trim().url().max(240).optional(),
  ),
  location: z.string().trim().min(2).max(120),
  hiringTypes: z.array(opportunityType).min(1).max(4),
  hiringSkills: z.array(z.string().trim().min(1).max(60)).min(1).max(10),
  workPreference,
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
      location: user.student.location,
      opportunityTypes: user.student.opportunityTypes,
      workPreference: user.student.workPreference,
    };
  }
  if (user?.employer) {
    return {
      companyName: user.employer.companyName,
      position: user.employer.position,
      industry: user.employer.industry,
      companySize: user.employer.companySize,
      website: user.employer.website,
      location: user.employer.location,
      hiringTypes: user.employer.hiringTypes,
      hiringSkills: user.employer.hiringSkills,
      workPreference: user.employer.workPreference,
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
    return { skills: user.worker.skills, available: user.worker.available };
  }
  return {};
}

function ownUserShape(user: any) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    onboardingStep: user.onboardingStep,
    onboardingCompleted: Boolean(user.onboardingCompletedAt),
    profile: profileShape(user),
  };
}

// Get own profile
router.get(
  "/profile",
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const user = await getUserWithProfile(req.user!.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({ user: ownUserShape(user) });
  }),
);

// Complete the progressive, role-specific onboarding flow.
router.put(
  "/onboarding",
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const user = await getUserWithProfile(req.user!.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.role !== "student" && user.role !== "employer") {
      return res.status(403).json({
        error: "Onboarding is only available to students and employers",
      });
    }

    if (user.role === "student") {
      const parsed = studentOnboardingSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          error: "Validation failed",
          details: parsed.error.errors.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
          })),
        });
      }

      await prisma.$transaction([
        prisma.student.upsert({
          where: { userId: user.id },
          create: { userId: user.id, ...parsed.data },
          update: parsed.data,
        }),
        prisma.user.update({
          where: { id: user.id },
          data: { onboardingStep: 3, onboardingCompletedAt: new Date() },
        }),
      ]);
    } else {
      const parsed = employerOnboardingSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          error: "Validation failed",
          details: parsed.error.errors.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
          })),
        });
      }

      await prisma.$transaction([
        prisma.employer.upsert({
          where: { userId: user.id },
          create: { userId: user.id, ...parsed.data },
          update: parsed.data,
        }),
        prisma.user.update({
          where: { id: user.id },
          data: { onboardingStep: 3, onboardingCompletedAt: new Date() },
        }),
      ]);
    }

    const updated = await getUserWithProfile(user.id);
    res.json({
      message: "Onboarding completed successfully",
      user: ownUserShape(updated),
    });
  }),
);

// Update own profile
router.put(
  "/profile",
  authenticate,
  validate(updateProfileSchema),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const {
      name,
      university,
      major,
      graduationYear,
      skills,
      companyName,
      industry,
      companySize,
    } = req.body;

    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user) return res.status(404).json({ error: "User not found" });

    // Update base User fields
    if (name) {
      await prisma.user.update({ where: { id: user.id }, data: { name } });
    }

    // Update role-specific profile
    if (user.role === "student") {
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
    } else if (user.role === "employer") {
      await prisma.employer.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          companyName: companyName ?? name ?? "Unknown Company",
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
      message: "Profile updated successfully",
      user: ownUserShape(updated),
    });
  }),
);

router.get(
  "/notifications",
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId: req.user!.id },
        orderBy: { createdAt: "desc" },
        take: limit,
        select: {
          id: true,
          applicationId: true,
          type: true,
          title: true,
          body: true,
          readAt: true,
          createdAt: true,
        },
      }),
      prisma.notification.count({
        where: { userId: req.user!.id, readAt: null },
      }),
    ]);
    res.json({ notifications, unreadCount });
  }),
);

router.patch(
  "/notifications/:id/read",
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const notification = await prisma.notification.updateMany({
      where: { id: req.params.id, userId: req.user!.id },
      data: { readAt: new Date() },
    });
    if (notification.count !== 1)
      return res.status(404).json({ error: "Notification not found" });
    res.json({ message: "Notification marked as read" });
  }),
);

router.post(
  "/notifications/read-all",
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await prisma.notification.updateMany({
      where: { userId: req.user!.id, readAt: null },
      data: { readAt: new Date() },
    });
    res.json({ message: "Notifications marked as read", count: result.count });
  }),
);

// Get all users (admin only)
router.get(
  "/",
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    if (req.user!.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }

    const {
      role,
      page = "1",
      limit = "20",
    } = req.query as Record<string, string>;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));

    const where = role ? { role: role as any } : {};
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
        },
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
  }),
);

// Get user by ID
router.get(
  "/:id",
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const user = await getUserWithProfile(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        profile: profileShape(user),
      },
    });
  }),
);

// Change user role (admin only)
router.put(
  "/:id/role",
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    if (req.user!.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }
    const { role } = req.body as { role: "student" | "employer" | "admin" };

    if (!["student", "employer", "admin"].includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    // If changing from student, remove student profile
    if (role !== "student") {
      await prisma.student.deleteMany({ where: { userId: req.params.id } });
    }
    // If changing from employer, remove employer profile
    if (role !== "employer") {
      await prisma.employer.deleteMany({ where: { userId: req.params.id } });
    }

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { role },
    });

    res.json({ message: "Role updated", user });
  }),
);

export default router;
