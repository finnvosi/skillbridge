import { Router, Response } from "express";
import { prisma } from "../db/prisma";
import { asyncHandler } from "../middleware/validation";
import { authenticate, AuthRequest } from "../middleware/auth";

const router = Router();

// Employer hiring analytics — real funnel computed from application statuses.
router.get(
  "/employer/analytics",
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const employer = await prisma.employer.findUnique({
      where: { userId: req.user!.id },
    });
    if (!employer) return res.status(404).json({ error: "Employer not found" });

    // All applications across this employer's projects.
    const applications = await prisma.application.findMany({
      where: { project: { employerId: employer.id } },
      select: { status: true },
    });

    const counts = applications.reduce(
      (acc, a) => {
        acc[a.status] = (acc[a.status] ?? 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const applied = applications.length;
    const submitted = counts["pending"] ?? 0;
    const reviewing = counts["reviewing"] ?? 0;
    const shortlisted = counts["shortlisted"] ?? 0;
    const accepted = counts["accepted"] ?? 0;
    const hired = counts["hired"] ?? 0;
    const rejected = counts["rejected"] ?? 0;
    const withdrawn = counts["withdrawn"] ?? 0;

    // Talent score: share of decided applications that were accepted,
    // scaled to a 0–100 signal. Falls back to 0 when nothing is decided yet.
    const decided = accepted + rejected;
    const acceptanceRate = decided > 0 ? accepted / decided : 0;
    const talentScore = Math.round(acceptanceRate * 100);

    res.json({
      funnel: {
        applied,
        submitted,
        reviewing,
        shortlisted,
        accepted,
        hired,
        rejected,
        withdrawn,
      },
      stageCounts: {
        pending: submitted,
        reviewing,
        shortlisted,
        accepted,
        hired,
        rejected,
        withdrawn,
      },
      semantics: {
        applied: "total_submitted_applications",
        stageCounts: "mutually_exclusive_current_status_counts",
      },
      acceptanceRate: Math.round(acceptanceRate * 1000) / 10, // percentage, 1 decimal
      talentScore,
    });
  }),
);

export default router;
