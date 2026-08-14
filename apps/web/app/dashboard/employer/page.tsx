"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { apiRequest, API_ENDPOINTS, getToken } from "@/lib/api-client";
import {
  Project,
  Application,
  TYPE_LABELS,
  STATUS_LABELS,
} from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader, StatCard } from "@/components/layout/page-header";
import { OpportunityCard } from "@/components/marketplace/opportunity-card";
import { CountUp, FadeUp, Stagger, StaggerItem, Tilt } from "@/components/motion";
import { Magnetic } from "@/components/motion/primitives2";
import {
  Briefcase,
  Users,
  Clock,
  Star,
  MessageCircle,
  CheckCircle2,
} from "lucide-react";

interface ProjectWithCount extends Project {
  _count?: { applications: number };
}

interface Analytics {
  funnel: {
    applied: number;
    reviewing: number;
    accepted: number;
    rejected: number;
    withdrawn: number;
  };
  acceptanceRate: number;
  talentScore: number;
}

const ACCENT = {
  bg: "bg-primary/10",
  ring: "text-primary",
  icon: "text-primary",
};

const funnelSteps = [
  { label: "Applied", tone: "bg-primary", ring: "bg-primary" },
  { label: "In review", tone: "bg-amber-400", ring: "bg-amber-400" },
  { label: "Accepted", tone: "bg-green-500", ring: "bg-green-500" },
  { label: "Rejected", tone: "bg-red-400", ring: "bg-red-400" },
] as const;

function avatarColor(name: string): string {
  const pal = [
    "bg-indigo-500",
    "bg-cyan-500",
    "bg-emerald-500",
    "bg-fuchsia-500",
    "bg-amber-500",
    "bg-rose-500",
  ];
  return pal[Math.abs(Array.from(name).reduce((a, c) => a + c.charCodeAt(0), 0)) % pal.length];
}

