'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest, ApiError, AuthResponse, API_ENDPOINTS, storeToken } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await apiRequest<AuthResponse>(API_ENDPOINTS.auth.login, {
        method: 'POST',
        body: { email, password },
      });

      storeToken(data.token, data.refreshToken);

      const roleRedirects: Record<string, string> = {
        student: '/dashboard/student',
        employer: '/dashboard/employer',
        admin: '/dashboard/admin',
      };

      router.push(roleRedirects[data.user.role] || '/dashboard');
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'An error occurred. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          placeholder="••••••••"
        />
      </div>

      <div className="flex items-center justify-end">
        <a
          href="/auth/forgot-password"
          className="text-sm font-medium text-primary hover:text-primary-hover"
        >
          Forgot password?
        </a>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
          {error}
        </div>
      )}

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Signing in...' : 'Sign In'}
      </Button>

      <div className="mt-4 text-center text-sm text-gray-600">
        Don&apos;t have an account?{' '}
        <a
          href="/auth/register"
          className="font-medium text-primary hover:text-primary-hover"
        >
          Sign up
        </a>
      </div>
    </form>
  );
}
