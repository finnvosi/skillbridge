// Worker vertical slice — client for the real SkillBridge API (apps/api).
//
// The API returns a lean, honest job/application/passport shape. The mobile UI
// was designed around richer local fixtures (DemoJob etc.). This module maps
// the API response onto those existing screen types so the UI does not change.
//
// Fields the lean API does not (yet) provide are filled with SAFE, non-faking
// defaults — we never invent verification evidence or skill-match detail. The
// UI is expected to gracefully skip empty arrays (skillMatches, evidence, etc.).
import { apiRequest } from './api';
import { API_ENDPOINTS } from '../config';
import {
  DemoJob,
  DemoApplication,
  DemoPassport,
  ApplicationStatus,
  ShiftType,
  VerificationLevel,
  WorkRecord,
  WorkRecordStatus,
  PassportSkill,
} from '../types';

// ---- API response shapes (subset we consume) -------------------------------

interface ApiJob {
  id: string;
  title: string;
  summary: string | null;
  company: string;
  companyVerified: boolean;
  verificationLevel: VerificationLevel | string;
  payPerMonth: number;
  currency: string;
  shift: ShiftType | string;
  employmentType: 'full_time' | 'contract' | 'seasonal' | string;
  location: string | null;
  distanceKm: number;
  skillsRequired: string[];
  matchReason: string | null;
  accommodation: boolean;
  transportProvided: boolean;
  overtimePaid: boolean;
  lastCheckedDate: string;
}

interface ApiApplication {
  id: string;
  status: string;
  submittedAt: string;
  job: {
    id: string;
    title: string;
    company: string;
    payPerMonth: number;
    currency: string;
    location: string | null;
    distanceKm: number;
  };
}

interface ApiWorkRecord {
  id: string;
  role: string;
  company: string;
  workplace: string | null;
  startDate: string;
  endDate: string | null;
  verified: boolean;
  provenance: string | null;
}

interface ApiPassport {
  id: string;
  fullName: string | null;
  phone: string;
  preferredArea: string | null;
  availability: string | null;
  identityVerified: boolean;
  skills: string[];
  languages: string[];
  workRecords: ApiWorkRecord[];
}

// ---- Status adapter: API enum -> screen ApplicationStatus -------------------
// API: submitted | reviewing | shortlisted | interview | hired | rejected | withdrawn
// Screen: submitted | under_review | interview | accepted | declined | withdrawn
const STATUS_MAP: Record<string, ApplicationStatus> = {
  submitted: 'submitted',
  reviewing: 'under_review',
  shortlisted: 'under_review',
  interview: 'interview',
  hired: 'accepted',
  rejected: 'declined',
  withdrawn: 'withdrawn',
};

function mapStatus(apiStatus: string): ApplicationStatus {
  return STATUS_MAP[apiStatus] ?? 'submitted';
}

// ---- Mappers -----------------------------------------------------------------

function mapJob(j: ApiJob): DemoJob {
  return {
    id: j.id,
    title: j.title,
    company: j.company,
    // Lean API has no legal-name/workplace detail yet — surface the company name
    // honestly; do NOT fabricate a legal entity name.
    companyLegalName: j.company,
    workplace: j.location ?? '',
    location: j.location ?? '',
    distanceKm: j.distanceKm,
    payPerMonth: j.payPerMonth,
    currency: (j.currency as 'USD' | 'KHR') ?? 'USD',
    shift: (j.shift as ShiftType) ?? 'day',
    employmentType: (j.employmentType as DemoJob['employmentType']) ?? 'full_time',
    accommodation: j.accommodation,
    transportProvided: j.transportProvided,
    overtimePaid: j.overtimePaid,
    // Never fabricate a "checked" badge. The lean API uses a 'none'
    // verificationLevel for unverified jobs; fall back to 'none' so the UI
    // renders an honest "Not verified" state instead of faking a check.
    verificationLevel: (j.verificationLevel as VerificationLevel) ?? 'none',
    lastCheckedDate: j.lastCheckedDate,
    // The following arrays are intentionally empty: the lean API does not yet
    // return verification evidence or skill-by-skill matches. The UI skips them
    // when empty, so we never fake a verified badge or a skill match.
    whatWasChecked: [],
    cannotGuarantee: [],
    evidence: [],
    matchStrength: 'possible',
    matchReason: j.matchReason ?? '',
    skillsMatched: 0,
    skillsTotal: 0,
    skillMatches: [],
    missingRequirements: [],
    summary: j.summary ?? '',
  };
}

