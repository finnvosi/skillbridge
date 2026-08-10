import { LoginForm } from '@/components/auth/login-form';
import { AuthShell } from '@/components/layout/auth-shell';

export const metadata = {
  title: 'Sign In - SkillBridge',
  description: 'Sign in to your SkillBridge account',
};

export default function LoginPage() {
  return (
    <AuthShell
      mode="login"
      title="Welcome back"
      subtitle="Sign in to keep building your bridge."
    >
      <LoginForm />
    </AuthShell>
  );
}
