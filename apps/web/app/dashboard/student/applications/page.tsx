'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest, API_ENDPOINTS, getToken } from '@/lib/api-client';
import { Application, ApplicationStatus, STATUS_LABELS } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { StatusBadge } from '@/components/ui/status-badge';

export default function ApplicationsPage() {
  const router = useRouter();
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const token = getToken();

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const data = await apiRequest<{ applications: Application[] }>(
          API_ENDPOINTS.projects.myApplications,
          { method: 'GET', token }
        );
        setApps(data.applications ?? []);
      } catch {
        // empty
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const statusVariant = (s: string) =>
    s === 'accepted'
      ? 'primary'
      : s === 'rejected'
        ? 'neutral'
        : 'secondary';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-extrabold text-gray-900">
          My applications
        </h1>
        <p className="mt-1 text-gray-600">Track the status of every application.</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : apps.length === 0 ? (
        <EmptyState
          title="Your applications will appear here"
          description="When you apply to an opportunity, its status shows up here."
          actionLabel="Browse opportunities"
          onAction={() => router.push('/dashboard/student/discover')}
        />
      ) : (
        <Card className="p-0">
          <ul className="divide-y divide-gray-100">
            {apps.map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-4 p-4">
                <div className="min-w-0">
                  <p className="truncate font-medium text-gray-900">
                    {a.project?.title || 'Opportunity'}
                  </p>
                  <p className="truncate text-sm text-gray-500">
                    {a.project?.employer?.companyName ||
                      a.project?.employer?.user?.name ||
                      'Company'}
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    Applied {new Date(a.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <StatusBadge status={a.status as ApplicationStatus} />
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
