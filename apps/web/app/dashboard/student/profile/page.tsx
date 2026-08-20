'use client';

import { useEffect, useState, useCallback } from 'react';
import { apiRequest, API_ENDPOINTS, getToken, ApiError } from '@/lib/api-client';
import { getSupabaseCertificatesBucket, getSupabaseClient } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle2, FileText } from 'lucide-react';

interface ProfileShape {
  university?: string | null;
  major?: string | null;
  graduationYear?: number | null;
  skills?: string[];
  bio?: string | null;
  location?: string | null;
}

const REQUIRED_FIELDS: (keyof ProfileShape)[] = [
  'university',
  'major',
  'graduationYear',
  'bio',
  'location',
  'skills',
];

export default function StudentProfilePage() {
  const token = getToken();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [profile, setProfile] = useState<ProfileShape>({});
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [certificateTitle, setCertificateTitle] = useState('');
  const [certificateDescription, setCertificateDescription] = useState('');
  const [certificateFile, setCertificateFile] = useState<File | null>(null);
  const [certificateUploading, setCertificateUploading] = useState(false);
  const [certs, setCerts] = useState<
    { id: string; title: string; description?: string | null; verified: boolean; verificationStatus?: 'pending' | 'verified' | 'rejected'; rejectionReason?: string | null; createdAt: string }[]
  >([]);

  const completion = Math.round(
    (REQUIRED_FIELDS.filter((f) => {
      if (f === 'skills') return (profile.skills?.length ?? 0) > 0;
      return Boolean(profile[f]);
    }).length /
      REQUIRED_FIELDS.length) *
      100
  );

  const fetchProfile = useCallback(async () => {
    if (!token) return;
    try {
      const data = await apiRequest<{ user: { name: string; profile: ProfileShape } }>(
        API_ENDPOINTS.users.profile,
        { method: 'GET', token }
      );
      setName(data.user.name || '');
      const p = data.user.profile || {};
      setProfile(p);
      setSkills(p.skills || []);
    } catch {
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchProfile();
    if (token) {
      apiRequest<{ certificates: { id: string; title: string; description?: string | null; verified: boolean; createdAt: string }[] }>(
        API_ENDPOINTS.certificates.list,
        { method: 'GET', token }
      )
        .then((d) => setCerts(d.certificates ?? []))
        .catch(() => {});
    }
  }, [fetchProfile, token]);

  const addSkill = () => {
    const v = skillInput.trim();
    if (v && !skills.includes(v)) {
      setSkills([...skills, v]);
      setSkillInput('');
    }
  };
  const removeSkill = (s: string) => setSkills(skills.filter((x) => x !== s));

  const selectCertificateFile = (file: File | undefined) => {
    if (!file) return;
    const allowed = ['application/pdf', 'image/png', 'image/jpeg'];
    if (!allowed.includes(file.type)) {
      setError('Certificates must be PDF, PNG, or JPG files');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Certificate files must be 10MB or smaller');
      return;
    }
    setError('');
    setCertificateFile(file);
  };

  const uploadCertificate = async () => {
    if (!token || !certificateTitle.trim() || !certificateFile) {
      setError('Add a certificate title and file before uploading');
      return;
    }

    setCertificateUploading(true);
    setError('');
    setSuccess('');
    try {
      const uploadData = await apiRequest<{
        upload: { path: string; token: string; signedUrl: string };
      }>(API_ENDPOINTS.certificates.uploadUrl, {
        method: 'POST',
        token,
        body: {
          mimeType: certificateFile.type,
          originalName: certificateFile.name,
          fileSize: certificateFile.size,
        },
      });

      const { error: storageError } = await getSupabaseClient()
        .storage
        .from(getSupabaseCertificatesBucket())
        .uploadToSignedUrl(
          uploadData.upload.path,
          uploadData.upload.token,
          certificateFile,
          { contentType: certificateFile.type },
        );
      if (storageError) throw storageError;

      await apiRequest(API_ENDPOINTS.certificates.complete, {
        method: 'POST',
        token,
        body: {
          title: certificateTitle.trim(),
          description: certificateDescription.trim() || undefined,
          fileKey: uploadData.upload.path,
          mimeType: certificateFile.type,
          originalName: certificateFile.name,
          fileSize: certificateFile.size,
        },
      });

      const refreshed = await apiRequest<{
        certificates: { id: string; title: string; description?: string | null; verified: boolean; verificationStatus?: 'pending' | 'verified' | 'rejected'; rejectionReason?: string | null; createdAt: string }[];
      }>(API_ENDPOINTS.certificates.list, { method: 'GET', token });
      setCerts(refreshed.certificates ?? []);
      setCertificateTitle('');
      setCertificateDescription('');
      setCertificateFile(null);
      setSuccess('Certificate uploaded successfully');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Certificate upload failed');
    } finally {
      setCertificateUploading(false);
    }
  };

  const save = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const body: Record<string, unknown> = { name };
      body.university = profile.university || undefined;
      body.major = profile.major || undefined;
      body.graduationYear = profile.graduationYear || undefined;
      body.bio = profile.bio || undefined;
      body.location = profile.location || undefined;
      body.skills = skills;

      const data = await apiRequest<{ user: { name: string; profile: ProfileShape } }>(
        API_ENDPOINTS.users.updateProfile,
        { method: 'PUT', token, body }
      );
      setName(data.user.name);
      setSuccess('Profile updated successfully');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const setField = (k: keyof ProfileShape, v: string) =>
    setProfile((p) => ({ ...p, [k]: v }));

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-extrabold text-gray-900">
          My profile
        </h1>
        <div className="text-right">
          <p className="text-sm text-gray-500">Profile strength</p>
          <p className="text-2xl font-bold text-primary">{completion}%</p>
        </div>
      </div>

      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${completion}%` }}
        />
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-md text-sm text-green-700">
          {success}
        </div>
      )}

      <Card className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Full name</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Bio</label>
          <Textarea
            value={profile.bio || ''}
            onChange={(e) => setField('bio', e.target.value)}
            placeholder="A short intro about you..."
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">University</label>
            <Input
              value={profile.university || ''}
              onChange={(e) => setField('university', e.target.value)}
              placeholder="e.g. RUPP"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Major</label>
            <Input
              value={profile.major || ''}
              onChange={(e) => setField('major', e.target.value)}
              placeholder="e.g. Computer Science"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Graduation year
            </label>
            <Input
              type="number"
              value={profile.graduationYear?.toString() || ''}
              onChange={(e) => setField('graduationYear', e.target.value)}
              placeholder="2027"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Location</label>
            <Input
              value={profile.location || ''}
              onChange={(e) => setField('location', e.target.value)}
              placeholder="e.g. Phnom Penh"
            />
          </div>
        </div>
      </Card>

      <Card>
        <label className="block text-sm font-medium text-gray-700">Skills</label>
        <div className="mt-2 flex gap-2">
          <Input
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={(e) =>
              e.key === 'Enter' && (e.preventDefault(), addSkill())
            }
            placeholder="Add a skill..."
          />
          <Button type="button" variant="outline" onClick={addSkill}>
            Add
          </Button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {skills.map((s) => (
            <Badge key={s} variant="secondary" size="sm">
              {s}{' '}
              <button
                onClick={() => removeSkill(s)}
                className="ml-1 font-bold"
                aria-label={`Remove ${s}`}
              >
                ×
              </button>
            </Badge>
          ))}
          {skills.length === 0 && (
            <p className="text-sm text-gray-500">No skills added yet.</p>
          )}
        </div>
      </Card>

      <Button onClick={save} disabled={saving}>
        {saving ? 'Saving...' : 'Save profile'}
      </Button>

      <Card>
        <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-gray-900">
          <FileText className="h-4 w-4 text-primary" /> Certifications
        </h2>
        <div className="mt-4 space-y-3 rounded-xl border border-gray-100 bg-gray-50 p-4">
          <Input
            value={certificateTitle}
            onChange={(e) => setCertificateTitle(e.target.value)}
            placeholder="Certificate title"
            aria-label="Certificate title"
          />
          <Textarea
            value={certificateDescription}
            onChange={(e) => setCertificateDescription(e.target.value)}
            placeholder="Description (optional)"
            aria-label="Certificate description"
          />
          <Input
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"
            onChange={(e) => selectCertificateFile(e.target.files?.[0])}
            aria-label="Certificate file"
          />
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-gray-500">
              {certificateFile ? certificateFile.name : 'PDF, PNG, or JPG. Maximum 10MB.'}
            </p>
            <Button
              type="button"
              onClick={uploadCertificate}
              disabled={certificateUploading || !certificateTitle.trim() || !certificateFile}
            >
              {certificateUploading ? 'Uploading...' : 'Upload certificate'}
            </Button>
          </div>
        </div>
        {certs.length === 0 ? (
          <p className="mt-2 text-sm text-gray-500">
            No certificates yet. Upload credentials to build trust with employers.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {certs.map((c) => (
              <li
                key={c.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 p-3"
              >
                <div className="min-w-0">
                  <p className="flex items-center gap-2 font-medium text-gray-900">
                    {c.title}
                    {(c.verificationStatus === 'verified' || (!c.verificationStatus && c.verified)) && (
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                    )}
                  </p>
                  {c.description && (
                    <p className="truncate text-xs text-gray-500">{c.description}</p>
                  )}
                  {c.verificationStatus === 'rejected' && c.rejectionReason && (
                    <p className="mt-1 text-xs text-red-600">{c.rejectionReason}</p>
                  )}
                </div>
                <Badge variant={c.verificationStatus === 'verified' || (!c.verificationStatus && c.verified) ? 'primary' : c.verificationStatus === 'rejected' ? 'neutral' : 'outline'} size="sm">
                  {c.verificationStatus === 'rejected' ? 'Rejected' : c.verificationStatus === 'verified' || (!c.verificationStatus && c.verified) ? 'Verified' : 'Pending'}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
