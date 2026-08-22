// Worker vertical-slice domain types. Local prototype types only —
// these are NOT the API contract and are not persisted to any backend.

export type Locale = 'km' | 'en';

export type VerificationLevel = 'job_checked' | 'company_checked' | 'identity_checked';

export type ShiftType = 'day' | 'night' | 'rotating' | 'flexible';

export type MatchStrength = 'strong' | 'possible' | 'missing';

export interface SkillMatch {
  skill: string;
  matched: boolean;
  verified: boolean;
}

export interface VerificationEvidence {
  label: string; // e.g. "Company legal name"
  detail: string; // e.g. "Reliable Garment Co. (registered)"
  checked: boolean;
}

export interface DemoJob {
  id: string;
  title: string;
  company: string;
  companyLegalName: string;
  workplace: string;
  location: string;
  distanceKm: number;
  payPerMonth: number;
  currency: 'USD' | 'KHR';
  shift: ShiftType;
  employmentType: 'full_time' | 'contract' | 'seasonal';
  accommodation: boolean;
  transportProvided: boolean;
  overtimePaid: boolean;
  verificationLevel: VerificationLevel;
  lastCheckedDate: string; // ISO date
  whatWasChecked: string[];
  cannotGuarantee: string[];
  evidence: VerificationEvidence[];
  matchStrength: MatchStrength;
  matchReason: string;
  skillsMatched: number;
  skillsTotal: number;
  skillMatches: SkillMatch[];
  missingRequirements: string[];
  summary: string; // short respectful description
}

export type ApplicationStatus =
  | 'submitted'
  | 'under_review'
  | 'interview'
  | 'accepted'
  | 'declined'
  | 'withdrawn';

export interface DemoApplication {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  status: ApplicationStatus;
  submittedAt: string; // ISO datetime
  // Which Passport fields were shared in this demo submission.
  sharedFields: string[];
  demo: true;
}

export type WorkRecordStatus =
  | 'employer_verified'
  | 'verification_requested'
  | 'self_declared';

export interface WorkRecord {
  id: string;
  company: string;
  workplace: string;
  role: string;
  startYear: number;
  endYear: number | null; // null = present
  skills: string[];
  verifiedBy: string; // employer name
  verifiedAt: string; // ISO date
  status: WorkRecordStatus;
}

export interface PassportSkill {
  name: string;
  verified: boolean;
}

export interface DemoPassport {
  fullName: string;
  role: string;
  phone: string;
  preferredArea: string;
  availability: string;
  identityVerified: boolean;
  identityMethod: string;
  identityDate: string;
  workRecords: WorkRecord[];
  skills: PassportSkill[];
  languages: string[];
  safetyQualifications: string[];
  shareEnabled: boolean;
  // Honest demo state — there is no production connection.
  demo: true;
}

export type ReportCategory =
  | 'payment_requested'
  | 'false_information'
  | 'recruiter_identity'
  | 'unsafe_contact'
  | 'other';
