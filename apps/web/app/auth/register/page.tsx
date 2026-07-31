import { RegisterForm } from '@/components/auth/register-form';

export const metadata = {
  title: 'Sign Up - SkillBridge',
  description: 'Create your SkillBridge account',
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">SkillBridge</h1>
          <p className="mt-2 text-sm text-gray-600">Verified Talent Ecosystem</p>
        </div>

        <div className="bg-white py-8 px-6 shadow rounded-lg sm:px-10">
          <h2 className="text-center text-xl font-semibold text-gray-900 mb-6">Create Account</h2>
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
