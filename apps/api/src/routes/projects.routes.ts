import { Router, Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../db/prisma";
import { asyncHandler, validate } from "../middleware/validation";
import { authenticate, AuthRequest } from "../middleware/auth";
import { ApplicationStatus } from "@prisma/client";
import {
  ApplicationNotFoundError,
  InvalidApplicationTransitionError,
  StaleApplicationStateError,
  transitionApplication,
} from "../domain/application-lifecycle";

const router = Router();

const createProjectSchema = z.object({
  body: z.object({
    title: z.string().min(5),
    description: z.string().min(20),
    type: z.enum(["internship", "part_time", "freelance", "full_time"]),
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
    status: z.enum([
      "reviewing",
      "shortlisted",
      "accepted",
      "hired",
      "rejected",
    ]),
    reviewNote: z.string().trim().max(2_000).optional(),
    candidateFeedback: z.string().trim().max(2_000).optional(),
  }),
});

async function hasEmployerAccess(
  employerId: string,
  user: NonNullable<AuthRequest["user"]>,
): Promise<boolean> {
  if (user.role === "admin") return true;
  if (user.role !== "employer") return false;
  const owner = await prisma.employer.findFirst({
    where: { id: employerId, userId: user.id },
    select: { id: true },
  });
  if (owner) return true;
  const member = await prisma.teamMember.findFirst({
    where: { employerId, email: user.email, status: "active" },
    select: { id: true },
  });
  return Boolean(member);
}

async function getEmployerForUser(user: NonNullable<AuthRequest["user"]>) {
  const owned = await prisma.employer.findUnique({
    where: { userId: user.id },
  });
  if (owned) return owned;
  const member = await prisma.teamMember.findFirst({
    where: { email: user.email, status: "active" },
    include: { employer: true },
  });
  return member?.employer ?? null;
}

// List projects with filters + pagination
router.get(
  "/",
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const {
      type,
      skills,
      location,
      remote,
      search,
      page = "1",
      limit = "20",
    } = req.query as Record<string, string>;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));

    const where: any = {};
    if (type) where.type = type;
    if (remote === "true") where.remote = true;
    if (location) where.location = { contains: location, mode: "insensitive" };
    if (skills) {
      const arr = Array.isArray(skills) ? (skills as string[]) : [skills];
      where.skillsRequired = { hasSome: arr };
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
        orderBy: { createdAt: "desc" },
        include: {
          employer: { include: { user: { select: { name: true } } } },
        },
      }),
      prisma.project.count({ where }),
    ]);

    res.json({ projects, total, page: pageNum, limit: limitNum });
  }),
);

// Get the current student's applications with project info
// NOTE: must be declared BEFORE '/:id' so 'student' is not captured as :id
router.get(
  "/student/applications",
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    if (req.user!.role !== "student") {
      return res
        .status(403)
        .json({ error: "Only students can view their applications" });
    }

    const student = await prisma.student.findUnique({
      where: { userId: req.user!.id },
    });
    if (!student)
      return res.status(404).json({ error: "Student profile not found" });

    const applications = await prisma.application.findMany({
      where: { studentId: student.id },
      select: {
        id: true,
        projectId: true,
        studentId: true,
        status: true,
        coverLetter: true,
        proposedBudget: true,
        candidateFeedback: true,
        createdAt: true,
        updatedAt: true,
        project: {
          include: {
            employer: { include: { user: { select: { name: true } } } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ applications });
  }),
);

// Get AI-matched projects for student (simple heuristic scorer)
router.get(
  "/student/match",
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    if (req.user!.role !== "student") {
      return res.status(403).json({ error: "Only students can get matches" });
    }

    const student = await prisma.student.findUnique({
      where: { userId: req.user!.id },
    });
    if (!student)
      return res.status(404).json({ error: "Student profile not found" });

    const projects = await prisma.project.findMany({
      where: { status: "open" },
      include: {
        employer: {
          include: { user: { select: { name: true, email: true } } },
        },
      },
    });

    const studentSkills = student.skills.map((s: string) => s.toLowerCase());

    // Simple heuristic match scorer
    const scored = projects.map((p: any) => {
      const projectSkills = p.skillsRequired.map((s: string) =>
        s.toLowerCase(),
      );

      // Skill overlap (40% weight)
      const skillMatches = studentSkills.filter((s: string) =>
        projectSkills.includes(s),
      );
      const skillScore =
        (skillMatches.length / Math.max(projectSkills.length, 1)) * 40;

      // Budget fit (20% weight) - higher budget = better fit
      const budgetScore = p.budget ? Math.min((p.budget / 1000) * 20, 20) : 0;

      // Type relevance (20% weight) - assume student prefers internship/parttime for now
      const typeBonus =
        p.type === "internship" || p.type === "part_time" ? 10 : 0;

      // Location match (20% weight)
      const locationScore = p.remote ? 20 : p.location ? 10 : 0;

      const totalScore = Math.round(
        skillScore + budgetScore + typeBonus + locationScore,
      );

      return {
        ...p,
        matchScore: totalScore,
        skillMatches,
      };
    });

    // Sort by match score descending
    scored.sort(
      (a: { matchScore: number }, b: { matchScore: number }) =>
        b.matchScore - a.matchScore,
    );

    res.json({ projects: scored });
  }),
);

