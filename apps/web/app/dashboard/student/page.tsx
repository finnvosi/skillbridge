"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiRequest, API_ENDPOINTS, getToken } from "@/lib/api-client";
import { Project, Application, MatchedProject } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { SectionHeader, StatCard } from "@/components/layout/page-header";
import { OpportunityCard } from "@/components/marketplace/opportunity-card";
import { Sparkles, Briefcase, Users, CheckCircle2 } from "lucide-react";

interface DashboardData {
  profile: {
    university?: string | null;
    major?: string | null;
    graduationYear?: number | null;
    skills?: string[];
    bio?: string | null;
    location?: string | null;
    opportunityTypes?: string[];
    workPreference?: string | null;
  };
  stats: {
    matchedOpportunities: number;
    totalApplications: number;
    skillsCount: number;
  };
  matchedProjects: MatchedProject[];
  applications: Application[];
  certificates: { verified: boolean }[];
}

export default function StudentDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData>({
    profile: {},
    stats: { matchedOpportunities: 0, totalApplications: 0, skillsCount: 0 },
    matchedProjects: [],
    applications: [],
    certificates: [],
  });

  useEffect(() => {
    (async () => {
      const token = getToken();
      if (!token) return;

      try {
        const [profileRes, matchRes, appsRes, certsRes] = await Promise.all([
          apiRequest<{
            user: { name: string; profile: DashboardData["profile"] };
          }>(API_ENDPOINTS.users.profile, { method: "GET", token }),
          apiRequest<{ projects: MatchedProject[] }>(
            API_ENDPOINTS.projects.match,
            {
              method: "GET",
              token,
            },
          ),
          apiRequest<{ applications: Application[] }>(
            API_ENDPOINTS.projects.myApplications,
            { method: "GET", token },
          ),
          apiRequest<{ certificates: { verified: boolean }[] }>(
            API_ENDPOINTS.certificates.list,
            { method: "GET", token },
          ).catch(() => ({ certificates: [] })),
        ]);

        const profile = profileRes.user.profile || {};
        const skills = profile.skills || [];

        setData({
          profile,
          stats: {
            matchedOpportunities: matchRes.projects?.length || 0,
            totalApplications: appsRes.applications?.length || 0,
            skillsCount: skills.length,
          },
          matchedProjects: matchRes.projects || [],
          applications: appsRes.applications || [],
          certificates: certsRes.certificates || [],
        });
      } catch {
        // keep defaults
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const profileCompletion = (() => {
    let score = 0;
    if (data.profile.university) score += 15;
    if (data.profile.major) score += 10;
    if (data.profile.graduationYear) score += 5;
    if ((data.profile.bio?.length || 0) >= 100) score += 10;
    if (data.profile.location) score += 5;
    if ((data.profile.opportunityTypes?.length || 0) > 0) score += 5;
    if (data.profile.workPreference) score += 5;
    score += Math.min(data.stats.skillsCount, 5) * 5;
    score +=
      Math.min(
        data.certificates.filter((certificate) => certificate.verified).length,
        3,
      ) *
      (20 / 3);
    return Math.round(score);
  })();

  // Reverse-hiring insight: skills you're missing across the roles that matched you.
  const skillsToLearn = (() => {
    const have = new Set(
      (data.profile.skills ?? []).map((s) => s.toLowerCase()),
    );
    const counts: Record<string, number> = {};
    for (const project of data.matchedProjects) {
      for (const skill of project.skillsRequired ?? []) {
        if (!have.has(skill.toLowerCase())) {
          counts[skill] = (counts[skill] ?? 0) + 1;
        }
      }
    }
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([skill, count]) => ({ skill, count }));
  })();

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="grid gap-4 sm:grid-cols-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* HERO — reverse-hiring status */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-primary-light p-7 text-white shadow-soft-lg sm:p-9">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-12 -top-12 h-52 w-52 rounded-full bg-accent/25 blur-3xl"
        />
        <div
          aria-hidden
          className="bg-grain pointer-events-none absolute inset-0 opacity-20 mix-blend-overlay"
        />
        <p className="label-mono !text-white/70">Your reverse-hiring status</p>
        <h1 className="display mt-3 text-3xl text-white sm:text-4xl">
          {data.matchedProjects.length > 0
            ? `${data.matchedProjects.length} employers matched you`
            : "Build your profile — and they come to you"}
          <span className="mt-1 block text-white/90">before you apply.</span>
        </h1>
        <p className="mt-3 max-w-md text-sm text-white/80">
          Employers browse your verified skills and reach out first. Here&apos;s
          where you stand.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-sm ring-1 ring-white/20">
            <span className="h-2 w-2 rounded-full bg-accent" />{" "}
            {data.matchedProjects.length} viewing your profile
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-sm ring-1 ring-white/20">
            <span className="h-2 w-2 rounded-full bg-accent" />{" "}
            {data.stats.totalApplications} applications sent
          </span>
        </div>
        <div className="mt-6">
          <Link
            href="/dashboard/student/profile"
            className="btn rounded-full bg-white px-6 py-3 font-semibold text-primary hover:bg-white/90"
          >
            Complete my profile
          </Link>
        </div>
      </section>

      {/* STATS */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={Briefcase}
          label="Employers matched"
          value={data.stats.matchedOpportunities}
          accent="text-primary"
        />
        <StatCard
          icon={CheckCircle2}
          label="Skills verified"
          value={data.stats.skillsCount}
          accent="text-teal-600"
        />
        <StatCard
          icon={Users}
          label="Applications sent"
          value={data.stats.totalApplications}
          accent="text-amber-600"
        />
      </div>

      {/* PROFILE STRENGTH */}
      <Card className="relative overflow-hidden">
        <div
          aria-hidden
          className="bg-grain pointer-events-none absolute inset-0 opacity-[0.3] mix-blend-overlay"
        />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="label-mono-muted">Profile strength</p>
            <h2 className="display mt-1 text-2xl">Make your profile stronger</h2>
            <p className="mt-2 text-sm text-gray-600">
              {profileCompletion}% complete — {100 - profileCompletion}% to go
            </p>
          </div>
          <Link
            href="/dashboard/student/profile"
            className="btn btn-primary w-full sm:w-auto"
          >
            Complete my profile
          </Link>
        </div>
        <div className="relative mt-5 h-2 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-primary-light"
            style={{ width: `${profileCompletion}%` }}
          />
        </div>
        <p className="relative mt-3 text-sm text-gray-500">
          Add a portfolio link and one project — employers rank these highest.
        </p>
      </Card>

      {/* SKILLS TO LEARN — derived from real matched-role gaps */}
      <section>
        <SectionHeader eyebrow="Growth" title="Skills to learn next" />
        {skillsToLearn.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {skillsToLearn.map(({ skill, count }) => (
              <div
                key={skill}
                className="glass group flex items-center gap-3 rounded-2xl border border-card-border p-4 transition-all duration-300 hover:shadow-soft-lg"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Sparkles className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-display font-semibold text-gray-900">
                    {skill}
                  </p>
                  <p className="text-sm text-gray-500">
                    Matches {count} open {count === 1 ? "role" : "roles"}
                  </p>
                </div>
                <Link
                  href="/dashboard/student/profile"
                  className="whitespace-nowrap rounded font-display text-sm font-bold text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  Start →
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No skill gaps yet"
            description="Match with roles and we'll show exactly what to learn next."
          />
        )}
      </section>

      {/* EMPLOYERS MATCHED — reverse hiring */}
      <section>
        <SectionHeader eyebrow="Reverse hiring" title="Employers matched to you" />
        {data.matchedProjects.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {data.matchedProjects.slice(0, 3).map((p) => (
              <div
                key={p.id}
                className="glass flex items-center gap-3 rounded-2xl border border-card-border p-4"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 font-display text-base font-extrabold text-primary">
                  {(
                    p.employer?.companyName ||
                    p.employer?.user?.name ||
                    "C"
                  ).charAt(0)}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-display font-semibold text-gray-900">
                    {p.employer?.companyName ||
                      p.employer?.user?.name ||
                      "Company"}
                  </p>
                  <p className="text-sm text-gray-500">
                    {p.matchScore}% match
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No employers yet"
            description="Complete your profile to start getting matched."
          />
        )}
      </section>

      {/* MATCHED OPPORTUNITIES */}
      {data.matchedProjects.length > 0 ? (
        <section>
          <SectionHeader eyebrow="Opportunities" title="Recommended for you" />
          <p className="-mt-3 mb-4 text-gray-500">
            Matched by your skills, budget &amp; location
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.matchedProjects.map((p) => (
              <OpportunityCard key={p.id} project={p} />
            ))}
          </div>
        </section>
      ) : (
        <EmptyState
          title="No matched opportunities yet"
          description="Complete your profile with skills to get AI-powered matches."
          actionLabel="Complete profile"
          onAction={() =>
            (window.location.href = "/dashboard/student/profile")
          }
        />
      )}

      {/* QUICK LINKS */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <div className="p-6">
            <h3 className="display text-lg font-semibold text-gray-900">
              My Applications
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Track the status of your applications.
            </p>
            <Button asChild className="mt-4 w-full">
              <Link href="/dashboard/student/applications">View all</Link>
            </Button>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h3 className="display text-lg font-semibold text-gray-900">
              Discover
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Browse all opportunities and refine your matches.
            </p>
            <Button asChild variant="outline" className="mt-4 w-full">
              <Link href="/dashboard/student/discover">Browse</Link>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
