// Central API configuration for the SkillBridge mobile app.
//
// The API runs at http://localhost:3001/api/v1 on the dev machine.
// On a PHYSICAL DEVICE over LAN, "localhost" means the phone itself, so you
// must point it at your Mac's LAN IP, e.g. set in app.config.js / .env:
//   EXPO_PUBLIC_API_URL=http://192.168.1.10:3001
// (Find your IP with `ipconfig getifaddr en0`.)
const API_BASE_URL =
  (process.env.EXPO_PUBLIC_API_URL as string | undefined) ?? 'http://localhost:3000';

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
} as const;
