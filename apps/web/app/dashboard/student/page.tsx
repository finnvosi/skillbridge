'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest, API_ENDPOINTS, getToken } from '@/lib/api-client';
import { Project, Application } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { PageHeader, StatCard } from '@/components/layout/page-header';
import { ClipboardList, CheckCircle2, Briefcase } from 'lucide-react';
import { TYPE_LABELS, STATUS_LABELS } from '@/lib/types';

export default function StudentDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [opps, setOpps] = useState<Project[]>([]);
  const [apps, setApps] = useState<Application[]>([]);

  const token = getToken();

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const [p, a] = await Promise.all([
          apiRequest<{ projects: Project[] }>(API_ENDPOINTS.projects.list, {
            method: 'GET',
            token,
          }),
          apiRequest<{ applications: Application[] }>(
            API_ENDPOINTS.projects.myApplications,
            { method: 'GET', token }
          ).catch(() => ({ applications: [] as Application[] })),
        ]);
        setOpps(p.projects ?? []);
        setApps(a.applications ?? []);
      } catch {
        // leave empty; error state handled by empty states
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-64" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      </div>
    );
  }

  const activeApps = apps.filter(
    (a) => a.status === 'pending' || a.status === 'accepted'
  );

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Student"
        title="Your dashboard"
        subtitle="Discover opportunities and track your applications."
        actions={
          <Button asChild>
            <Link href="/dashboard/student/discover">Browse opportunities</Link>
          </Button>
        }
      />

      {/* Application status summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={ClipboardList}
          label="Active applications"
          value={activeApps.length}
        />
        <StatCard
          icon={CheckCircle2}
          label="Accepted"
          value={apps.filter((a) => a.status === 'accepted').length}
          accent="text-green-600"
        />
        <StatCard
          icon={Briefcase}
          label="Total applications"
          value={apps.length}
          accent="text-gray-900"
        />
      </div>

      {/* Recommended opportunities */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="display text-2xl">Recommended opportunities</h2>
          <Link
            href="/dashboard/student/discover"
            className="text-sm font-medium text-primary hover:text-primary-hover"
          >
            View all
          </Link>
        </div>
        {opps.length === 0 ? (
          <EmptyState
            title="No opportunities yet"
            description="Once employers post roles, they'll show up here."
            actionLabel="Browse opportunities"
            onAction={() => router.push('/dashboard/student/discover')}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {opps.slice(0, 6).map((o) => (
              <Card key={o.id} className="transition-shadow hover:shadow-md">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-gray-900">{o.title}</h3>
                    <p className="text-sm text-gray-500">
                      {o.employer?.companyName || o.employer?.user?.name || 'Company'}
                    </p>
                  </div>
                  <Badge variant="primary">{TYPE_LABELS[o.type]}</Badge>
                </div>
                <p className="mt-2 line-clamp-2 text-sm text-gray-600">
                  {o.description}
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {o.skillsRequired.slice(0, 3).map((s) => (
                    <Badge key={s} variant="neutral" size="sm">
                      {s}
                    </Badge>
                  ))}
                </div>
                <Button asChild variant="outline" size="sm" className="mt-4 w-full">
                  <Link href={`/dashboard/student/projects/${o.id}`}>View</Link>
                </Button>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Recent applications */}
      {apps.length > 0 && (
        <section>
          <h2 className="display mb-4 text-2xl">Recent applications</h2>
          <Card className="p-0">
            <ul className="divide-y divide-gray-100">
              {apps.slice(0, 5).map((a) => (
                <li
                  key={a.id}
                  className="flex items-center justify-between p-4"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {a.project?.title || 'Opportunity'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {a.project?.employer?.companyName ||
                        a.project?.employer?.user?.name ||
                        'Company'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500">
                      {new Date(a.createdAt).toLocaleDateString()}
                    </span>
                    <Badge
                      variant={
                        a.status === 'accepted'
                          ? 'primary'
                          : a.status === 'rejected'
                            ? 'neutral'
                            : 'secondary'
                      }
                    >
                      {STATUS_LABELS[a.status]}
                    </Badge>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </section>
      )}
    </div>
  );
}
