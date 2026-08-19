"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  apiRequest,
  API_ENDPOINTS,
  getToken,
  ApiError,
} from "@/lib/api-client";
import {
  Application,
  ApplicationStatus,
  APPLICATION_STATUS_TRANSITIONS,
  STATUS_LABELS,
} from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { Textarea } from "@/components/ui/textarea";

export default function ApplicantsPage() {
  const { id } = useParams<{ id: string }>();

  const token = getToken();

  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [drafts, setDrafts] = useState<
    Record<string, { reviewNote: string; candidateFeedback: string }>
  >({});

  const load = async () => {
    if (!token) return;
    try {
      const data = await apiRequest<{ applications: Application[] }>(
        API_ENDPOINTS.projects.detail(id) + "/applications",
        { method: "GET", token },
      );
      setApps(data.applications ?? []);
    } catch {
      setError("Failed to load applicants");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, token]);

  const changeStatus = async (
    applicationId: string,
    status: ApplicationStatus,
  ) => {
    if (!token) return;
    setBusy(applicationId);
    setError("");
    try {
      const draft = drafts[applicationId] ?? {
        reviewNote: "",
        candidateFeedback: "",
      };
      await apiRequest(
        API_ENDPOINTS.projects.updateApplication(id, applicationId),
        {
          method: "PATCH",
          token,
          body: { status, ...draft },
        },
      );
      setApps((prev) =>
        prev.map((a) =>
          a.id === applicationId
            ? {
                ...a,
                status,
                reviewNote: draft.reviewNote,
                candidateFeedback: draft.candidateFeedback,
              }
            : a,
        ),
      );
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Update failed");
    } finally {
      setBusy(null);
    }
  };

  const updateDraft = (
    application: Application,
    field: "reviewNote" | "candidateFeedback",
    value: string,
  ) => {
    setDrafts((current) => ({
      ...current,
      [application.id]: {
        reviewNote:
          current[application.id]?.reviewNote ?? application.reviewNote ?? "",
        candidateFeedback:
          current[application.id]?.candidateFeedback ??
          application.candidateFeedback ??
          "",
        [field]: value,
      },
    }));
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/dashboard/employer/projects"
          className="text-sm font-medium text-primary hover:text-primary-hover"
        >
          ← Back to opportunities
        </Link>
        <h1 className="mt-2 font-display text-3xl font-extrabold text-gray-900">
          Applicants
        </h1>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
          {error}
        </div>
      )}

      {apps.length === 0 ? (
        <EmptyState
          title="Applicants will appear here once students apply"
          description="Share your opportunity to start receiving applications."
        />
      ) : (
        <div className="space-y-4">
          {apps.map((a) => (
            <Card key={a.id}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="font-semibold text-gray-900">
                    {a.student?.user?.name || "Candidate"}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {a.student?.user?.email || ""}
                  </p>
                  {a.coverLetter && (
                    <p className="mt-2 text-sm text-gray-600">
                      {a.coverLetter}
                    </p>
                  )}
                  {a.student?.skills?.length ? (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {a.student.skills.map((skill) => (
                        <span
                          key={skill}
                          className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  <div className="mt-4 grid gap-2">
                    <Textarea
                      aria-label={`Internal note for ${a.student?.user?.name || "candidate"}`}
                      placeholder="Internal note for your hiring team"
                      value={drafts[a.id]?.reviewNote ?? a.reviewNote ?? ""}
                      onChange={(event) =>
                        updateDraft(a, "reviewNote", event.target.value)
                      }
                      maxLength={2000}
                    />
                    <Textarea
                      aria-label={`Candidate feedback for ${a.student?.user?.name || "candidate"}`}
                      placeholder="Feedback the candidate will see"
                      value={
                        drafts[a.id]?.candidateFeedback ??
                        a.candidateFeedback ??
                        ""
                      }
                      onChange={(event) =>
                        updateDraft(a, "candidateFeedback", event.target.value)
                      }
                      maxLength={2000}
                    />
                  </div>
                  <p className="mt-2 text-xs text-gray-400">
                    Applied {new Date(a.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <StatusBadge status={a.status as ApplicationStatus} />
                  {APPLICATION_STATUS_TRANSITIONS[a.status].length > 0 && (
                    <div className="flex gap-2">
                      {APPLICATION_STATUS_TRANSITIONS[a.status].map(
                        (nextStatus) => (
                          <Button
                            key={nextStatus}
                            size="sm"
                            variant={
                              nextStatus === "rejected" ||
                              nextStatus === "withdrawn"
                                ? "outline"
                                : "primary"
                            }
                            disabled={busy === a.id}
                            onClick={() => void changeStatus(a.id, nextStatus)}
                          >
                            {busy === a.id
                              ? "Updating…"
                              : `Mark ${STATUS_LABELS[nextStatus]}`}
                          </Button>
                        ),
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
