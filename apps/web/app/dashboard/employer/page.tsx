'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { apiRequest, API_ENDPOINTS, getToken } from '@/lib/api-client';
import { Project, Application } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { TYPE_LABELS } from '@/lib/types';

interface ProjectWithCount extends Project {
  _count?: { applications: number };
}

export default function EmployerDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<ProjectWithCount[]>([]);
  const [apps, setApps] = useState<Application[]>([]);
  const token = getToken();

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const [p, a] = await Promise.all([
          apiRequest<{ projects: ProjectWithCount[] }>(
            API_ENDPOINTS.projects.employerProjects,
            { method: 'GET', token }
          ).catch(() => ({ projects: [] as ProjectWithCount[] })),
          apiRequest<{ applications: Application[] }>(
            API_ENDPOINTS.projects.employerApplications,
            { method: 'GET', token }
          ).catch(() => ({ applications: [] as Application[] })),
        ]);
        setProjects(p.projects ?? []);
        setApps(a.applications ?? []);
      } catch {
        // empty
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const needsReview = apps.filter((a) => a.status === 'pending').length;

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-9 w-64" />
        <div className="grid gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-gray-900">
            Employer dashboard
          </h1>
          <p className="mt-1 text-gray-600">
            Manage your opportunities and candidates.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/employer/projects/new">Post opportunity</Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-sm text-gray-500">Active opportunities</p>
          <p className="mt-1 text-3xl font-bold text-primary">
            {projects.length}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500">Total applicants</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">{apps.length}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500">Needs review</p>
          <p className="mt-1 text-3xl font-bold text-amber-600">{needsReview}</p>
        </Card>
      </div>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
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
            description="Post your first opportunity to start receiving applications."
            actionLabel="Post opportunity"
            onAction={() =>
              (window.location.href = '/dashboard/employer/projects/new')
            }
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.slice(0, 6).map((p) => (
              <Card key={p.id} className="transition-shadow hover:shadow-md">
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-gray-900">{p.title}</h3>
                  <Badge variant="primary">{TYPE_LABELS[p.type]}</Badge>
                </div>
                <p className="mt-1 text-sm text-gray-500">{p.location || 'Remote'}</p>
                <p className="mt-3 text-sm text-gray-600">
                  {p._count?.applications ?? 0} applicants
                </p>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
