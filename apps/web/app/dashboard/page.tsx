'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getToken, clearToken, apiRequest, API_ENDPOINTS } from '@/lib/api-client';
import type { ApiUser } from '@/lib/api-client';

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const token = getToken();
      if (!token) {
        router.push('/auth/login');
        return;
      }
      try {
        const data = await apiRequest<{ user: ApiUser }>(API_ENDPOINTS.auth.me, {
          method: 'GET',
          token,
        });

        const roleRedirects: Record<string, string> = {
          student: '/dashboard/student',
          employer: '/dashboard/employer',
          admin: '/dashboard/admin',
        };

        router.push(roleRedirects[data.user.role] || '/auth/login');
      } catch {
        clearToken();
        router.push('/auth/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return null;
}
