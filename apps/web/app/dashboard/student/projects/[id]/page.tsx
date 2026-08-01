'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getToken, apiRequest, ApiError, API_ENDPOINTS } from '@/lib/api-client';
import Link from 'next/link';
import type { ApiUser } from '@/lib/api-client';

interface Project {
  id: string;
  title: string;
  description: string;
  type: 'internship' | 'part_time' | 'freelance' | 'full_time';
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  budget?: number | null;
  skillsRequired: string[];
  location?: string | null;
  remote: boolean;
  employer?: { user?: { name?: string } };
  createdAt: string;
}

export default function ProjectDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const projectId = params?.id;

  const [user, setUser] = useState<ApiUser | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
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
      router.push('/auth/login');
    }
  }, [token, router]);

  const fetchProject = useCallback(async () => {
    if (!projectId) return;
    try {
      const data = await apiRequest<{ project: Project }>(
        API_ENDPOINTS.projects.detail(projectId),
        { method: 'GET', token }
      );
      setProject(data.project);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load project');
    } finally {
      setLoading(false);
    }
  }, [projectId, token]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (user?.role === 'student') {
      fetchProject();
    } else if (user) {
      router.push('/dashboard');
    }
  }, [user, fetchProject, router]);

  const apply = async () => {
    if (!project) return;
    setApplying(true);
    try {
      await apiRequest(API_ENDPOINTS.projects.apply(project.id), {
        method: 'POST',
        token,
        body: { coverLetter: 'I would love to work on this project.' },
      });
      alert(`Applied to "${project.title}"!`);
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Failed to apply');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!project) return null;

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

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow p-8">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-3xl font-bold text-gray-900">{project.title}</h2>
            <span className={`text-xs px-3 py-1 rounded-full ${
              project.status === 'open' ? 'bg-green-100 text-green-800' :
              project.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {project.status.replace('_', ' ')}
            </span>
          </div>

          {project.description && (
            <p className="text-gray-700 mb-6 leading-relaxed">{project.description}</p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase">Type</h3>
              <p className="mt-1 text-gray-900">
                {project.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase">Budget</h3>
              <p className="mt-1 text-2xl font-bold text-blue-600">
                {project.budget ? `$${project.budget}` : 'TBD'}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase">Location</h3>
              <p className="mt-1 text-gray-900">
                {project.remote ? 'Remote' : project.location || 'Onsite'}
              </p>
            </div>
            {project.employer?.user?.name && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase">Posted by</h3>
                <p className="mt-1 text-gray-900">{project.employer.user.name}</p>
              </div>
            )}
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase mb-2">Skills Required</h3>
            <div className="flex flex-wrap gap-2">
              {project.skillsRequired.map((skill) => (
                <span key={skill} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
              {error}
            </div>
          )}

          {user?.role === 'student' && (
            <button
              onClick={apply}
              disabled={applying}
              className="w-full md:w-auto px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 font-medium"
            >
              {applying ? 'Applying...' : 'Apply Now'}
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
