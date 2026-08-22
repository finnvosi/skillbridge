export type ProjectType =
  "internship" | "part_time" | "freelance" | "full_time";

export type ApplicationStatus =
  | "pending"
  | "reviewing"
  | "shortlisted"
  | "accepted"
  | "hired"
  | "rejected"
  | "withdrawn";

export interface Project {
  id: string;
  title: string;
  description: string;
  type: ProjectType;
  budget?: number | null;
  startDate?: string | null;
  endDate?: string | null;
  skillsRequired: string[];
  location?: string | null;
  remote: boolean;
  status: string;
  createdAt: string;
  employer?: {
    id: string;
    companyName?: string | null;
    user?: { name: string };
  } | null;
}

export interface MatchedProject extends Project {
  matchScore: number;
  skillMatches: string[];
}

export interface Student {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
  university?: string | null;
  major?: string | null;
  graduationYear?: number | null;
  skills: string[];
  certCount: number;
  verifiedCertCount: number;
  applicationCount: number;
}

export interface Application {
  id: string;
  projectId: string;
  studentId: string;
  coverLetter?: string | null;
  proposedBudget?: number | null;
  status: ApplicationStatus;
  createdAt: string;
  updatedAt?: string;
  reviewNote?: string | null;
  candidateFeedback?: string | null;
  project?: Project;
  student?: {
    id: string;
    university?: string | null;
    major?: string | null;
    skills?: string[];
    certificates?: Array<{
      id: string;
      title: string;
      verified: boolean;
      verificationStatus: "pending" | "verified" | "rejected";
      verifiedAt?: string | null;
    }>;
    user?: { name: string; email: string };
  };
}

export const APPLICATION_STATUS_TRANSITIONS: Record<
  ApplicationStatus,
  ApplicationStatus[]
> = {
  pending: ["reviewing", "rejected", "withdrawn"],
  reviewing: ["shortlisted", "rejected", "withdrawn"],
  shortlisted: ["accepted", "rejected", "withdrawn"],
  accepted: ["hired", "withdrawn"],
  hired: [],
  rejected: [],
  withdrawn: [],
};

export const TYPE_LABELS: Record<ProjectType, string> = {
  internship: "Internship",
  part_time: "Part-time",
  freelance: "Freelance",
  full_time: "Full-time",
};

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  pending: "Submitted",
  reviewing: "Reviewing",
  shortlisted: "Shortlisted",
  accepted: "Accepted",
  hired: "Hired",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
};
