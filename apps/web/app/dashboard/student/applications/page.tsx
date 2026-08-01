'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getToken, clearToken, apiRequest, ApiError, API_ENDPOINTS } from '@/lib/api-client';
import Link from 'next/link';
import type { ApiUser } from '@/lib/api-client';

interface Application {
  id: string;
  projectId: string;
  studentId: string;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  coverLetter?: string | null;
  createdAt: string;
  updatedAt: string;
  project?: {
    id: string;
    title: string;
    description: string;
    type: string;
    budget?: number | null;
  };
}

export default function StudentApplicationsPage() {
  const router = useRouter();
  const [user, setUser] = useState<ApiUser | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const token = getToken();

  const fetchUser = useCallback(async () => {
    if (!token) {
      router.push('/auth/login');
      return;
    }
    try {
      const data = await apiRequest<{ user: ApiUser }>(API_ENDPOINTS.auth.me, {
        method: 'GET',
        token,
      });
      setUser(data.user);
    } catch {
      clearToken();
      router.push('/auth/login');
    }
  }, [token, router]);

  const fetchApplications = useCallback(async () => {
    try {
      const data = await apiRequest<{ applications: Application[] }>(
        API_ENDPOINTS.projects.myApplications,
        { method: 'GET', token }
      );
      setApplications(data.applications);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (user?.role === 'student') {
      fetchApplications();
    } else if (user) {
      router.push('/dashboard');
    }
  }, [user, fetchApplications, router]);

  const STATUS_COLORS: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    accepted: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    withdrawn: 'bg-gray-100 text-gray-800',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">SkillBridge</h1>
          <Link href="/dashboard/student/projects" className="text-gray-600 hover:text-gray-900">
            ← Back to Projects
          </Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">My Applications</h2>
          <Link
            href="/dashboard/student/projects"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Browse Projects →
          </Link>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
            {error}
          </div>
        )}

        {applications.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">You haven&apos;t applied to any projects yet.</p>
            <Link
              href="/dashboard/student/projects"
              className="text-blue-600 hover:text-blue-700 font-medium mt-4 inline-block"
            >
              Browse projects →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <div key={app.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {app.project?.title || 'Project'}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Applied: {new Date(app.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full ${STATUS_COLORS[app.status] || 'bg-gray-100 text-gray-800'}`}>
                    {app.status}
                  </span>
                </div>

                {app.project?.description && (
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {app.project.description}
                  </p>
                )}

                {app.project?.budget && (
                  <p className="text-sm text-gray-500 mb-2">Budget: ${app.project.budget}</p>
                )}

                {app.coverLetter && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-md">
                    <h4 className="text-xs font-medium text-gray-500 uppercase mb-1">Your cover letter</h4>
                    <p className="text-sm text-gray-700 line-clamp-3">
                      {app.coverLetter}
                    </p>
                  </div>
                )}

                {app.project?.id && (
                  <Link
                    href={`/dashboard/student/projects/${app.project.id}`}
                    className="text-xs text-blue-600 hover:text-blue-700 mt-3 inline-block"
                  >
                    View Project →
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
