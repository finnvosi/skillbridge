'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest, ApiError, AuthResponse, API_ENDPOINTS, storeToken } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function RegisterForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'student' | 'employer'>('student');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await apiRequest<AuthResponse>(API_ENDPOINTS.auth.register, {
        method: 'POST',
        body: { email, password, name, role },
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
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Full Name
        </label>
        <Input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoComplete="name"
          placeholder="e.g. Sopanha Vosi"
        />
      </div>

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
          autoComplete="new-password"
          placeholder="••••••••"
        />
        <p className="mt-1 text-xs text-gray-500">
          Min 8 characters, 1 uppercase, 1 number, 1 special character
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">I am a...</label>
        <div className="mt-2 grid grid-cols-2 gap-3">
          <label
            className={`cursor-pointer rounded-lg border p-3 text-center text-sm font-medium transition-colors ${
              role === 'student'
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-gray-300 text-gray-700 hover:border-gray-400'
            }`}
          >
            <input
              type="radio"
              name="role"
              value="student"
              checked={role === 'student'}
              onChange={() => setRole('student')}
              className="sr-only"
            />
            Student
          </label>
          <label
            className={`cursor-pointer rounded-lg border p-3 text-center text-sm font-medium transition-colors ${
              role === 'employer'
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-gray-300 text-gray-700 hover:border-gray-400'
            }`}
          >
            <input
              type="radio"
              name="role"
              value="employer"
              checked={role === 'employer'}
              onChange={() => setRole('employer')}
              className="sr-only"
            />
            Employer
          </label>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
          {error}
        </div>
      )}

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Creating account...' : 'Sign Up'}
      </Button>

      <div className="mt-4 text-center text-sm text-gray-600">
        Already have an account?{' '}
        <a
          href="/auth/login"
          className="font-medium text-primary hover:text-primary-hover"
        >
          Sign in
        </a>
      </div>
    </form>
  );
}
