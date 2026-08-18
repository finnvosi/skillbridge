import test from 'node:test';
import assert from 'node:assert/strict';
import { getPostAuthDestination } from '../apps/web/lib/auth-routing.ts';

test('incomplete student accounts resume onboarding', () => {
  assert.equal(
    getPostAuthDestination({ role: 'student', onboardingCompleted: false }),
    '/onboarding'
  );
});

test('incomplete employer accounts resume onboarding', () => {
  assert.equal(
    getPostAuthDestination({ role: 'employer', onboardingCompleted: false }),
    '/onboarding'
  );
});

test('completed accounts reach their role dashboard', () => {
  assert.equal(
    getPostAuthDestination({ role: 'student', onboardingCompleted: true }),
    '/dashboard/student'
  );
  assert.equal(
    getPostAuthDestination({ role: 'employer', onboardingCompleted: true }),
    '/dashboard/employer'
  );
});

test('admins never enter public onboarding', () => {
  assert.equal(
    getPostAuthDestination({ role: 'admin', onboardingCompleted: false }),
    '/dashboard/admin'
  );
});
