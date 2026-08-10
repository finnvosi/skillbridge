import { LoginForm } from '@/components/auth/login-form';
import { Navbar } from '@/components/layout/navbar';

export const metadata = {
  title: 'Sign In - SkillBridge',
  description: 'Sign in to your SkillBridge account',
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-purple-100 via-white to-white">
      <Navbar />
      <main className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="font-display text-3xl font-extrabold text-primary">
              Welcome back
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Sign in to continue building your bridge.
            </p>
          </div>
          <div className="card px-6 py-8 sm:px-10">
            <LoginForm />
          </div>
        </div>
      </main>
    </div>
  );
}
