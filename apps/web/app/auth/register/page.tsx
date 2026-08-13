import { RegisterForm } from '@/components/auth/register-form';
import { AuthShell } from '@/components/layout/auth-shell';

export const metadata = {
  title: 'Sign Up - SkillBridge',
  description: 'Create your SkillBridge account',
};

export default function RegisterPage() {
  return (
    <AuthShell
      mode="register"
      title="Create your account"
      subtitle="Bridge your skills to real opportunities."
    >
      <RegisterForm />
    </AuthShell>
  );
}
