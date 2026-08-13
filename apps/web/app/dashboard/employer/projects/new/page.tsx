'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest, API_ENDPOINTS, getToken, ApiError } from '@/lib/api-client';
import { ProjectType, TYPE_LABELS } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuthGuard } from '@/lib/use-auth-guard';

const TYPES: ProjectType[] = ['internship', 'part_time', 'freelance', 'full_time'];

export default function NewProjectPage() {
  useAuthGuard(['employer']);
  const router = useRouter();
  const token = getToken();

  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'internship' as ProjectType,
    location: '',
    budget: '',
    startDate: '',
    endDate: '',
    skillsRequired: '',
    remote: false,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (k: keyof typeof form, v: string | boolean) =>
    setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await apiRequest(API_ENDPOINTS.projects.list, {
        method: 'POST',
        token,
        body: {
          title: form.title,
          description: form.description,
          type: form.type,
          location: form.location || undefined,
          budget: form.budget ? Number(form.budget) : undefined,
          startDate: form.startDate || undefined,
          endDate: form.endDate || undefined,
          skillsRequired: form.skillsRequired
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
          remote: form.remote,
        },
      });
      router.push('/dashboard/employer/projects');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to create');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="font-display text-3xl font-extrabold text-gray-900">
        Post an opportunity
      </h1>

      <Card>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <Input
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              placeholder="e.g. Frontend Developer Intern"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <Textarea
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="Describe the role, responsibilities, and what you're looking for..."
              required
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Type</label>
              <select
                value={form.type}
                onChange={(e) => set('type', e.target.value as ProjectType)}
                className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
              >
                {TYPES.map((t) => (
                  <option key={t} value={t}>
                    {TYPE_LABELS[t]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Location
              </label>
              <Input
                value={form.location}
                onChange={(e) => set('location', e.target.value)}
                placeholder="Phnom Penh"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Budget ($)
              </label>
              <Input
                type="number"
                value={form.budget}
                onChange={(e) => set('budget', e.target.value)}
                placeholder="500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Skills (comma-separated)
              </label>
              <Input
                value={form.skillsRequired}
                onChange={(e) => set('skillsRequired', e.target.value)}
                placeholder="React, TypeScript, Figma"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Start date
              </label>
              <Input
                type="date"
                value={form.startDate}
                onChange={(e) => set('startDate', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                End date
              </label>
              <Input
                type="date"
                value={form.endDate}
                onChange={(e) => set('endDate', e.target.value)}
              />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={form.remote}
              onChange={(e) => set('remote', e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            Remote role
          </label>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <Button type="submit" disabled={saving}>
              {saving ? 'Publishing...' : 'Publish opportunity'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.push('/dashboard/employer/projects')}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
