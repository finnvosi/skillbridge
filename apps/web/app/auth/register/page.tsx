import { RegisterForm } from '@/components/auth/register-form';
import { Navbar } from '@/components/layout/navbar';

export const metadata = {
  title: 'Sign Up - SkillBridge',
  description: 'Create your SkillBridge account',
};

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-purple-100 via-white to-white">
      <Navbar />
      <main className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="font-display text-3xl font-extrabold text-primary">
              Create your account
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Bridge your skills to real opportunities.
            </p>
          </div>
          <div className="card px-6 py-8 sm:px-10">
            <RegisterForm />
          </div>
        </div>
      </main>
    </div>
  );
}
