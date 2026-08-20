'use client';

import { useCallback, useEffect, useState } from 'react';
import { ExternalLink, FileText } from 'lucide-react';
import { apiRequest, API_ENDPOINTS, ApiError, getToken } from '@/lib/api-client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { PageHeader } from '@/components/layout/page-header';

type Certificate = {
  id: string;
  title: string;
  description?: string | null;
  mimeType: string;
  fileSize: number;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  verificationNote?: string | null;
  rejectionReason?: string | null;
  previewUrl?: string | null;
  createdAt: string;
  student: { id: string; name: string; email: string };
};

export default function AdminCertificatesPage() {
  const token = getToken();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<Certificate | null>(null);
  const [note, setNote] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const data = await apiRequest<{ certificates: Certificate[] }>(
        API_ENDPOINTS.admin.certificates,
        { method: 'GET', token },
      );
      setCertificates(data.certificates ?? []);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load certificates');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  const review = async (status: 'verified' | 'rejected') => {
    if (!selected || !token) return;
    if (status === 'rejected' && rejectionReason.trim().length < 3) {
      setError('A rejection reason is required');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await apiRequest(API_ENDPOINTS.admin.reviewCertificate(selected.id), {
        method: 'PATCH',
        token,
        body: {
          status,
          verificationNote: note.trim() || undefined,
          rejectionReason: status === 'rejected' ? rejectionReason.trim() : undefined,
        },
      });
      setSelected(null);
      setNote('');
      setRejectionReason('');
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to update certificate');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Admin"
        title="Certificate review"
        subtitle="Verify the work students want employers to trust."
      />

      {error && <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      {loading ? (
        <Card className="p-6">Loading certificate queue...</Card>
      ) : certificates.length === 0 ? (
        <Card className="p-8 text-center">
          <FileText className="mx-auto h-8 w-8 text-primary" />
          <p className="mt-3 font-medium text-gray-900">No pending certificates</p>
          <p className="mt-1 text-sm text-gray-500">The review queue is clear.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {certificates.map((certificate) => (
            <Card key={certificate.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-display text-lg font-bold text-gray-900">{certificate.title}</h2>
                  <Badge variant="outline">{certificate.mimeType}</Badge>
                </div>
                <p className="mt-1 text-sm text-gray-600">
                  {certificate.student.name} · {certificate.student.email}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  {Math.round(certificate.fileSize / 1024)} KB · {new Date(certificate.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                {certificate.previewUrl && (
                  <Button asChild variant="outline" size="sm">
                    <a href={certificate.previewUrl} target="_blank" rel="noreferrer">
                      Preview <ExternalLink className="ml-2 h-3.5 w-3.5" />
                    </a>
                  </Button>
                )}
                <Button size="sm" onClick={() => setSelected(certificate)}>
                  Review
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {selected && (
        <Card className="space-y-4 border-primary/20 bg-[#FBF9FF] p-5">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary/70">Review decision</p>
            <h2 className="mt-2 font-display text-xl font-bold text-gray-900">{selected.title}</h2>
            <p className="mt-1 text-sm text-gray-600">Internal notes stay private. Rejection reason is shown to the student.</p>
          </div>
          <Textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="Internal review note (optional)" aria-label="Internal review note" />
          <Textarea value={rejectionReason} onChange={(event) => setRejectionReason(event.target.value)} placeholder="Rejection reason, required when rejecting" aria-label="Rejection reason" />
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="outline" onClick={() => setSelected(null)} disabled={saving}>Cancel</Button>
            <Button variant="outline" onClick={() => void review('rejected')} disabled={saving}>Reject</Button>
            <Button onClick={() => void review('verified')} disabled={saving}>{saving ? 'Saving...' : 'Approve'}</Button>
          </div>
        </Card>
      )}
    </div>
  );
}
