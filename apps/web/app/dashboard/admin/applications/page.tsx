'use client';

import { useEffect, useState } from 'react';
import { apiRequest, API_ENDPOINTS, getToken, ApiError } from '@/lib/api-client';
import { Application, ApplicationStatus } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { StatusBadge } from '@/components/ui/status-badge';

const STATUSES: ApplicationStatus[] = ['pending', 'accepted', 'rejected', 'withdrawn'];

export default function AdminApplicationsPage() {
  const [loading, setLoading] = useState(true);
  const [apps, setApps] = useState<Application[]>([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const token = getToken();

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const data = await apiRequest<{ applications: Application[] }>(
          API_ENDPOINTS.admin.applications,
          { method: 'GET', token }
        );
        setApps(data.applications ?? []);
      } catch {
        setError('Failed to load applications');
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const change = async (id: string, status: ApplicationStatus) => {
    if (!token) return;
    setBusy(id);
    setError('');
    try {
      await apiRequest(API_ENDPOINTS.admin.updateApplication(id), {
        method: 'PUT',
        token,
        body: { status },
      });
      setApps((p) => p.map((a) => (a.id === id ? { ...a, status } : a)));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Update failed');
    } finally {
      setBusy(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-extrabold text-gray-900">
        Applications
      </h1>
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
          {error}
        </div>
      )}
      {apps.length === 0 ? (
        <EmptyState title="No applications yet" description="They'll appear here." />
      ) : (
        <Card className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-200 bg-gray-50 text-left text-gray-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Student</th>
                  <th className="px-4 py-3 font-medium">Opportunity</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium text-right">Update</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {apps.map((a) => (
                  <tr key={a.id}>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {a.student?.user?.name || '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {a.project?.title || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={a.status} />
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(a.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <select
                        value={a.status}
                        disabled={busy === a.id}
                        onChange={(e) =>
                          change(a.id, e.target.value as ApplicationStatus)
                        }
                        className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm"
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
