// Central API configuration for the SkillBridge mobile app.
// Dev: http://localhost:3000 or LAN IP of your Mac (ipconfig getifaddr en0)
// Staging: https://skillbridge-api-xi.vercel.app
const API_BASE_URL =
  (process.env.EXPO_PUBLIC_API_URL as string | undefined) ??
  'http://localhost:3001';

export const API_URL = `${API_BASE_URL}/api/v1`;

// Worker vertical slice: when true, the app fetches real data from the local
// API (apps/api on :3001). When false (or the API is unreachable), screens
// fall back to local fixtures so the prototype stays demoable.
export const USE_REMOTE_API =
  (process.env.EXPO_PUBLIC_USE_REMOTE_API as string | undefined) !== 'false';

export const API_ENDPOINTS = {
  auth: {
    register: '/auth/register',
    login: '/auth/login',
    me: '/auth/me',
    refresh: '/auth/refresh',
    logout: '/auth/logout',
    // Phone OTP — the default worker sign-in path (blueprint §12).
    otp: {
      request: '/auth/otp/request',
      verify: '/auth/otp/verify',
    },
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
  employer: {
    projects: '/projects/employer/projects',
    applications: '/projects/employer/applications',
    analytics: '/analytics/employer/analytics',
    team: '/projects/employer/team',
    talent: '/students',
  },
  certificates: {
    upload: '/certificates',
    list: '/certificates',
    delete: (id: string) => `/certificates/${id}`,
  },
  worker: {
    jobs: '/worker/jobs',
    job: (id: string) => `/worker/jobs/${id}`,
    // Protected endpoints are identity-derived from the JWT (SEC-1 fix), so no
    // client-supplied workerId is sent. These resolve the caller's own profile.
    apply: '/worker/applications',
    applications: '/worker/me/applications',
    passport: '/worker/me/passport',
  },
} as const;