// Withdrawals use a student-scoped route so another student's application id
// cannot be used for existence probing. POST remains as a compatibility alias.
const withdrawApplication = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    if (req.user!.role !== "student") {
      return res
        .status(403)
        .json({ error: "Only students can withdraw applications" });
    }

    const student = await prisma.student.findUnique({
      where: { userId: req.user!.id },
      select: { id: true },
    });
    if (!student)
      return res.status(404).json({ error: "Student profile not found" });

    const application = await prisma.application.findFirst({
      where: { id: req.params.applicationId, studentId: student.id },
      select: { id: true },
    });
    if (!application)
      return res.status(404).json({ error: "Application not found" });

    try {
      const result = await prisma.$transaction((tx) =>
        transitionApplication(tx, {
          applicationId: application.id,
          nextStatus: ApplicationStatus.withdrawn,
          actorId: req.user!.id,
          notifyStudent: false,
        }),
      );
      return res.json({ message: "Application withdrawn", ...result });
    } catch (error) {
      if (error instanceof InvalidApplicationTransitionError) {
        return res
          .status(400)
          .json({ error: "This application can no longer be withdrawn" });
      }
      if (error instanceof StaleApplicationStateError) {
        const latest = await prisma.application.findFirst({
          where: { id: application.id, studentId: student.id },
          select: { status: true },
        });
        if (latest?.status === ApplicationStatus.withdrawn) {
          return res
            .status(400)
            .json({ error: "This application can no longer be withdrawn" });
        }
        return res.status(409).json({ error: error.message });
      }
      if (error instanceof ApplicationNotFoundError) {
        return res.status(404).json({ error: "Application not found" });
      }
      throw error;
    }
  },
);

router.patch(
  "/student/applications/:applicationId/withdraw",
  authenticate,
  withdrawApplication,
);
router.post(
  "/applications/:applicationId/withdraw",
  authenticate,
  withdrawApplication,
);

// Get the current employer's own projects
// NOTE: declared before '/:id' so 'employer' is not captured as :id
router.get(
  "/employer/projects",
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    if (req.user!.role !== "employer" && req.user!.role !== "admin") {
      return res
        .status(403)
        .json({ error: "Only employers can view their projects" });
    }
    const employer = await getEmployerForUser(req.user!);
    if (!employer)
      return res.status(404).json({ error: "Employer profile not found" });

    const projects = await prisma.project.findMany({
      where: { employerId: employer.id },
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { applications: true } },
      },
    });
    res.json({ projects });
  }),
);

// Get all applications across the current employer's projects
router.get(
  "/employer/applications",
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    if (req.user!.role !== "employer" && req.user!.role !== "admin") {
      return res
        .status(403)
        .json({ error: "Only employers can view applications" });
    }
    const employer = await getEmployerForUser(req.user!);
    if (!employer)
      return res.status(404).json({ error: "Employer profile not found" });

    const applications = await prisma.application.findMany({
      where: { project: { employerId: employer.id } },
      include: {
        project: { select: { id: true, title: true } },
        student: { include: { user: { select: { name: true, email: true } } } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json({ applications });
  }),
);

// Get project by ID
router.get(
  "/:id",
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: { employer: { include: { user: { select: { name: true } } } } },
    });
    if (!project) return res.status(404).json({ error: "Project not found" });
    res.json({ project });
  }),
);

