import { AuthShell } from '@/components/layout/auth-shell';
import { ResetPasswordForm } from '@/components/auth/reset-password-form';

export const metadata = {
  title: 'Set New Password - SkillBridge',
  description: 'Choose a new password',
};

export default function ResetPasswordPage() {
  return (
    <AuthShell
      mode="login"
      title="Set a new password"
      subtitle="Pick something memorable. You're almost back in."
    >
      <ResetPasswordForm />
    </AuthShell>
  );
}
