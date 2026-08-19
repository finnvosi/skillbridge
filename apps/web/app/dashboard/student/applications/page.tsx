"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError, apiRequest, API_ENDPOINTS, getToken } from "@/lib/api-client";
import { Application, ApplicationStatus, STATUS_LABELS } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";

const statusFilter: ApplicationStatus[] = [
  "pending",
  "reviewing",
  "shortlisted",
  "accepted",
  "hired",
  "rejected",
  "withdrawn",
];

export default function ApplicationsPage() {
  const router = useRouter();
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeStatus, setActiveStatus] = useState<ApplicationStatus | "all">(
    "all",
  );
  const [error, setError] = useState("");
  const [withdrawBusy, setWithdrawBusy] = useState<string | null>(null);
  const [success, setSuccess] = useState("");
  const token = getToken();

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const data = await apiRequest<{ applications: Application[] }>(
          API_ENDPOINTS.projects.myApplications,
          { method: "GET", token },
        );
        setApps(data.applications ?? []);
      } catch {
        setError("Couldn't load your applications. Try again.");
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const filtered = apps.filter(
    (a) => activeStatus === "all" || a.status === activeStatus,
  );

  const countByStatus = statusFilter.reduce(
    (acc, s) => {
      acc[s] = apps.filter((a) => a.status === s).length;
      return acc;
    },
    {} as Record<ApplicationStatus, number>,
  );

  async function withdrawApplication(app: Application) {
    if (!token || withdrawBusy) return;
    const role = app.project?.title || "this opportunity";
    if (
      !window.confirm(
        `Withdraw your application for ${role}? This cannot be undone.`,
      )
    )
      return;
    setWithdrawBusy(app.id);
    setError("");
    setSuccess("");
    try {
      await apiRequest(API_ENDPOINTS.projects.withdrawApplication(app.id), {
        method: "PATCH",
        token,
      });
      setApps((current) =>
        current.map((item) =>
          item.id === app.id ? { ...item, status: "withdrawn" } : item,
        ),
      );
      setSuccess("Application withdrawn.");
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        try {
          const data = await apiRequest<{ applications: Application[] }>(
            API_ENDPOINTS.projects.myApplications,
            { method: "GET", token },
          );
          setApps(data.applications ?? []);
        } catch {
          // The stale-state message remains actionable even if the refresh fails.
        }
        setError(
          "This application changed before it could be withdrawn. We refreshed its latest status.",
        );
      } else {
        setError(err instanceof ApiError ? err.message : "Couldn’t withdraw this application. Try again.");
      }
    } finally {
      setWithdrawBusy(null);
    }
  }

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
        <p className="mt-1 text-gray-600">
          Track the status of every application.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}
      {success && (
        <div
          role="status"
          aria-live="polite"
          className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700"
        >
          {success}
        </div>
      )}

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
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium text-gray-900">
                    {app.project?.title || "Opportunity"}
                  </p>
                  <p className="text-sm text-gray-500">
                    Applied {new Date(app.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <StatusBadge status={app.status} />
                  {app.status !== "hired" &&
                    app.status !== "rejected" &&
                    app.status !== "withdrawn" && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={withdrawBusy === app.id}
                        onClick={() => void withdrawApplication(app)}
                      >
                        {withdrawBusy === app.id ? "Withdrawing…" : "Withdraw"}
                      </Button>
                    )}
                </div>
              </div>
              {app.candidateFeedback && (
                <div className="mt-4 rounded-lg border border-primary/15 bg-primary/5 p-3 text-sm text-gray-700">
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                    Feedback from the employer
                  </p>
                  <p className="mt-1 whitespace-pre-wrap">
                    {app.candidateFeedback}
                  </p>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
