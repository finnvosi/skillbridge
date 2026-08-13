"use client";

import { useEffect, useState } from "react";
import { apiRequest, API_ENDPOINTS, getToken } from "@/lib/api-client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader, StatCard } from "@/components/layout/page-header";
import {
  GraduationCap,
  Building2,
  Briefcase,
  FileCheck2,
  ShieldCheck,
  Users,
  AlertCircle,
} from "lucide-react";

interface AdminStats {
  students: number;
  employers: number;
  opportunities: number;
  applications: number;
}

interface RecentActivity {
  id: string;
  type: "student_verified" | "employer_verified" | "application_approved" | "project_created";
  description: string;
  timestamp: string;
}

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats>({
    students: 0,
    employers: 0,
    opportunities: 0,
    applications: 0,
  });
  const [activity, setActivity] = useState<RecentActivity[]>([]);
  const token = getToken();

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const data = await apiRequest<AdminStats & { recent: RecentActivity[] }>(
          API_ENDPOINTS.admin.overview,
          { method: "GET", token }
        );
        setStats({
          students: data.students,
          employers: data.employers,
          opportunities: data.opportunities,
          applications: data.applications,
        });
        setActivity(data.recent || []);
      } catch {
        // leave defaults
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Admin"
        title="Command Center"
        subtitle="Platform overview, moderation tools, and system health."
      />

      {/* Stats grid */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={GraduationCap} label="Total Students" value={stats.students} />
          <StatCard icon={Building2} label="Total Employers" value={stats.employers} accent="text-gray-900" />
          <StatCard icon={Briefcase} label="Active Opportunities" value={stats.opportunities} />
          <StatCard icon={FileCheck2} label="Total Applications" value={stats.applications} accent="text-gray-900" />
        </div>
      )}

      {/* Action cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <ShieldCheck className="h-6 w-6 text-purple-600" />
              <h3 className="font-display text-lg font-semibold text-gray-900">
                Verify identities
              </h3>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Review pending student and employer verifications.
            </p>
            <Button asChild>
              <a href="/dashboard/admin/verifications">Review pending</a>
            </Button>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Users className="h-6 w-6 text-primary" />
              <h3 className="font-display text-lg font-semibold text-gray-900">
                User management
              </h3>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              View and manage all user accounts across the platform.
            </p>
            <Button asChild variant="outline">
              <a href="/dashboard/admin/users">Manage users</a>
            </Button>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="h-6 w-6 text-amber-600" />
              <h3 className="font-display text-lg font-semibold text-gray-900">
                Report moderation
              </h3>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Review and resolve user reports.
            </p>
            <Button asChild variant="outline">
              <a href="/dashboard/admin/reports">View reports</a>
            </Button>
          </div>
        </Card>
      </div>

      {/* Recent activity */}
      <section>
        <h2 className="font-display text-2xl font-semibold text-gray-900 mb-4">
          Recent activity
        </h2>
        {activity.length === 0 ? (
          <EmptyState
            title="No recent activity"
            description="The platform will show activity as users engage."
          />
        ) : (
          <Card>
            <ul className="divide-y divide-gray-100">
              {activity.map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-4 p-4">
                  <div>
                    <p className="font-medium text-gray-900">{a.description}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(a.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <Badge variant="secondary" size="sm">
                    {a.type.replace("_", " ")}
                  </Badge>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </section>
    </div>
  );
}