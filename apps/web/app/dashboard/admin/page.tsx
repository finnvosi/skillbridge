'use client';

import { useEffect, useState } from 'react';
import { apiRequest, API_ENDPOINTS, getToken } from '@/lib/api-client';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    students: 0,
    employers: 0,
    opportunities: 0,
    applications: 0,
  });
  const token = getToken();

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const data = await apiRequest<typeof stats>(
          API_ENDPOINTS.admin.overview,
          { method: 'GET', token }
        );
        setStats(data);
      } catch {
        // leave zeros
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const cards = [
    { label: 'Total Students', value: stats.students },
    { label: 'Total Employers', value: stats.employers },
    { label: 'Active Opportunities', value: stats.opportunities },
    { label: 'Total Applications', value: stats.applications },
  ];

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-extrabold text-gray-900">
        Platform overview
      </h1>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((c) => (
            <Card key={c.label}>
              <p className="text-sm text-gray-500">{c.label}</p>
              <p className="mt-1 text-4xl font-bold text-primary">{c.value}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
