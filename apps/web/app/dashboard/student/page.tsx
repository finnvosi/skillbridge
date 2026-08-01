'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getToken, clearToken, apiRequest, ApiError, API_ENDPOINTS, ApiUser } from '@/lib/api-client';

interface ProfileShape {
  university?: string | null;
  major?: string | null;
  graduationYear?: number | null;
  skills?: string[];
  companyName?: string;
  industry?: string;
  companySize?: number;
}

export default function StudentDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<ApiUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [university, setUniversity] = useState('');
  const [major, setMajor] = useState('');
  const [graduationYear, setGraduationYear] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');

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
      setName(data.user.name || '');
    } catch {
      clearToken();
      router.push('/auth/login');
    }
  }, [token, router]);

  const fetchProfile = useCallback(async () => {
    if (!token) return;
    try {
      const data = await apiRequest<{ user: { name: string; profile: ProfileShape } }>(
        API_ENDPOINTS.users.profile,
        { method: 'GET', token }
      );
      setUser((prev) => (prev ? { ...prev, name: data.user.name } : prev));
      setName(data.user.name || '');
      const p = data.user.profile || {};
      setUniversity(p.university || '');
      setMajor(p.major || '');
      setGraduationYear(p.graduationYear ? String(p.graduationYear) : '');
      setSkills(p.skills || []);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (user?.role === 'student') {
      fetchProfile();
    }
  }, [user, fetchProfile]);

  const addSkill = () => {
    const v = skillInput.trim();
    if (v && !skills.includes(v)) {
      setSkills([...skills, v]);
      setSkillInput('');
    }
  };

  const removeSkill = (s: string) => setSkills(skills.filter((x) => x !== s));

  const save = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const body: Record<string, unknown> = { name };
      body.university = university || undefined;
      body.major = major || undefined;
      body.graduationYear = graduationYear ? parseInt(graduationYear, 10) : undefined;
      body.skills = skills;

      const data = await apiRequest<{ user: { name: string; profile: ProfileShape } }>(
        API_ENDPOINTS.users.updateProfile,
        { method: 'PUT', token, body }
      );
      setUser((prev) => (prev ? { ...prev, name: data.user.name } : prev));
      setName(data.user.name);
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) return null;

  if (user.role !== 'student') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600">This page is for students only.</p>
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
          <div className="flex items-center gap-6">
            <Link href="/dashboard/student" className="text-gray-600 hover:text-gray-900">Profile</Link>
            <Link href="/dashboard/student/projects" className="text-gray-600 hover:text-gray-900">Projects</Link>
            <Link href="/dashboard/student/applications" className="text-gray-600 hover:text-gray-900">Applications</Link>
            <span className="text-sm text-gray-600">{user?.name}</span>
            <button
              onClick={() => {
                clearToken();
                router.push('/auth/login');
              }}
              className="text-gray-600 hover:text-gray-900"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">My Profile</h2>
          <button
            onClick={() => router.push('/dashboard')}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            ← Back to Dashboard
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md text-green-700">
            {success}
          </div>
        )}

        {/* Profile Form */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={user.email}
                disabled
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
              />
            </div>
          </div>
        </div>

        {/* Student Fields */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Education</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">University</label>
              <input
                type="text"
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                placeholder="e.g. RUPP"
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Major</label>
              <input
                type="text"
                value={major}
                onChange={(e) => setMajor(e.target.value)}
                placeholder="e.g. Computer Science"
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Graduation Year</label>
              <input
                type="number"
                value={graduationYear}
                onChange={(e) => setGraduationYear(e.target.value)}
                placeholder="2027"
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Skills */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills</h3>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
              placeholder="Add a skill..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              onClick={addSkill}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
              >
                {skill}
                <button
                  onClick={() => removeSkill(skill)}
                  className="hover:text-blue-600"
                >
                  ×
                </button>
              </span>
            ))}
            {skills.length === 0 && (
              <p className="text-sm text-gray-500">No skills added yet. Add some to get started!</p>
            )}
          </div>
        </div>

        {/* Certificates Section */}
        <CertificatesSection token={token!} />

        {/* Save Button */}
        <div className="flex gap-4">
          <button
            onClick={save}
            disabled={saving}
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 font-medium"
          >
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-medium"
          >
            Cancel
          </button>
        </div>
      </main>
    </div>
  );
}

