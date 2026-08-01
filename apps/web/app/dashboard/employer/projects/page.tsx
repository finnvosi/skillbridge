'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getToken, apiRequest, ApiError, API_ENDPOINTS } from '@/lib/api-client';
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
  createdAt: string;
  updatedAt: string;
}

interface Application {
  id: string;
  projectId: string;
  studentId: string;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  coverLetter?: string | null;
  createdAt: string;
}

export default function EmployerProjectsPage() {
  const router = useRouter();
  const [user, setUser] = useState<ApiUser | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [applications, setApplications] = useState<Record<string, Application[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

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
    if (!token) return;
    try {
      const data = await apiRequest<{ projects: Project[] }>(API_ENDPOINTS.projects.list, {
        method: 'GET',
        token,
      });
      setProjects(data.projects);

      // Fetch applications for each project
      const apps: Record<string, Application[]> = {};
      for (const project of data.projects) {
        try {
          const appData = await apiRequest<{ applications: Application[] }>(
            `/projects/${project.id}/applications`,
            { method: 'GET', token }
          );
          apps[project.id] = appData.applications;
        } catch {
          // Some projects may have no applications endpoint or be forbidden
        }
      }
      setApplications(apps);
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
    if (user) {
      fetchProjects();
    }
  }, [user, fetchProjects]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) return null;

  if (user.role !== 'employer') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600">This page is for employers only.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">SkillBridge</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {user.name} ({user.role})
            </span>
            <a
              href="/api/auth/logout"
              className="text-gray-600 hover:text-gray-900"
            >
              Logout
            </a>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">My Projects</h2>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
          >
            {showCreateForm ? 'Cancel' : '+ Post Project'}
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
            {error}
          </div>
        )}

        {/* Create Project Form */}
        {showCreateForm && <CreateProjectForm token={token!} />}

        {/* Projects List */}
        {projects.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No projects posted yet. Create one to get started!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                applications={applications[project.id] || []}
                token={token!}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

// --- Sub-components ---

function CreateProjectForm({ token }: { token: string }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<Project['type']>('internship');
  const [budget, setBudget] = useState('');
  const [location, setLocation] = useState('');
  const [remote, setRemote] = useState(false);
  const [skills, setSkills] = useState<string>('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError(null);
    try {
      await apiRequest(API_ENDPOINTS.projects.list, {
        method: 'POST',
        token,
        body: {
          title,
          description,
          type,
          budget: budget ? parseFloat(budget) : undefined,
          location: location || undefined,
          remote,
          skillsRequired: skills
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
        },
      });
      // Reset form
      setTitle('');
      setDescription('');
      setType('internship');
      setBudget('');
      setLocation('');
      setRemote(false);
      setSkills('');
      alert('Project created! You may need to refresh the page.');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to create project');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Project</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={3}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as Project['type'])}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="internship">Internship</option>
              <option value="part_time">Part-time</option>
              <option value="freelance">Freelance</option>
              <option value="full_time">Full-time</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Budget ($)</label>
            <input
              type="number"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="Optional"
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Optional"
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={remote}
                onChange={(e) => setRemote(e.target.checked)}
              />
              <span className="text-sm text-gray-700">Remote</span>
            </label>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Skills (comma-separated)</label>
            <input
              type="text"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="e.g. React, Python, Figma"
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={creating}
          className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 font-medium"
        >
          {creating ? 'Creating...' : 'Post Project'}
        </button>
      </form>
    </div>
  );
}

function ProjectCard({
  project,
  applications,
  token,
}: {
  project: Project;
  applications: Application[];
  token: string;
}) {
  const [updating, setUpdating] = useState<string | null>(null);

  const updateAppStatus = async (appId: string, status: Application['status']) => {
    setUpdating(appId);
    try {
      await apiRequest(`/projects/${project.id}/applications/${appId}`, {
        method: 'PUT',
        token,
        body: { status },
      });
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Failed to update application');
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900">{project.title}</h3>
          <span className={`text-xs px-2 py-1 rounded-full ${
            project.type === 'internship' ? 'bg-blue-100 text-blue-800' :
            project.type === 'part_time' ? 'bg-purple-100 text-purple-800' :
            project.type === 'freelance' ? 'bg-green-100 text-green-800' :
            'bg-orange-100 text-orange-800'
          }`}>
            {project.type.replace('_', ' ')}
          </span>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full ${
          project.status === 'open' ? 'bg-emerald-100 text-emerald-800' :
          project.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {project.status.replace('_', ' ')}
        </span>
      </div>

      <p className="text-gray-700 mb-4 line-clamp-2">{project.description}</p>

      <div className="mb-4">
        <span className="text-sm font-medium text-gray-700">Skills:</span>
        <div className="flex flex-wrap gap-2 mt-1">
          {project.skillsRequired.map((skill) => (
            <span key={skill} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
              {skill}
            </span>
          ))}
        </div>
      </div>

      {project.budget && (
        <p className="text-sm text-gray-600 mb-2">💰 Budget: ${project.budget}</p>
      )}

      {/* Applications */}
      <div className="mt-6 border-t pt-4">
        <h4 className="text-md font-semibold text-gray-800 mb-3">
          Applications ({applications.length})
        </h4>
        {applications.length === 0 ? (
          <p className="text-sm text-gray-500">No applications yet.</p>
        ) : (
          <div className="space-y-3">
            {applications.map((app) => (
              <div key={app.id} className="border rounded-lg p-3 bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      Student ID: {app.studentId}
                    </p>
                    {app.coverLetter && (
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                        {app.coverLetter}
                      </p>
                    )}
                    <span className={`text-xs px-2 py-1 rounded-full mt-1 inline-block ${
                      app.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      app.status === 'accepted' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {app.status}
                    </span>
                  </div>
                  {app.status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateAppStatus(app.id, 'accepted')}
                        disabled={!!updating}
                        className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded hover:bg-green-200"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => updateAppStatus(app.id, 'rejected')}
                        disabled={!!updating}
                        className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded hover:bg-red-200"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


