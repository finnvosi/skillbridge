'use client';

import { useEffect, useState } from 'react';
import { apiRequest, API_ENDPOINTS, getToken, ApiError } from '@/lib/api-client';
import { Project, TYPE_LABELS } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';

interface OppRow {
  id: string;
  title: string;
  type: Project['type'];
  status: string;
  _count?: { applications: number };
  employer?: { user?: { name: string } } | null;
}

export default function AdminOpportunitiesPage() {
  const [loading, setLoading] = useState(true);
  const [opps, setOpps] = useState<OppRow[]>([]);
  const [error, setError] = useState('');
  const token = getToken();

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const data = await apiRequest<{ opportunities: OppRow[] }>(
          API_ENDPOINTS.admin.opportunities,
          { method: 'GET', token }
        );
        setOpps(data.opportunities ?? []);
      } catch {
        setError('Failed to load opportunities');
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const remove = async (id: string) => {
    if (!token) return;
    if (!confirm('Delete this opportunity? This cannot be undone.')) return;
    try {
      await apiRequest(API_ENDPOINTS.admin.deleteOpportunity(id), {
        method: 'DELETE',
        token,
      });
      setOpps((p) => p.filter((o) => o.id !== id));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Delete failed');
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
        Opportunities
      </h1>
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
          {error}
        </div>
      )}
      {opps.length === 0 ? (
        <EmptyState title="No opportunities found" description="They'll appear here." />
      ) : (
        <Card className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-200 bg-gray-50 text-left text-gray-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Employer</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Applicants</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {opps.map((o) => (
                  <tr key={o.id}>
                    <td className="px-4 py-3 font-medium text-gray-900">{o.title}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {o.employer?.user?.name || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="neutral">{TYPE_LABELS[o.type]}</Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {o._count?.applications ?? 0}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button size="sm" variant="ghost" onClick={() => remove(o.id)}>
                        Delete
                      </Button>
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