// Create project (employers only)
router.post(
  "/",
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    if (req.user!.role !== "employer") {
      return res
        .status(403)
        .json({ error: "Only employers can create projects" });
    }

    const employer = await prisma.employer.findUnique({
      where: { userId: req.user!.id },
    });
    if (!employer)
      return res.status(403).json({ error: "Employer profile not found" });

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

    res.status(201).json({ message: "Project created successfully", project });
  }),
);

// Apply to project (students only)
router.post(
  "/:id/apply",
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    if (req.user!.role !== "student") {
      return res
        .status(403)
        .json({ error: "Only students can apply to projects" });
    }

    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
    });
    if (!project) return res.status(404).json({ error: "Project not found" });
    if (project.status !== "open") {
      return res
        .status(400)
        .json({ error: "Project is not accepting applications" });
    }

    const student = await prisma.student.findUnique({
      where: { userId: req.user!.id },
    });
    if (!student)
      return res.status(403).json({ error: "Student profile not found" });

    const existing = await prisma.application.findUnique({
      where: {
        projectId_studentId: { projectId: project.id, studentId: student.id },
      },
    });
    if (existing) {
      return res
        .status(409)
        .json({ error: "You have already applied to this project" });
    }

    const { coverLetter, proposedBudget } = req.body;

    const application = await prisma.$transaction(async (tx) => {
      const created = await tx.application.create({
        data: {
          projectId: project.id,
          studentId: student.id,
          coverLetter,
          proposedBudget,
          status: "pending",
        },
      });
      await tx.applicationEvent.create({
        data: {
          applicationId: created.id,
          eventType: "application_submitted",
          actorId: req.user!.id,
        },
      });
      return created;
    });

    res
      .status(201)
      .json({ message: "Application submitted successfully", application });
  }),
);

// Get applications for a project (owner employer or admin)
router.get(
  "/:id/applications",
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
    });
    if (!project) return res.status(404).json({ error: "Project not found" });

    const hasAccess = await hasEmployerAccess(project.employerId, req.user!);
    if (!hasAccess) {
      return res.status(403).json({ error: "Access denied" });
    }

    const applications = await prisma.application.findMany({
      where: { projectId: project.id },
      include: {
        student: {
          include: {
            user: { select: { name: true, email: true } },
            certificates: {
              where: { verified: true },
              select: {
                id: true,
                title: true,
                verified: true,
                verifiedAt: true,
              },
              orderBy: { createdAt: "desc" },
            },
          },
        },
        statusHistory: {
          orderBy: { createdAt: "desc" },
          take: 10,
          select: {
            id: true,
            previousStatus: true,
            newStatus: true,
            reviewNote: true,
            candidateFeedback: true,
            actorId: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ applications });
  }),
);

// Update application status (owner employer or admin). PATCH is canonical;
// PUT remains for compatibility with older clients.
const updateApplicationStatus = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { status, reviewNote, candidateFeedback } = req.body as {
      status: ApplicationStatus;
      reviewNote?: string;
      candidateFeedback?: string;
    };
    const { applicationId, projectId } = req.params;

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { student: { select: { userId: true } } },
    });
    if (!application)
      return res.status(404).json({ error: "Application not found" });
    if (application.projectId !== projectId) {
      return res
        .status(400)
        .json({ error: "Application does not belong to this project" });
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) return res.status(404).json({ error: "Project not found" });

    const hasAccess = await hasEmployerAccess(project.employerId, req.user!);
    if (!hasAccess) {
      return res.status(403).json({ error: "Access denied" });
    }
    try {
      const result = await prisma.$transaction((tx) =>
        transitionApplication(tx, {
          applicationId: application.id,
          nextStatus: status,
          actorId: req.user!.id,
          reviewNote,
          candidateFeedback,
        }),
      );
      return res.json({ message: "Application status updated", ...result });
    } catch (error) {
      if (error instanceof InvalidApplicationTransitionError) {
        return res.status(400).json({ error: error.message });
      }
      if (error instanceof StaleApplicationStateError) {
        return res.status(409).json({ error: error.message });
      }
      if (error instanceof ApplicationNotFoundError) {
        return res.status(404).json({ error: "Application not found" });
      }
      throw error;
    }
  },
);

