"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { apiRequest, API_ENDPOINTS, getToken } from "@/lib/api-client";
import { Project, Application } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import {
  PageHeader,
  StatCard,
  SectionHeader,
} from "@/components/layout/page-header";
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
  { label: "Applied", key: "applied", tone: "bg-primary" },
  { label: "In review", key: "reviewing", tone: "bg-amber-400" },
  { label: "Accepted", key: "accepted", tone: "bg-green-500" },
  { label: "Rejected", key: "rejected", tone: "bg-red-400" },
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
  return pal[
    Math.abs(
      Array.from(name).reduce((a, c) => a + c.charCodeAt(0), 0)
    ) % pal.length
  ];
}

/** Bold purple hero anchor with animated completion ring + CountUp. */
function HeroPanel({
  score,
  needsReview,
  onPostOpportunity,
}: {
  score: number;
  needsReview: number;
  onPostOpportunity: () => void;
}) {
  const pct = Math.max(0, Math.min(100, score));
  const RADIUS = 52;
  const CIRC = Math.round(2 * Math.PI * RADIUS); // ~327
  const dashoffset = CIRC * (1 - pct / 100);
  return (
    <Card className="relative isolate overflow-hidden border border-primary/20 bg-gradient-to-br from-primary to-[#5A189A] shadow-soft-lg">
      {/* ambient glow */}
      <div
        aria-hidden
        className="glow-purple pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-3xl opacity-40"
      />
      {/* grain */}
      <div
        aria-hidden
        className="bg-grain pointer-events-none absolute inset-0 mix-blend-overlay opacity-20"
      />
      {/* sheen hairline */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent"
      />
      <div className="relative flex flex-col gap-7 p-7 sm:flex-row sm:items-center sm:justify-between sm:p-10">
        <div className="flex items-center gap-7">
          {/* animated completion ring */}
          <div className="relative h-28 w-28 shrink-0 drop-shadow-lg">
            <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
              <circle
                cx="60"
                cy="60"
                r={RADIUS}
                fill="none"
                stroke="rgba(255,255,255,0.22)"
                strokeWidth="9"
              />
              <circle
                cx="60"
                cy="60"
                r={RADIUS}
                fill="none"
                stroke="#fff"
                strokeWidth="9"
                strokeLinecap="round"
                strokeDasharray={String(CIRC)}
                strokeDashoffset={dashoffset}
                className="transition-[stroke-dashoffset] duration-1000 ease-out"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center font-display text-2xl font-extrabold text-white">
              <CountUp value={pct} suffix="%" />
            </span>
          </div>
          <div className="max-w-md">
            <p className="font-mono text-xs font-medium uppercase tracking-[0.18em] text-white/70">
              Employer
            </p>
            <h1 className="display mt-2 text-3xl font-extrabold text-white sm:text-4xl">
              Talent Pipeline
            </h1>
            <p className="mt-2 text-sm text-white/80 sm:text-base">
              Discover students and manage your opportunities.
              {needsReview > 0 && (
                <>
                  {" "}
                  <span className="font-medium text-white">
                    {needsReview} candidate
                    {needsReview !== 1 ? "s" : ""}
                  </span>{" "}
                  awaiting your review.
                </>
              )}
            </p>
          </div>
        </div>
        <div className="shrink-0 sm:text-right">
          <Magnetic>
            <Button
              size="lg"
              className="w-full bg-white text-primary hover:bg-white/90 sm:w-auto"
              onClick={onPostOpportunity}
            >
              Post opportunity
            </Button>
          </Magnetic>
        </div>
      </div>
    </Card>
  );
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
        // keep previous / empty state
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const pendingApps = apps.filter((a) => a.status === "pending");
  const needsReview = pendingApps.length;
  const score = analytics ? analytics.talentScore : 0;

  if (loading) {
    return (
      <div className="space-y-8">
        <PageHeader eyebrow="Employer" title="Talent Pipeline" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SkeletonHero />
          <StatSkeleton />
          <StatSkeleton />
          <StatSkeleton />
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
      <div className="bg-grain absolute inset-0 -z-10 opacity-[0.18] mix-blend-multiply" />

      <div className="mx-auto max-w-7xl space-y-10">
        {/* ===== Bold purple hero anchor ===== */}
        <FadeUp>
          <HeroPanel
            score={score}
            needsReview={needsReview}
            onPostOpportunity={() => {
              window.location.href = "/dashboard/employer/projects/new";
            }}
          />
        </FadeUp>

        {/* ===== Frosted stat grid ===== */}
        <FadeUp delay={0.05}>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
              label="Match strength"
              value={
                analytics ? <CountUp value={analytics.acceptanceRate} suffix="%" /> : "—"
              }
              accent="text-purple-600"
              iconBg="bg-purple-500/10"
            />
          </div>
        </FadeUp>

        <div className="grid gap-10 xl:grid-cols-2">
          {/* ===== Hiring funnel ===== */}
          {analytics && analytics.funnel.applied > 0 && (
            <FadeUp delay={0.1}>
              <section>
                <SectionHeader
                  eyebrow="Analytics"
                  title="Hiring funnel"
                  action={
                    <Link
                      href="/dashboard/employer/analytics"
                      className="text-sm font-medium text-primary hover:text-primary-hover"
                    >
                      Full report
                    </Link>
                  }
                />
                <Card className="relative overflow-hidden border border-card-border bg-white/60 shadow-soft backdrop-blur-xl">
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent" />
                  <div className="p-5">
                    <div className="space-y-4">
                      {funnelSteps.map((step, i) => {
                        const v = analytics.funnel[step.key] as number;
                        const pctBar =
                          analytics.funnel.applied > 0
                            ? Math.round((v / analytics.funnel.applied) * 100)
                            : 0;
                        return (
                          <div
                            key={step.label}
                            className="flex items-center gap-3"
                          >
                            <FadeUp>
                              <span className="w-24 text-sm text-gray-600">
                                {step.label}
                              </span>
                              <div className="relative h-3 flex-1 overflow-hidden rounded-full bg-gray-100">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{
                                    width: `${Math.max(
                                      pctBar,
                                      v > 0 ? 6 : 0
                                    )}%`,
                                  }}
                                  transition={{
                                    duration: 0.9,
                                    ease: [0.16, 1, 0.3, 1],
                                    delay: i * 0.08,
                                  }}
                                  className={`h-full rounded-full ${step.tone}`}
                                />
                              </div>
                              <span className="w-10 text-right text-sm font-medium text-gray-900">
                                {v}
                              </span>
                            </FadeUp>
                          </div>
                        );
                      })}
                    </div>
                    {analytics.funnel.accepted +
                      analytics.funnel.rejected >
                      0 && (
                      <p className="mt-4 text-sm text-gray-500">
                        Acceptance rate:{" "}
                        <span className="font-medium text-gray-900">
                          {analytics.acceptanceRate}%
                        </span>
                      </p>
                    )}
                  </div>
                </Card>
              </section>
            </FadeUp>
          )}

          {/* ===== Talent Pipeline (pending applicants) ===== */}
          {pendingApps.length > 0 && (
            <FadeUp delay={0.12}>
              <section>
                <SectionHeader
                  eyebrow="Talent"
                  title="Needs your review"
                  action={
                    <Link
                      href="/dashboard/employer/applicants"
                      className="text-sm font-medium text-primary hover:text-primary-hover"
                    >
                      View all
                    </Link>
                  }
                />
                <Stagger className="space-y-3">
                  {pendingApps.map((app) => {
                    const name = app.student?.user?.name || "Candidate";
                    const initials = name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2);
                    const avatar = avatarColor(name);
                    return (
                      <StaggerItem key={app.id}>
                        <Tilt intensity={5}>
                          <Card className="group relative h-full flex-col items-start gap-3 p-0 shadow-soft hover:shadow-soft-lg">
                            <div
                              aria-hidden
                              className="pointer-events-none absolute -top-8 -right-8 h-20 w-20 rounded-full bg-primary/10 opacity-0 blur-2xl transition-opacity group-hover:opacity-60"
                            />
                            <div className="flex items-center gap-3 p-4">
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
                              <Badge variant="neutral" className="ml-auto">
                                {app.status}
                              </Badge>
                            </div>
                            <div className="flex w-full gap-2 p-4 pt-0">
                              <Magnetic className="flex-1">
                                <Button size="sm" variant="outline" className="w-full">
                                  <MessageCircle className="h-3.5 w-3.5" />
                                  Message
                                </Button>
                              </Magnetic>
                              <Magnetic className="flex-1">
                                <Button size="sm" className="w-full">
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
        </div>

        {/* ===== Opportunities ===== */}
        <FadeUp delay={0.2}>
          <section>
            <SectionHeader
              eyebrow="Opportunities"
              title="Your opportunities"
              action={
                <Link
                  href="/dashboard/employer/projects"
                  className="text-sm font-medium text-primary hover:text-primary-hover"
                >
                  Manage all
                </Link>
              }
            />
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
              <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {projects.slice(0, 6).map((p, i) => (
                  <StaggerItem key={p.id}>
                    <OpportunityCard
                      project={p}
                      onApply={undefined}
                      showActions={false}
                    />
                  </StaggerItem>
                ))}
              </Stagger>
            )}
          </section>
        </FadeUp>
      </div>
    </section>
  );
}

function StatSkeleton() {
  return (
    <div className="h-24 w-full animate-pulse rounded-2xl bg-gray-200/60" />
  );
}
function SkeletonHero() {
  return (
    <div className="h-40 w-full animate-pulse rounded-2xl bg-gradient-to-br from-primary/20 to-purple-400/30" />
  );
}

// (end)
