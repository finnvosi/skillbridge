export type UserRole = 'student' | 'worker' | 'employer' | 'factory_admin' | 'admin';

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  is_verified: boolean;
  is_email_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface StudentProfile {
  id: string;
  user_id: string;
  university: string | null;
  major: string | null;
  bio: string | null;
  phone: string | null;
  profile_picture_url: string | null;
  languages: string[] | null;
  skills: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface WorkerProfile {
  id: string;
  user_id: string;
  national_id: string | null;
  phone: string;
  experience_level: 'entry' | 'intermediate' | 'advanced' | null;
  preferred_province: string | null;
  expected_salary: number | null;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface Company {
  id: string;
  name: string;
  logo_url: string | null;
  description: string | null;
  owner_id: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface Factory {
  id: string;
  name: string;
  description: string | null;
  province: string;
  owner_id: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  error?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
  role: UserRole;
}

export interface VerifyEmailRequest {
  email: string;
  token: string;
}

export interface ResetPasswordRequest {
  email: string;
}
