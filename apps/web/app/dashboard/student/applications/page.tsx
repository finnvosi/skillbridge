"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest, API_ENDPOINTS, getToken } from "@/lib/api-client";
import { Application, ApplicationStatus, STATUS_LABELS } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";

const statusFilter: ApplicationStatus[] = ["pending", "accepted", "rejected", "withdrawn"];

export default function ApplicationsPage() {
  const router = useRouter();
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeStatus, setActiveStatus] = useState<ApplicationStatus | "all">("all");
  const token = getToken();

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const data = await apiRequest<{ applications: Application[] }>(
          API_ENDPOINTS.projects.myApplications,
          { method: "GET", token }
        );
        setApps(data.applications ?? []);
      } catch {
        // empty
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const filtered = apps.filter((a) =>
    activeStatus === "all" || a.status === activeStatus
  );

  const countByStatus = statusFilter.reduce(
    (acc, s) => {
      acc[s] = apps.filter((a) => a.status === s).length;
      return acc;
    },
    {} as Record<ApplicationStatus, number>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-extrabold text-gray-900">
          My Applications
        </h1>
        <p className="mt-1 text-gray-600">Track the status of every application.</p>
      </div>

      {/* Status tabs */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={activeStatus === "all" ? "primary" : "secondary"}
          size="sm"
          onClick={() => setActiveStatus("all")}
        >
          All ({apps.length})
        </Button>
        {statusFilter.map((s) => (
          <Button
            key={s}
            variant={activeStatus === s ? "primary" : "secondary"}
            size="sm"
            onClick={() => setActiveStatus(s)}
          >
            {STATUS_LABELS[s]} ({countByStatus[s]})
          </Button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No applications yet"
          description="When you apply to opportunities, they'll show up here."
          actionLabel="Find opportunities"
          onAction={() => router.push("/dashboard/student/discover")}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((app) => (
            <Card key={app.id} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">
                    {app.project?.title || "Opportunity"}
                  </p>
                  <p className="text-sm text-gray-500">
                    Applied {new Date(app.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <StatusBadge status={app.status} />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}