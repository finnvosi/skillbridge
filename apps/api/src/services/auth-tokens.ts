// Shared auth token helpers (email and phone-first flows both mint JWTs).
import * as jwt from 'jsonwebtoken';
import { jwtConfig } from '@skillbridge/config';

export function signTokens(user: { id: string; email: string | null; role: string }) {
  // Phone-first users have no email; the JWT payload carries an empty string
  // so the payload shape stays stable (identity comes from `id`, never email).
  const email = user.email ?? '';
  const token = jwt.sign(
    { id: user.id, email, role: user.role },
    jwtConfig.secret,
    { expiresIn: '7d' }
  );
  const refreshToken = jwt.sign(
    { id: user.id, email, role: user.role },
    jwtConfig.refreshSecret,
    { expiresIn: '30d' }
  );
  return { token, refreshToken };
}

export function publicUser(user: {
  id: string;
  email: string | null;
  phone: string | null;
  name: string;
  role: string;
  onboardingStep: number;
  onboardingCompletedAt: Date | null;
}) {
  return {
    id: user.id,
    email: user.email,
    phone: user.phone,
    name: user.name,
    role: user.role,
    onboardingStep: user.onboardingStep,
    onboardingCompleted: Boolean(user.onboardingCompletedAt),
  };
}
