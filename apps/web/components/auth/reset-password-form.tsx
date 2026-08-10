'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiRequest, API_ENDPOINTS } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

function InnerForm() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const router = useRouter();
  const params = useSearchParams();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setStatus('error');
      setMessage('Passwords do not match.');
      return;
    }
    setStatus('loading');
    setMessage('');
    try {
      const token = params.get('token');
      await apiRequest(API_ENDPOINTS.auth.resetPassword || '/auth/reset-password', {
        method: 'POST',
        body: { token, password },
      });
      setStatus('done');
      setTimeout(() => router.push('/auth/login'), 1500);
    } catch {
      setStatus('error');
      setMessage('Could not reset password. The link may have expired.');
    }
  };

  if (status === 'done') {
    return (
      <p className="text-center text-sm text-green-700">
        Password updated. Redirecting to sign in...
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          New password
        </label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="••••••••"
        />
      </div>
      <div>
        <label htmlFor="confirm" className="block text-sm font-medium text-gray-700">
          Confirm password
        </label>
        <Input
          id="confirm"
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          placeholder="••••••••"
        />
      </div>

      {status === 'error' && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
          {message}
        </div>
      )}

      <Button type="submit" disabled={status === 'loading'} className="w-full">
        {status === 'loading' ? 'Updating...' : 'Update password'}
      </Button>
    </form>
  );
}

export function ResetPasswordForm() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-sm text-gray-500">Loading...</div>
      }
    >
      <InnerForm />
    </Suspense>
  );
}