export default function EmployerDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<ProjectWithCount[]>([]);
  const [apps, setApps] = useState<Application[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const token = getToken();

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const [p, a, an] = await Promise.all([
          apiRequest<{ projects: ProjectWithCount[] }>(
            API_ENDPOINTS.projects.employerProjects,
            { method: "GET", token }
          ),
          apiRequest<{ applications: Application[] }>(
            API_ENDPOINTS.projects.employerApplications,
            { method: "GET", token }
          ),
          apiRequest<Analytics>(API_ENDPOINTS.analytics.employer, {
            method: "GET",
            token,
          }).catch(() => null),
        ]);
        setProjects(p.projects ?? []);
        setApps(a.applications ?? []);
        setAnalytics(an);
      } catch {
        // empty
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const pendingApps = apps.filter((a) => a.status === "pending");
  const needsReview = pendingApps.length;

  if (loading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 sm:grid-cols-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  return (
    <section className="relative isolate py-2">
      {/* titanium editorial canvas */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(680px_420px_at_70%_-10%,theme(colors.primary)/.06,transparent_60%)]"
      />
      <div className="bg-grain-strong absolute inset-0 -z-10 opacity-[0.25]" />

      <div className="mx-auto max-w-7xl">
        <FadeUp>
          <PageHeader
            eyebrow="Employer"
            title="Talent Pipeline"
            subtitle="Discover students and manage your opportunities."
            actions={
              <Magnetic>
                <Button asChild>
                  <Link href="/dashboard/employer/projects/new">
                    Post opportunity
                  </Link>
                </Button>
              </Magnetic>
            }
          />
        </FadeUp>

        {/* Stats row — corner-lit, frosted, animated */}
        <FadeUp delay={0.05}>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={Briefcase}
              label="Active opportunities"
              value={<CountUp value={projects.length} />}
              accent={ACCENT.ring}
              iconBg={ACCENT.bg}
            />
            <StatCard
              icon={Users}
              label="Total applicants"
              value={<CountUp value={apps.length} />}
              accent="text-gray-600"
              iconBg="bg-gray-500/10"
            />
            <StatCard
              icon={Clock}
              label="Needs review"
              value={<CountUp value={needsReview} />}
              accent="text-amber-600"
              iconBg="bg-amber-500/10"
            />
            <StatCard
              icon={Star}
              label="Talent score"
              value={analytics ? `${analytics.talentScore}%` : "—"}
              accent="text-purple-600"
              iconBg="bg-purple-500/10"
            />
          </div>
        </FadeUp>

        {/* Hiring funnel — depth track + motion bars */}
        {analytics && analytics.funnel.applied > 0 && (
          <FadeUp delay={0.1}>
            <section>
              <h2 className="mb-3 font-display text-xl font-semibold text-gray-900">
                Hiring funnel
              </h2>
              <Card className="p-5">
                <div className="space-y-4">
                  {funnelSteps.map((step, i) => {
                    const v = analytics!.funnel[
                      step.label === "Applied"
                        ? "applied"
                        : step.label === "In review"
                        ? "reviewing"
                        : step.label === "Accepted"
                        ? "accepted"
                        : "rejected"
                    ] as number;
                    const pct =
                      analytics.funnel.applied > 0
                        ? Math.round((v / analytics.funnel.applied) * 100)
                        : 0;
                    return (
                      <motion.div
                        key={step.label}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.08, duration: 0.5 }}
                        className="flex items-center gap-3"
                      >
                        <span className="w-24 text-sm text-gray-600">
                          {step.label}
                        </span>
                        <div className="relative h-3 flex-1 overflow-hidden rounded-full bg-gray-100">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{
                              width: `${Math.max(
                                pct,
                                v > 0 ? 6 : 0
                              )}%`,
                            }}
                            transition={{
                              duration: 0.8,
                              ease: [0.16, 1, 0.3, 1],
                              delay: i * 0.08,
                            }}
                            className={`h-full rounded-full ${step.tone}`}
                          />
                        </div>
                        <span className="w-10 text-right text-sm font-medium text-gray-900">
                          {v}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
                {analytics.funnel.accepted + analytics.funnel.rejected > 0 && (
                  <p className="mt-4 text-sm text-gray-500">
                    Acceptance rate:{" "}
                    <span className="font-medium text-gray-900">
                      {analytics.acceptanceRate}%
                    </span>
                  </p>
                )}
              </Card>
            </section>
          </FadeUp>
        )}

        {/* Pending applicants — elevated cards */}
        {pendingApps.length > 0 && (
          <FadeUp delay={0.15}>
            <section>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="font-display text-2xl font-semibold text-gray-900">
                    Talent Pipeline
                  </h2>
                  <p className="text-sm text-gray-500">
                    {needsReview} candidate
                    {needsReview !== 1 ? "s" : ""} awaiting review
                  </p>
                </div>
                <Link
                  href="/dashboard/employer/applicants"
                  className="text-sm font-medium text-primary hover:text-primary-hover"
                >
                  View all applicants
                </Link>
              </div>

              <Stagger className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {pendingApps.map((app, i) => {
                  const name = app.student?.user?.name || "Candidate";
                  const initials = name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2);
                  const avatar = avatarColor(name);
                  return (
                    <StaggerItem key={app.id} as="div">
                      <Tilt intensity={5}>
                        <Card className="group relative h-full flex-col items-start gap-3 p-0 shadow-soft hover:shadow-soft-lg">
                          <div
                            aria-hidden
                            className="pointer-events-none absolute -top-10 -right-10 h-24 w-24 rounded-full opacity-0 group-hover:opacity-50"
                            style={{
                              background:
                                "radial-gradient(circle, rgba(60,9,108,0.18) 0%, rgba(60,9,108,0) 70%)",
                            }}
                          />
                          <div className="flex items-center gap-3 p-4 pt-4">
                            <span
                              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-display text-sm font-bold text-white ${avatar}`}
                            >
                              {initials}
                            </span>
                            <div className="min-w-0">
                              <p className="font-display text-sm font-bold text-gray-900">
                                {name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {app.project?.title || "Opportunity"}
                              </p>
                              <p className="mt-0.5 text-xs text-gray-400">
                                Applied{" "}
                                {new Date(app.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex w-full gap-2 p-4 pt-0">
                            <Magnetic className="flex-1">
                              <Button
                                size="sm"
                                variant="outline"
                                className="w-full"
                              >
                                <MessageCircle className="h-3.5 w-3.5" />
                                Message
                              </Button>
                            </Magnetic>
                            <Magnetic className="flex-1">
                              <Button
                                size="sm"
                                variant="primary"
                                className="w-full"
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Review
                              </Button>
                            </Magnetic>
                          </div>
                        </Card>
                      </Tilt>
                    </StaggerItem>
                  );
                })}
              </Stagger>
            </section>
          </FadeUp>
        )}

        {/* Opportunities grid */}
        <FadeUp delay={0.2}>
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-2xl font-semibold text-gray-900">
                Your opportunities
              </h2>
              <Link
                href="/dashboard/employer/projects"
                className="text-sm font-medium text-primary hover:text-primary-hover"
              >
                Manage all
              </Link>
            </div>

            {projects.length === 0 ? (
              <EmptyState
                title="No opportunities posted yet"
                description="Post your first opportunity to start receiving applications from talented students."
                actionLabel="Post opportunity"
                onAction={() => {
                  window.location.href = "/dashboard/employer/projects/new";
                }}
              />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {projects.slice(0, 6).map((p, i) => (
                  <FadeUp key={p.id} delay={i * 0.05}>
                    <OpportunityCard
                      project={p}
                      onApply={undefined}
                      showActions={false}
                    />
                  </FadeUp>
                ))}
              </div>
            )}
          </section>
        </FadeUp>
      </div>
    </section>
  );
}

// keep label maps referenced (avoids unused lint errors if tree-shaken)
void STATUS_LABELS;
void TYPE_LABELS;