function mapApplication(a: ApiApplication): DemoApplication {
  return {
    id: a.id,
    jobId: a.job.id,
    jobTitle: a.job.title,
    company: a.job.company,
    status: mapStatus(a.status),
    submittedAt: a.submittedAt,
    sharedFields: [],
    demo: true,
  };
}

function mapPassport(p: ApiPassport): DemoPassport {
  const workRecords: WorkRecord[] = (p.workRecords ?? []).map((r) => {
    const status: WorkRecordStatus = r.verified
      ? 'employer_verified'
      : r.provenance === 'verification_requested'
        ? 'verification_requested'
        : 'self_declared';
    return {
      id: r.id,
      company: r.company,
      workplace: r.workplace ?? '',
      role: r.role,
      startYear: new Date(r.startDate).getFullYear(),
      endYear: r.endDate ? new Date(r.endDate).getFullYear() : null,
      skills: [],
      verifiedBy: r.verified ? r.company : '',
      verifiedAt: '',
      status,
    };
  });

  const skills: PassportSkill[] = (p.skills ?? []).map((s) => ({
    name: s,
    // The lean API does not yet distinguish verified vs unverified skills;
    // default to false so we never over-claim verification.
    verified: false,
  }));

  return {
    fullName: p.fullName ?? '',
    role: '',
    phone: p.phone,
    preferredArea: p.preferredArea ?? '',
    availability: p.availability ?? '',
    identityVerified: p.identityVerified,
    identityMethod: '',
    identityDate: '',
    workRecords,
    skills,
    languages: p.languages ?? [],
    safetyQualifications: [],
    shareEnabled: false,
    demo: true,
  };
}

// ---- Public API -----------------------------------------------------------------

export async function fetchJobs(): Promise<DemoJob[]> {
  const data = await apiRequest<{ jobs: ApiJob[] }>(API_ENDPOINTS.worker.jobs);
  return (data.jobs ?? []).map(mapJob);
}

export async function fetchJob(id: string): Promise<DemoJob | null> {
  try {
    const j = await apiRequest<ApiJob>(API_ENDPOINTS.worker.job(id));
    return mapJob(j);
  } catch {
    return null;
  }
}

export async function fetchApplications(token?: string | null): Promise<DemoApplication[]> {
  const data = await apiRequest<{ applications: ApiApplication[] }>(
    API_ENDPOINTS.worker.applications,
    token ? { method: 'GET', token } : { method: 'GET' },
  );
  return (data.applications ?? []).map(mapApplication);
}

export async function fetchPassport(token?: string | null): Promise<DemoPassport | null> {
  try {
    const p = await apiRequest<ApiPassport>(
      API_ENDPOINTS.worker.passport,
      token ? { method: 'GET', token } : { method: 'GET' },
    );
    return mapPassport(p);
  } catch {
    return null;
  }
}

export async function submitApplication(
  jobId: string,
  shareWorkRecords = false,
  token?: string | null,
): Promise<{ applicationId: string; status: string }> {
  const data = await apiRequest<{ applicationId: string; status: string }>(
    API_ENDPOINTS.worker.apply,
    {
      method: 'POST',
      body: { jobId, shareWorkRecords },
      ...(token ? { token } : {}),
    },
  );
  return data;
}

export interface PassportEditable {
  fullName?: string;
  preferredArea?: string;
  availability?: string;
  skills?: string[];
  languages?: string[];
}

export async function updatePassport(
  body: PassportEditable,
  token?: string | null,
): Promise<DemoPassport | null> {
  try {
    const res = await apiRequest<{ passport?: ApiPassport } & ApiPassport>(
      API_ENDPOINTS.worker.updatePassport,
      {
        method: 'PATCH',
        body,
        ...(token ? { token } : {}),
      },
    );
    // The endpoint returns flat fields (same shape as GET /me/passport). If a
    // future version wraps the payload in a `passport` key, unwrap it so this
    // client keeps working.
    const p = (res as any).passport ?? res;
    return mapPassport(p as ApiPassport);
  } catch {
    return null;
  }
}

// ---- Notifications -----------------------------------------------------------

export interface AppNotification {
  id: string;
  type: string;
  title: string;
  body: string;
  readAt: string | null;
  createdAt: string;
}

export async function fetchNotifications(
  token?: string | null,
): Promise<AppNotification[]> {
  const data = await apiRequest<{ notifications: AppNotification[] }>(
    API_ENDPOINTS.worker.notifications,
    token ? { method: 'GET', token } : { method: 'GET' },
  );
  return data.notifications ?? [];
}

export async function markNotificationRead(
  id: string,
  token?: string | null,
): Promise<void> {
  await apiRequest(API_ENDPOINTS.worker.notificationRead(id), {
    method: 'POST',
    ...(token ? { token } : {}),
  });
}

