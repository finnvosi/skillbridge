'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { apiRequest, API_ENDPOINTS, getToken, ApiError } from '@/lib/api-client';
import { Project, TYPE_LABELS, STATUS_LABELS, ApplicationStatus } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { Magnetic } from '@/components/motion/primitives2';

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const token = getToken();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [applying, setApplying] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [proposedBudget, setProposedBudget] = useState('');
  const [existingApp, setExistingApp] = useState<ApplicationStatus | null>(null);
  const [error, setError] = useState('');

  const load = async () => {
    if (!token) return;
    try {
      const data = await apiRequest<{ project: Project }>(
        API_ENDPOINTS.projects.detail(id),
        { method: 'GET', token }
      );
      setProject(data.project);
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, token]);

  const submit = async () => {
    if (!token || !project) return;
    setApplying(true);
    setError('');
    try {
      await apiRequest(API_ENDPOINTS.projects.apply(project.id), {
        method: 'POST',
        token,
        body: {
          coverLetter: coverLetter || undefined,
          proposedBudget: proposedBudget ? Number(proposedBudget) : undefined,
        },
      });
      setSubmitted(true);
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setExistingApp('pending');
      } else {
        setError(err instanceof ApiError ? err.message : 'Application failed');
      }
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (notFound || !project) {
    return (
      <EmptyState
        title="Opportunity not found"
        description="This opportunity may have been removed or is no longer available."
        actionLabel="Back to discover"
        onAction={() => router.push('/dashboard/student/discover')}
      />
    );
  }

  const company = project.employer?.companyName || project.employer?.user?.name || 'Company';

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        href="/dashboard/student/discover"
        className="text-sm font-medium text-primary hover:text-primary-hover"
      >
        ← Back to discover
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-gray-900">
            {project.title}
          </h1>
          <p className="mt-1 text-gray-600">{company}</p>
        </div>
        <Badge variant="primary">{TYPE_LABELS[project.type]}</Badge>
      </div>

      <Card>
        <h2 className="text-lg font-semibold text-gray-900">Description</h2>
        <p className="mt-2 whitespace-pre-line text-sm text-gray-600">
          {project.description}
        </p>

        <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-gray-500">Location</dt>
            <dd className="font-medium text-gray-900">
              {project.location || (project.remote ? 'Remote' : 'Onsite')}
            </dd>
          </div>
          <div>
            <dt className="text-gray-500">Budget</dt>
            <dd className="font-medium text-gray-900">
              {project.budget ? `$${project.budget}` : 'Negotiable'}
            </dd>
          </div>
          {project.startDate && (
            <div>
              <dt className="text-gray-500">Starts</dt>
              <dd className="font-medium text-gray-900">
                {new Date(project.startDate).toLocaleDateString()}
              </dd>
            </div>
          )}
          {project.endDate && (
            <div>
              <dt className="text-gray-500">Ends</dt>
              <dd className="font-medium text-gray-900">
                {new Date(project.endDate).toLocaleDateString()}
              </dd>
            </div>
          )}
        </dl>

        <h3 className="mt-6 text-sm font-semibold text-gray-900">Skills</h3>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {project.skillsRequired.map((s) => (
            <Badge key={s} variant="neutral" size="sm">
              {s}
            </Badge>
          ))}
        </div>
      </Card>

      {/* Apply */}
      <Card>
        {submitted ? (
          <div className="text-center">
            <div className="text-2xl">✅</div>
            <h3 className="mt-2 font-semibold text-gray-900">
              Application submitted successfully
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              Track its status in your applications.
            </p>
            <Button asChild className="mt-4">
              <Link href="/dashboard/student/applications">View applications</Link>
            </Button>
          </div>
        ) : existingApp ? (
          <p className="text-sm text-gray-600">
            You&apos;ve already applied to this opportunity. Status:{' '}
            <span className="font-medium">{STATUS_LABELS[existingApp]}</span>
          </p>
        ) : (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Apply now</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Cover message (optional)
              </label>
              <Textarea
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="Tell the employer why you're a great fit..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Proposed budget (optional)
              </label>
              <Input
                type="number"
                value={proposedBudget}
                onChange={(e) => setProposedBudget(e.target.value)}
                placeholder="e.g. 500"
              />
            </div>
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
                {error}
              </div>
            )}
            <Magnetic>
              <Button onClick={submit} disabled={applying} className="w-full">
                {applying ? 'Submitting...' : 'Submit application'}
              </Button>
            </Magnetic>
          </div>
        )}
      </Card>
    </div>
  );
}
