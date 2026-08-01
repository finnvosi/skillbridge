// User types
export type UserRole = 'student' | 'employer' | 'admin' | 'factory' | 'worker';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Student {
  id: string;
  userId: string;
  university: string;
  major: string;
  graduationYear?: number;
  skills: string[];
  portfolio: PortfolioItem[];
  verifiedWorkExperience: WorkExperience[];
}

export interface Employer {
  id: string;
  userId: string;
  companyName: string;
  industry: string;
  companySize: number;
  verified: boolean;
  verifiedAt?: Date;
}

export interface Factory {
  id: string;
  userId: string;
  factoryName: string;
  location: string;
  capacity: number;
  verified: boolean;
}

// Project types
export type ProjectStatus = 'open' | 'in-progress' | 'completed' | 'cancelled';
export type ProjectType = 'internship' | 'part-time' | 'freelance' | 'full-time';

export interface Project {
  id: string;
  title: string;
  description: string;
  employerId: string;
  type: ProjectType;
  status: ProjectStatus;
  budget?: number;
  startDate?: Date;
  endDate?: Date;
  skillsRequired: string[];
  location?: string;
  remote: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Application {
  id: string;
  projectId: string;
  studentId: string;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  coverLetter?: string;
  proposedBudget?: number;
  createdAt: Date;
  updatedAt: Date;
}

// Portfolio types
export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  projectUrl?: string;
  technologies: string[];
  createdAt: Date;
}

export interface WorkExperience {
  id: string;
  projectId: string;
  employerId: string;
  position: string;
  startDate: Date;
  endDate?: Date;
  description: string;
  verified: boolean;
  verifiedAt?: Date;
  employerRating?: number;
}

// AI types
export interface AIResume {
  id: string;
  studentId: string;
  content: string;
  template: string;
  createdAt: Date;
}

export interface CareerRecommendation {
  id: string;
  studentId: string;
  recommendedProjects: Project[];
  recommendedSkills: string[];
  createdAt: Date;
}

// Certificate types
export interface Certificate {
  id: string;
  studentId: string;
  title: string;
  description?: string | null;
  fileUrl: string;
  mimeType: string;
  fileSize: number;
  verified: boolean;
  verifiedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}