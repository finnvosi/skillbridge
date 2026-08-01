// Shared API client used by the SkillBridge web portal.
//
// IMPORTANT: The web Next.js app previously had its OWN auth endpoints
// (app/api/auth/*) backed by Supabase. That created two separate auth
// backends — the Express API (apps/api) for mobile and Supabase for web.
//
// This client consolidates everything onto the single Express API so both
// mobile + web share one auth + data layer.
//
// The API base URL must be set via NEXT_PUBLIC_API_URL in .env.local.
// In dev it defaults to http://localhost:3001/api/v1 (the Express server).

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export const API_ENDPOINTS = {
  auth: {
    register: '/auth/register',
    login: '/auth/login',
    logout: '/auth/logout',
    me: '/auth/me',
    refresh: '/auth/refresh',
  },
  users: {
    profile: '/users/profile',
    updateProfile: '/users/profile',
  },
  projects: {
    list: '/projects',
    detail: (id: string) => `/projects/${id}`,
    apply: (id: string) => `/projects/${id}/apply`,
    myApplications: '/projects/student/applications',
  },
  certificates: {
    upload: '/certificates',
    list: '/certificates',
    delete: (id: string) => `/certificates/${id}`,
  },
} as const;

export class ApiError extends Error {
  status: number;
  details?: unknown;
  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: unknown;
  token?: string | null;
  query?: Record<string, string | number | boolean | undefined>;
}

function buildUrl(path: string, query?: RequestOptions['query']): string {
  const url = new URL(`${API_URL}${path}`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== '') {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url.toString();
}

export async function apiRequest<T = any>(
  path: string,
  { method = 'GET', body, token, query }: RequestOptions = {}
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(buildUrl(path, query), {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    credentials: 'include', // for any cookie-based flows
  });

  let data: any = null;
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!res.ok) {
    const message =
      (data && (data.error || data.message)) || `Request failed (${res.status})`;
    throw new ApiError(message, res.status, data?.details);
  }

  return data as T;
}

// ---------------------------------------------------------------------------
// Auth helpers — cookie-based on web but hitting the same Express API.
// ---------------------------------------------------------------------------

export interface ApiUser {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'employer' | 'factory' | 'admin' | 'worker';
}

export interface AuthResponse {
  user: ApiUser;
  token: string;
  refreshToken: string;
}

/**
 * Persist the JWT pair in localStorage (web) so the web portal can make
 * authenticated requests to the Express API just like the mobile app does
 * with its bearer tokens.
 */
export function storeToken(token: string, refreshToken: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', refreshToken);
  }
}

export function getToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
}

export function clearToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  }
}
