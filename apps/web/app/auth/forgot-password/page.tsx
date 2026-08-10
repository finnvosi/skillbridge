'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest, API_ENDPOINTS } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/components/ui/empty-state';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');
    try {
      await apiRequest(API_ENDPOINTS.auth.forgotPassword || '/auth/forgot-password', {
        method: 'POST',
        body: { email },
      });
      setStatus('sent');
    } catch (err) {
      setStatus('error');
      setMessage(err instanceof Error ? err.message : 'Something went wrong.');
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-purple-100 via-white to-white">
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="font-display text-3xl font-extrabold text-primary">
              Reset your password
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Enter your email and we&apos;ll send you a reset link.
            </p>
          </div>

          {status === 'sent' ? (
            <EmptyState
              title="Check your inbox"
              description="If an account exists for that email, a reset link is on its way."
              actionLabel="Back to sign in"
              onAction={() => router.push('/auth/login')}
            />
          ) : (
            <div className="card px-6 py-8 sm:px-10">
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
                    placeholder="you@example.com"
                  />
                </div>

                {status === 'error' && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
                    {message}
                  </div>
                )}

                <Button type="submit" disabled={status === 'loading'} className="w-full">
                  {status === 'loading' ? 'Sending...' : 'Send reset link'}
                </Button>

                <div className="text-center text-sm text-gray-600">
                  <a
                    href="/auth/login"
                    className="font-medium text-primary hover:text-primary-hover"
                  >
                    Back to sign in
                  </a>
                </div>
              </form>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
