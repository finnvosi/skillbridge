'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getToken, clearToken, apiRequest, API_ENDPOINTS, ApiUser } from '@/lib/api-client';

/**
 * Fetches the current user from /auth/me. Redirects to /auth/login when
 * there's no token or the token is invalid. Returns loading / user / error so
 * callers can render skeletons and access-denied states.
 */
export function useAuthGuard(allowedRoles?: ApiUser['role'][]) {
  const router = useRouter();
  const [user, setUser] = useState<ApiUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace('/auth/login');
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const data = await apiRequest<{ user: ApiUser }>(API_ENDPOINTS.auth.me, {
          method: 'GET',
          token,
        });
        if (cancelled) return;
        if (allowedRoles && !allowedRoles.includes(data.user.role)) {
          setDenied(true);
          setLoading(false);
          return;
        }
        setUser(data.user);
        setLoading(false);
      } catch {
        if (cancelled) return;
        clearToken();
        router.replace('/auth/login');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router, allowedRoles]);

  return { user, loading, denied, token: getToken() };
}
