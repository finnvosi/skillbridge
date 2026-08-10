'use client';

import Link from 'next/link';
import { useEffect, useState, useMemo } from 'react';
import { apiRequest, API_ENDPOINTS, getToken } from '@/lib/api-client';
import { Project, ProjectType, TYPE_LABELS } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';

const TYPES: ProjectType[] = ['internship', 'part_time', 'freelance', 'full_time'];
const SORTS = [
  { value: 'newest', label: 'Newest' },
  { value: 'budget_desc', label: 'Budget: high to low' },
  { value: 'budget_asc', label: 'Budget: low to high' },
];

export default function DiscoverPage() {
  const [all, setAll] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [type, setType] = useState<ProjectType | ''>('');
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [sort, setSort] = useState('newest');

  const token = getToken();

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const data = await apiRequest<{ projects: Project[] }>(
          API_ENDPOINTS.projects.list,
          { method: 'GET', token }
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
        const hay = (
          p.title +
          ' ' +
          (p.description || '') +
          ' ' +
          (p.location || '') +
          ' ' +
          p.skillsRequired.join(' ')
        ).toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    if (sort === 'budget_desc') list = [...list].sort((a, b) => (b.budget ?? 0) - (a.budget ?? 0));
    if (sort === 'budget_asc') list = [...list].sort((a, b) => (a.budget ?? 0) - (b.budget ?? 0));
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

      {/* Filters */}
      <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label className="block text-xs font-medium text-gray-500">Search</label>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Title, skill, or company..."
            className="mt-1"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500">Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as ProjectType | '')}
            className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
          >
            <option value="">All</option>
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {TYPE_LABELS[t]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500">Sort</label>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
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
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-44 w-full" />
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
            <Card key={o.id} className="flex flex-col transition-shadow hover:shadow-md">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-gray-900">{o.title}</h3>
                  <p className="text-sm text-gray-500">
                    {o.employer?.companyName || o.employer?.user?.name || 'Company'}
                  </p>
                </div>
                <Badge variant="primary">{TYPE_LABELS[o.type]}</Badge>
              </div>
              <p className="mt-2 line-clamp-2 flex-1 text-sm text-gray-600">
                {o.description}
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {o.skillsRequired.slice(0, 3).map((s) => (
                  <Badge key={s} variant="neutral" size="sm">
                    {s}
                  </Badge>
                ))}
              </div>
              <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
                <span>{o.location || (o.remote ? 'Remote' : 'Onsite')}</span>
                {o.budget ? <span className="font-medium text-gray-900">${o.budget}</span> : null}
              </div>
              <Button asChild variant="outline" size="sm" className="mt-4 w-full">
                <Link href={`/dashboard/student/projects/${o.id}`}>View details</Link>
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
