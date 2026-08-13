"use client";

import { useEffect, useState, useMemo } from "react";
import { apiRequest, API_ENDPOINTS, getToken } from "@/lib/api-client";
import { Project, ProjectType, TYPE_LABELS } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { OpportunityCard } from "@/components/marketplace/opportunity-card";

const TYPES: ProjectType[] = ["internship", "part_time", "freelance", "full_time"];
const SORTS = [
  { value: "newest", label: "Newest" },
  { value: "budget_desc", label: "Budget: high to low" },
  { value: "budget_asc", label: "Budget: low to high" },
];

export default function DiscoverPage() {
  const [all, setAll] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [type, setType] = useState<ProjectType | "">("");
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [sort, setSort] = useState("newest");

  const token = getToken();

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const data = await apiRequest<{ projects: Project[] }>(
          API_ENDPOINTS.projects.list,
          { method: "GET", token }
        );
        setAll(data.projects ?? []);
      } catch {
        // empty state handles errors
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const filtered = useMemo(() => {
    let list = all.filter((p) => {
      if (type && p.type !== type) return false;
      if (remoteOnly && !p.remote) return false;
      if (search) {
        const q = search.toLowerCase();
        const hay =
          p.title +
          " " +
          (p.description || "") +
          " " +
          (p.location || "") +
          " " +
          p.skillsRequired.join(" ");
        if (!hay.toLowerCase().includes(q)) return false;
      }
      return true;
    });
    if (sort === "budget_desc") list = [...list].sort((a, b) => (b.budget ?? 0) - (a.budget ?? 0));
    if (sort === "budget_asc") list = [...list].sort((a, b) => (a.budget ?? 0) - (b.budget ?? 0));
    return list;
  }, [all, type, remoteOnly, search, sort]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-extrabold text-gray-900">
          Discover opportunities
        </h1>
        <p className="mt-1 text-gray-600">
          Find internships, projects, and roles matched to your skills.
        </p>
      </div>

      {/* Filters - frosted card */}
      <Card className="p-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex-1 space-y-1">
          <label className="block text-xs font-medium text-gray-500">Search</label>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Title, skill, or company..."
          />
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-medium text-gray-500">Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as ProjectType | "")}
            className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm"
          >
            <option value="">All</option>
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {TYPE_LABELS[t]}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-medium text-gray-500">Sort</label>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm"
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={remoteOnly}
            onChange={(e) => setRemoteOnly(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
          />
          Remote only
        </label>
      </Card>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No opportunities match your search"
          description="Try adjusting your filters or search terms."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((o) => (
            <OpportunityCard key={o.id} project={o} />
          ))}
        </div>
      )}
    </div>
  );
}