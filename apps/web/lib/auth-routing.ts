export type PublicAuthRole = 'student' | 'employer' | 'admin';

export interface AuthRoutingUser {
  role: PublicAuthRole | string;
  onboardingCompleted: boolean;
}

const ROLE_DASHBOARDS: Record<PublicAuthRole, string> = {
  student: '/dashboard/student',
  employer: '/dashboard/employer',
  admin: '/dashboard/admin'
};

export function getPostAuthDestination(user: AuthRoutingUser): string {
  if (
    (user.role === 'student' || user.role === 'employer') &&
    !user.onboardingCompleted
  ) {
    return '/onboarding';
  }

  return ROLE_DASHBOARDS[user.role as PublicAuthRole] ?? '/dashboard';
}
