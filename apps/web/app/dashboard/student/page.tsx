"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiRequest, API_ENDPOINTS, getToken } from "@/lib/api-client";
import { Project, Application, MatchedProject } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader, StatCard } from "@/components/layout/page-header";
import { OpportunityCard } from "@/components/marketplace/opportunity-card";
import { Briefcase, Users, CheckCircle2 } from "lucide-react";

interface DashboardData {
  profile: {
    university?: string | null;
    major?: string | null;
    graduationYear?: number | null;
    skills?: string[];
    bio?: string | null;
    location?: string | null;
  };
  stats: {
    matchedOpportunities: number;
    totalApplications: number;
    skillsCount: number;
  };
  matchedProjects: MatchedProject[];
  applications: Application[];
}

export default function StudentDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData>({
    profile: {},
    stats: { matchedOpportunities: 0, totalApplications: 0, skillsCount: 0 },
    matchedProjects: [],
    applications: [],
  });

  useEffect(() => {
    (async () => {
      const token = getToken();
      if (!token) return;

      try {
        const [profileRes, matchRes, appsRes] = await Promise.all([
          apiRequest<{ user: { name: string; profile: DashboardData["profile"] } }>(
            API_ENDPOINTS.users.profile,
            { method: "GET", token }
          ),
          apiRequest<{ projects: MatchedProject[] }>(API_ENDPOINTS.projects.match, {
            method: "GET",
            token,
          }),
          apiRequest<{ applications: Application[] }>(
            API_ENDPOINTS.projects.myApplications,
            { method: "GET", token }
          ),
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
        });
      } catch {
        // keep defaults
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const profileCompletion = Math.min(100, (data.stats.skillsCount / 5) * 20 + 50);

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
      {/* Profile Strength Ring Hero */}
      <Card className="relative overflow-hidden border-none bg-gradient-to-b from-card to-card/90">
        <div className="absolute right-4 top-4 -z-10 opacity-5">
          <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
            <circle cx={60} cy={60} r={55} stroke="#F3F3F1" strokeWidth="2" />
            <circle
              cx={60}
              cy={60}
              r={55}
              strokeWidth="2"
              strokeDasharray="345"
              strokeDashoffset={`345 * (1 - ${profileCompletion} / 100)`}
              strokeLinecap="round"
              stroke="#3C096C"
            />
          </svg>
        </div>

        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-extrabold text-gray-900">
              Your Bridge
            </h1>
            <p className="mt-2 text-gray-600">
              Your verified skills are your bridge to real opportunities.
            </p>
            <p className="mt-4 text-sm text-gray-500">
              Profile strength: <span className="font-medium text-primary">{profileCompletion}%</span>
            </p>
          </div>

          <div className="text-center sm:text-right">
            <Link href="/dashboard/student/profile">
              <Button size="lg" className="w-full sm:w-auto">
                Edit profile
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      {/* Stats row */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={Briefcase}
          label="Matched opportunities"
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
          label="Applications in progress"
          value={data.stats.totalApplications}
          accent="text-amber-600"
        />
      </div>

      {/* Matched opportunities with scores */}
      {data.matchedProjects.length > 0 ? (
        <div>
          <h2 className="font-display text-2xl font-semibold text-gray-900">
            Recommended for you
          </h2>
          <p className="mt-1 text-gray-500">Matched by your skills, budget & location</p>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.matchedProjects.map((p) => (
              <OpportunityCard key={p.id} project={p} />
            ))}
          </div>
        </div>
      ) : (
        <EmptyState
          title="No matched opportunities yet"
          description="Complete your profile with skills to get AI-powered matches."
          actionLabel="Complete profile"
          onAction={() => (window.location.href = "/dashboard/student/profile")}
        />
      )}

      {/* Quick links */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <div className="p-6">
            <h3 className="font-display text-lg font-semibold text-gray-900">
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
            <h3 className="font-display text-lg font-semibold text-gray-900">
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