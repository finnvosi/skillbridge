'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getToken, apiRequest, ApiError, API_ENDPOINTS } from '@/lib/api-client';
import type { ApiUser } from '@/lib/api-client';
import Link from 'next/link';

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

const TYPE_LABELS: Record<string, string> = {
  internship: 'Internship',
  part_time: 'Part-time',
  freelance: 'Freelance',
  full_time: 'Full-time',
};

const TYPE_COLORS: Record<string, string> = {
  internship: 'bg-blue-100 text-blue-800',
  part_time: 'bg-purple-100 text-purple-800',
  freelance: 'bg-green-100 text-green-800',
  full_time: 'bg-orange-100 text-orange-800',
};

export default function StudentProjectsPage() {
  const router = useRouter();
  const [user, setUser] = useState<ApiUser | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applyingId, setApplyingId] = useState<string | null>(null);

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

  const fetchProjects = useCallback(async () => {
    try {
      const data = await apiRequest<{ projects: Project[] }>(
        API_ENDPOINTS.projects.list,
        { method: 'GET', token }
      );
      setProjects(data.projects);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (user?.role === 'student') {
      fetchProjects();
    } else if (user) {
      // Redirect non-students
      if (user.role === 'employer') router.push('/dashboard/employer/projects');
      else router.push('/dashboard');
    }
  }, [user, fetchProjects, router]);

  const apply = async (project: Project) => {
    if (user?.role !== 'student') return;
    setApplyingId(project.id);
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
      setApplyingId(null);
    }
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
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user?.name}</span>
            <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">Dashboard</Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Browse Projects</h2>
          <Link
            href="/dashboard/student/applications"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            My Applications →
          </Link>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
            {error}
          </div>
        )}

        {projects.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No projects available yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div key={project.id} className="bg-white rounded-lg shadow p-6 flex flex-col">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-bold text-gray-900 line-clamp-1">{project.title}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${TYPE_COLORS[project.type] || 'bg-gray-100 text-gray-800'}`}>
                    {TYPE_LABELS[project.type] || project.type}
                  </span>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-1">
                  {project.description}
                </p>

                <div className="mb-3">
                  <div className="flex flex-wrap gap-1">
                    {project.skillsRequired.map((skill) => (
                      <span key={skill} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-bold text-blue-600">
                    {project.budget ? `$${project.budget}` : 'Budget TBD'}
                  </span>
                  <span className="text-sm text-gray-500">
                    {project.remote ? '🌐 Remote' : project.location ? `📍 ${project.location}` : '📍 Onsite'}
                  </span>
                </div>

                {project.employer?.user?.name && (
                  <p className="text-xs text-gray-500 mb-3">Posted by: {project.employer.user.name}</p>
                )}

                <Link
                  href={`/dashboard/student/projects/${project.id}`}
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm mb-3 inline-block"
                >
                  View Details →
                </Link>

                <button
                  onClick={() => apply(project)}
                  disabled={applyingId === project.id}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 font-medium text-sm"
                >
                  {applyingId === project.id ? 'Applying...' : 'Apply Now'}
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
