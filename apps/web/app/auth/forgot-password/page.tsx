import { AuthShell } from '@/components/layout/auth-shell';
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form';

export const metadata = {
  title: 'Reset Password - SkillBridge',
  description: 'Request a password reset link',
};

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      mode="login"
      title="Reset your password"
      subtitle="Enter your email and we'll send a reset link."
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
