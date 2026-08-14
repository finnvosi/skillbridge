// Central API configuration for the SkillBridge mobile app.
// Dev: http://localhost:3000 or LAN IP of your Mac (ipconfig getifaddr en0)
// Staging: https://skillbridge-api-xi.vercel.app
const API_BASE_URL =
  (process.env.EXPO_PUBLIC_API_URL as string | undefined) ??
  'https://skillbridge-api-xi.vercel.app';

export const API_URL = `${API_BASE_URL}/api/v1`;

export const API_ENDPOINTS = {
  auth: {
    register: '/auth/register',
    login: '/auth/login',
    me: '/auth/me',
    refresh: '/auth/refresh',
    logout: '/auth/logout',
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
} as const;