// ---- Work records (Career Passport employment history) -----------------------

export interface WorkRecordEditable {
  role: string;
  company: string;
  workplace?: string;
  startDate: string; // YYYY-MM
  endDate?: string | null;
}

export async function addWorkRecord(
  body: WorkRecordEditable,
  token?: string | null,
): Promise<ApiWorkRecord> {
  const data = await apiRequest<{ record: ApiWorkRecord }>(
    API_ENDPOINTS.worker.workRecords,
    {
      method: 'POST',
      body,
      ...(token ? { token } : {}),
    },
  );
  return data.record;
}

export async function deleteWorkRecord(
  id: string,
  token?: string | null,
): Promise<void> {
  await apiRequest(API_ENDPOINTS.worker.workRecord(id), {
    method: 'DELETE',
    ...(token ? { token } : {}),
  });
}

export async function requestWorkRecordVerification(
  id: string,
  token?: string | null,
): Promise<ApiWorkRecord> {
  const data = await apiRequest<{ record: ApiWorkRecord }>(
    API_ENDPOINTS.worker.requestVerification(id),
    {
      method: 'POST',
      ...(token ? { token } : {}),
    },
  );
  return data.record;
}

export async function completeOnboarding(
  token?: string | null,
): Promise<{ id: string; onboardingCompleted: boolean }> {
  const data = await apiRequest<{
    user: { id: string; onboardingStep: number; onboardingCompletedAt: string | null };
  }>(API_ENDPOINTS.worker.onboardingComplete, {
    method: 'POST',
    ...(token ? { token } : {}),
  });
  return {
    id: data.user.id,
    onboardingCompleted: Boolean(data.user.onboardingCompletedAt),
  };
}

// ---- Career Passport sharing -------------------------------------------------

export interface PassportShare {
  id: string;
  token: string;
  expiresAt: string;
  revokedAt: string | null;
  url: string;
}

export async function createPassportShare(
  expiresInHours = 24,
  token?: string | null,
): Promise<PassportShare> {
  const data = await apiRequest<{ share: PassportShare }>(
    API_ENDPOINTS.worker.passportShares,
    {
      method: 'POST',
      body: { expiresInHours },
      ...(token ? { token } : {}),
    },
  );
  return data.share;
}

export async function listPassportShares(
  token?: string | null,
): Promise<PassportShare[]> {
  const data = await apiRequest<{ shares: PassportShare[] }>(
    API_ENDPOINTS.worker.passportShares,
    token ? { method: 'GET', token } : { method: 'GET' },
  );
  return data.shares ?? [];
}

export async function revokePassportShare(
  id: string,
  token?: string | null,
): Promise<void> {
  await apiRequest(API_ENDPOINTS.worker.passportShare(id), {
    method: 'DELETE',
    ...(token ? { token } : {}),
  });
}

// ---- Safety reports & blocks -------------------------------------------------

export interface WorkerReport {
  id: string;
  category: string;
  description: string;
  status: 'submitted' | 'under_review' | 'resolved';
  adminNote: string | null;
  createdAt: string;
  resolvedAt: string | null;
}

export async function submitReport(
  body: { category: string; description: string; evidence?: string },
  token?: string | null,
): Promise<{ id: string; status: string }> {
  const data = await apiRequest<{ report: { id: string; status: string } }>(
    API_ENDPOINTS.worker.reports,
    {
      method: 'POST',
      body,
      ...(token ? { token } : {}),
    },
  );
  return data.report;
}

export async function fetchReports(
  token?: string | null,
): Promise<WorkerReport[]> {
  const data = await apiRequest<{ reports: WorkerReport[] }>(
    API_ENDPOINTS.worker.reports,
    token ? { method: 'GET', token } : { method: 'GET' },
  );
  return data.reports ?? [];
}

export async function blockJob(
  jobId: string,
  token?: string | null,
): Promise<void> {
  await apiRequest(API_ENDPOINTS.worker.blocks, {
    method: 'POST',
    body: { jobId },
    ...(token ? { token } : {}),
  });
}

export async function unblockJob(
  jobId: string,
  token?: string | null,
): Promise<void> {
  await apiRequest(API_ENDPOINTS.worker.block(jobId), {
    method: 'DELETE',
    ...(token ? { token } : {}),
  });
}

export async function fetchBlockedJobIds(
  token?: string | null,
): Promise<string[]> {
  const data = await apiRequest<{ jobIds: string[] }>(
    API_ENDPOINTS.worker.blocks,
    token ? { method: 'GET', token } : { method: 'GET' },
  );
  return data.jobIds ?? [];
}
