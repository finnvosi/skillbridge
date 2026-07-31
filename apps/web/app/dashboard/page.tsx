'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me');
        const data = await response.json();

        if (!data.success) {
          router.push('/auth/login');
          return;
        }

        const roleRedirects: Record<string, string> = {
          student: '/dashboard/student',
          worker: '/dashboard/worker',
          employer: '/dashboard/employer',
          factory_admin: '/dashboard/factory',
          admin: '/dashboard/admin',
        };

        router.push(roleRedirects[data.user.role] || '/auth/login');
      } catch (error) {
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
