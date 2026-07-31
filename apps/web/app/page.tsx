import Link from 'next/link';

export const metadata = {
  title: 'SkillBridge - Verified Talent Ecosystem',
  description: 'Connect students, workers, employers, and factories through verified work experience.',
};

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">SkillBridge</h1>
          <div className="space-x-4">
            <Link href="/auth/login" className="text-gray-600 hover:text-gray-900 font-medium">
              Sign In
            </Link>
            <Link
              href="/auth/register"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-900 mb-4">
            Verified Talent Ecosystem
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Connect students, workers, employers, and factories through verified work experience.
            Build trust, not just job listings.
          </p>
          <div className="space-x-4">
            <Link
              href="/auth/register"
              className="inline-block px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Start Now
            </Link>
            <Link
              href="/auth/login"
              className="inline-block px-8 py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 font-medium"
            >
              Sign In
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mt-20">
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <div className="text-4xl mb-4">👨‍🎓</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Students</h3>
            <p className="text-gray-600">
              Build your verified career profile through real projects and internships.
            </p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <div className="text-4xl mb-4">👷</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Workers</h3>
            <p className="text-gray-600">
              Access factory jobs and build your employment history.
            </p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <div className="text-4xl mb-4">🏢</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Employers</h3>
            <p className="text-gray-600">
              Hire verified talent with proven experience and skills.
            </p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <div className="text-4xl mb-4">🏭</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Factories</h3>
            <p className="text-gray-600">
              Recruit workers at scale with verified backgrounds.
            </p>
          </div>
        </div>

        <div className="mt-20 bg-white rounded-lg shadow-lg p-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Why SkillBridge?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">✓</div>
              <h4 className="font-semibold text-gray-900 mb-2">Verified Experience</h4>
              <p className="text-gray-600">
                Every completed project and work experience is permanently verified and cannot be deleted.
              </p>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">✓</div>
              <h4 className="font-semibold text-gray-900 mb-2">Career Passport</h4>
              <p className="text-gray-600">
                Build a trusted digital portfolio with verified reviews and skills.
              </p>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">✓</div>
              <h4 className="font-semibold text-gray-900 mb-2">Real Connections</h4>
              <p className="text-gray-600">
                Connect with employers and factories through actual work, not just applications.
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-gray-900 text-white py-8 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">© 2024 SkillBridge. All rights reserved.</p>
          <p className="text-gray-400 mt-2">Cambodia's Trusted Workforce Development Platform</p>
        </div>
      </footer>
    </div>
  );
}