// ─── Certificates Section Component ───
interface Certificate {
  id: string;
  title: string;
  description?: string | null;
  fileUrl: string;
  mimeType: string;
  fileSize: number;
  verified: boolean;
  createdAt: string;
}

function CertificatesSection({ token }: { token: string }) {
  const [certificates, setCertificates] = React.useState<Certificate[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [uploading, setUploading] = React.useState(false);

  const [certTitle, setCertTitle] = React.useState('');
  const [certDesc, setCertDesc] = React.useState('');
  const [certFile, setCertFile] = React.useState<File | null>(null);

  const loadCerts = React.useCallback(async () => {
    try {
      const data = await apiRequest<{ certificates: Certificate[] }>(
        API_ENDPOINTS.certificates.list,
        { method: 'GET', token }
      );
      setCertificates(data.certificates);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load certificates');
    } finally {
      setLoading(false);
    }
  }, [token]);

  React.useEffect(() => {
    loadCerts();
  }, [loadCerts]);

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Strip the data URL prefix (e.g. "data:application/pdf;base64,")
        resolve(result.split(',')[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!certTitle.trim() || !certFile) {
      setError('Please provide a title and select a file');
      return;
    }
    setUploading(true);
    setError(null);
    setSuccess(null);
    try {
      const base64 = await fileToBase64(certFile);
      await apiRequest(API_ENDPOINTS.certificates.upload, {
        method: 'POST',
        token,
        body: {
          title: certTitle,
          description: certDesc || undefined,
          file: {
            base64,
            mimeType: certFile.type,
            originalName: certFile.name,
          },
        },
      });
      setSuccess('Certificate uploaded!');
      setCertTitle('');
      setCertDesc('');
      setCertFile(null);
      loadCerts();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Certificates</h3>

      {/* Upload Form */}
      <form onSubmit={handleUpload} className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Title</label>
          <input
            type="text"
            value={certTitle}
            onChange={(e) => setCertTitle(e.target.value)}
            placeholder="e.g. AWS Certified Developer"
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Description (optional)</label>
          <textarea
            value={certDesc}
            onChange={(e) => setCertDesc(e.target.value)}
            rows={2}
            placeholder="What is this certification for?"
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">File (PDF, image, etc.)</label>
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.gif,.doc,.docx"
            onChange={(e) => setCertFile(e.target.files?.[0] || null)}
            className="mt-1 w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {certFile && (
            <p className="text-xs text-gray-500 mt-1">
              {certFile.name} ({formatSize(certFile.size)})
            </p>
          )}
        </div>
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">{error}</div>
        )}
        {success && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-md text-sm text-green-700">{success}</div>
        )}
        <button
          type="submit"
          disabled={uploading || !certTitle || !certFile}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 font-medium"
        >
          {uploading ? 'Uploading...' : 'Upload Certificate'}
        </button>
      </form>

      {/* Certificates List */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : (
        <div className="space-y-3">
          {certificates.map((cert) => (
            <div key={cert.id} className="border border-gray-200 rounded-lg p-4 flex justify-between items-center">
              <div>
                <h4 className="font-medium text-gray-900">{cert.title}</h4>
                {cert.description && <p className="text-sm text-gray-600 mt-1">{cert.description}</p>}
                <p className="text-xs text-gray-500 mt-1">
                  {formatSize(cert.fileSize)} · {new Date(cert.createdAt).toLocaleDateString()}
                  {cert.verified && ' · ✅ Verified'}
                </p>
              </div>
              <a
                href={cert.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
              >
                View
              </a>
            </div>
          ))}
          {certificates.length === 0 && (
            <p className="text-center text-gray-500 py-8">No certificates uploaded yet.</p>
          )}
        </div>
      )}
    </div>
  );
}

// Fix: useState isn't defined in JSX context — this was causing a conflict
