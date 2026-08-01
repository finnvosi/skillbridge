'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest, ApiError, AuthResponse, API_ENDPOINTS, storeToken } from '@/lib/api-client';

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
        worker: '/dashboard/worker',
        employer: '/dashboard/employer',
        factory: '/dashboard/factory',
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
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Full Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="John Doe"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="••••••••"
          />
          <p className="mt-1 text-xs text-gray-500">
            Min 8 characters, 1 uppercase, 1 number, 1 special character
          </p>
        </div>

        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700">
            I am a...
          </label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value as 'student' | 'employer')}
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="student">Student</option>
            <option value="employer">Employer</option>
          </select>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
        >
          {loading ? 'Creating account...' : 'Sign Up'}
        </button>
      </form>

      <div className="mt-4 text-center text-sm text-gray-600">
        Already have an account?{' '}
        <a
          href="/auth/login"
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          Sign in
        </a>
      </div>
    </div>
  );
}
