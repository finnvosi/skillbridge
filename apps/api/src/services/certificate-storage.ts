import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import crypto from 'crypto';

export const CERTIFICATE_MAX_BYTES = 10 * 1024 * 1024;
export const CERTIFICATE_SIGNED_URL_TTL_SECONDS = 5 * 60;

const MIME_TO_EXTENSION: Record<string, string> = {
  'application/pdf': 'pdf',
  'image/png': 'png',
  'image/jpeg': 'jpg',
};

let client: SupabaseClient | null = null;

function getConfig() {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bucket = process.env.SUPABASE_CERTIFICATES_BUCKET || 'certificates';

  if (!url || !serviceRoleKey) {
    const error = new Error('Certificate storage is not configured');
    (error as Error & { status?: number }).status = 503;
    throw error;
  }

  return { url, serviceRoleKey, bucket };
}

function getClient() {
  if (!client) {
    const { url, serviceRoleKey } = getConfig();
    client = createClient(url, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
  return client;
}

export function validateCertificateMetadata(
  mimeType: string,
  originalName: string,
  fileSize: number,
) {
  const extension = MIME_TO_EXTENSION[mimeType];
  if (!extension) {
    throw new Error('Only PDF, PNG, and JPG certificates are supported');
  }
  if (!Number.isInteger(fileSize) || fileSize <= 0) {
    throw new Error('Certificate file is empty or invalid');
  }
  if (fileSize > CERTIFICATE_MAX_BYTES) {
    throw new Error('File too large. Maximum 10MB.');
  }

  const originalExtension = originalName.split('.').pop()?.toLowerCase();
  const allowedExtensions = extension === 'jpg' ? ['jpg', 'jpeg'] : [extension];
  if (!originalExtension || !allowedExtensions.includes(originalExtension)) {
    throw new Error('File extension does not match the supplied file type');
  }

  return extension;
}

export function decodeCertificateBase64(base64: string) {
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(base64) || base64.length % 4 !== 0) {
    throw new Error('Invalid base64 file data');
  }
  const buffer = Buffer.from(base64, 'base64');
  if (buffer.length === 0) throw new Error('Certificate file is empty or invalid');
  return buffer;
}

export function assertCertificateSignature(
  buffer: Buffer,
  mimeType: string,
) {
  const isPdf = mimeType === 'application/pdf' && buffer.subarray(0, 5).toString() === '%PDF-';
  const isPng =
    mimeType === 'image/png' &&
    buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  const isJpeg =
    mimeType === 'image/jpeg' &&
    buffer.length >= 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff;

  if (!isPdf && !isPng && !isJpeg) {
    throw new Error('File content does not match the supplied file type');
  }
}

export function buildCertificateKey(studentId: string, extension: string) {
  return `students/${studentId}/${crypto.randomBytes(16).toString('hex')}.${extension}`;
}

function isManagedCertificateKey(fileKey: string) {
  return /^students\/[A-Za-z0-9_-]+\/[a-f0-9]{32}\.(pdf|png|jpg)$/.test(fileKey);
}

export async function uploadCertificateObject(
  fileKey: string,
  buffer: Buffer,
  mimeType: string,
) {
  const { bucket } = getConfig();
  const { error } = await getClient().storage.from(bucket).upload(fileKey, buffer, {
    contentType: mimeType,
    cacheControl: '3600',
    upsert: false,
  });
  if (error) {
    const storageError = new Error('Certificate upload failed');
    (storageError as Error & { status?: number }).status = 502;
    throw storageError;
  }
}

export async function createCertificateDownloadUrl(fileKey: string) {
  if (!isManagedCertificateKey(fileKey)) return null;
  const { bucket } = getConfig();
  const { data, error } = await getClient().storage
    .from(bucket)
    .createSignedUrl(fileKey, CERTIFICATE_SIGNED_URL_TTL_SECONDS);
  if (error || !data?.signedUrl) {
    const storageError = new Error('Certificate download URL could not be created');
    (storageError as Error & { status?: number }).status = 502;
    throw storageError;
  }
  return data.signedUrl;
}

export async function deleteCertificateObject(fileKey: string) {
  if (!isManagedCertificateKey(fileKey)) return;
  const { bucket } = getConfig();
  const { error } = await getClient().storage.from(bucket).remove([fileKey]);
  if (error) {
    const storageError = new Error('Certificate file could not be deleted');
    (storageError as Error & { status?: number }).status = 502;
    throw storageError;
  }
}
