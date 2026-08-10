'use client';

import { useEffect, useState } from 'react';
import { apiRequest, API_ENDPOINTS, getToken } from '@/lib/api-client';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader, StatCard } from '@/components/layout/page-header';
import { GraduationCap, Building2, Briefcase, FileCheck2 } from 'lucide-react';

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

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Admin"
        title="Platform overview"
        subtitle="Everything happening across the network, at a glance."
      />

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={GraduationCap} label="Total Students" value={stats.students} />
          <StatCard icon={Building2} label="Total Employers" value={stats.employers} accent="text-gray-900" />
          <StatCard icon={Briefcase} label="Active Opportunities" value={stats.opportunities} />
          <StatCard icon={FileCheck2} label="Total Applications" value={stats.applications} accent="text-gray-900" />
        </div>
      )}
    </div>
  );
}
