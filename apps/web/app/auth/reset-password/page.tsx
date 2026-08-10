'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

function ResetPasswordForm() {
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
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      if (!res.ok) throw new Error('Reset failed');
      setStatus('done');
      setTimeout(() => router.push('/auth/login'), 1500);
    } catch {
      setStatus('error');
      setMessage('Could not reset password. The link may have expired.');
    }
  };

  return (
    <div className="card px-6 py-8 sm:px-10">
      {status === 'done' ? (
        <p className="text-center text-sm text-green-700">
          Password updated. Redirecting to sign in...
        </p>
      ) : (
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
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-purple-100 via-white to-white">
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="font-display text-3xl font-extrabold text-primary">
              Set a new password
            </h1>
          </div>
          <Suspense fallback={<div className="card p-8 text-center text-sm text-gray-500">Loading...</div>}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
