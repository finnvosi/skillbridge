'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest, API_ENDPOINTS } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/components/ui/empty-state';

export function ForgotPasswordForm() {
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

  if (status === 'sent') {
    return (
      <EmptyState
        title="Check your inbox"
        description="If an account exists for that email, a reset link is on its way."
        actionLabel="Back to sign in"
        onAction={() => router.push('/auth/login')}
      />
    );
  }

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
        <a href="/auth/login" className="font-medium text-primary hover:text-primary-hover">
          Back to sign in
        </a>
      </div>
    </form>
  );
}