router.patch(
  "/:projectId/applications/:applicationId",
  authenticate,
  validate(updateApplicationSchema),
  updateApplicationStatus,
);

router.put(
  "/:projectId/applications/:applicationId",
  authenticate,
  validate(updateApplicationSchema),
  updateApplicationStatus,
);

// Generate contract for accepted application
router.post(
  "/applications/:applicationId/contract",
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { applicationId } = req.params;

    // Find the application
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        project: { include: { employer: { include: { user: true } } } },
        student: { include: { user: true } },
      },
    });

    if (!application)
      return res.status(404).json({ error: "Application not found" });
    if (application.status !== "accepted") {
      return res
        .status(400)
        .json({ error: "Only accepted applications can generate contracts" });
    }

    // Mock contract generation - in production this would:
    // 1. Build contract terms from project + application
    // 2. Send to PDF generation service (PDFShift, HelloSign, etc.)
    // 3. Store the signed URL

    const contractData = {
      id: `contract_${applicationId}`,
      projectId: application.projectId,
      student: application.student.user.name,
      employer: application.project.employer.user.name,
      salary: application.proposedBudget || application.project.budget,
      project: application.project.title,
      status: "pending_signatures",
      contractUrl: `https://example.com/contracts/contract_${applicationId}.pdf`,
      createdAt: new Date().toISOString(),
    };

    res.status(201).json({
      message: "Contract generated successfully",
      contract: contractData,
      signUrl: `https://example.com/sign/${applicationId}`,
    });
  }),
);

// ── Team management (employer teammates) ──────────────────────────────
const teamInviteSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Valid email required"),
    role: z.enum(["recruiter", "hiring_manager", "admin"]).default("recruiter"),
  }),
});

// List teammates for the authenticated employer
router.get(
  "/employer/team",
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const employer = await prisma.employer.findUnique({
      where: { userId: req.user!.id },
    });
    if (!employer) return res.status(404).json({ error: "Employer not found" });

    const members = await prisma.teamMember.findMany({
      where: { employerId: employer.id },
      orderBy: { createdAt: "asc" },
    });

    res.json({
      members: members.map((m) => ({
        id: m.id,
        name: m.name,
        email: m.email,
        role: m.role,
        status: m.status,
        createdAt: m.createdAt.toISOString(),
      })),
    });
  }),
);

// Invite a teammate
router.post(
  "/employer/team",
  authenticate,
  validate(teamInviteSchema),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const employer = await prisma.employer.findUnique({
      where: { userId: req.user!.id },
    });
    if (!employer) return res.status(404).json({ error: "Employer not found" });

    const { name, email, role } = req.body as {
      name: string;
      email: string;
      role: "recruiter" | "hiring_manager" | "admin";
    };

    const existing = await prisma.teamMember.findUnique({
      where: { employerId_email: { employerId: employer.id, email } },
    });
    if (existing)
      return res
        .status(409)
        .json({ error: "This teammate is already invited" });

    const member = await prisma.teamMember.create({
      data: { employerId: employer.id, name, email, role, status: "invited" },
    });

    res.status(201).json({
      member: {
        id: member.id,
        name: member.name,
        email: member.email,
        role: member.role,
        status: member.status,
        createdAt: member.createdAt.toISOString(),
      },
    });
  }),
);

// Remove a teammate
router.delete(
  "/employer/team/:id",
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const employer = await prisma.employer.findUnique({
      where: { userId: req.user!.id },
    });
    if (!employer) return res.status(404).json({ error: "Employer not found" });

    const member = await prisma.teamMember.findFirst({
      where: { id: req.params.id, employerId: employer.id },
    });
    if (!member)
      return res.status(404).json({ error: "Team member not found" });

    await prisma.teamMember.delete({ where: { id: member.id } });
    res.json({ message: "Team member removed" });
  }),
);

export default router;
