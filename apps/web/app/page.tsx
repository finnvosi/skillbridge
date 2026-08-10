import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navbar />

      <main className="flex-1">
        {/* 1. Hero */}
        <section className="relative overflow-hidden px-4 py-24 sm:px-6 lg:px-8">
          <div
            className="pointer-events-none absolute inset-0 -z-10 opacity-60"
            style={{
              background:
                "radial-gradient(60% 50% at 50% 0%, rgba(123,44,191,0.18), transparent 70%)",
            }}
          />
          <div className="mx-auto max-w-5xl text-center">
            <Badge variant="primary" className="mb-6">
              Cambodia&apos;s workforce bridge
            </Badge>
            <h1 className="font-display text-5xl font-extrabold tracking-tight text-gray-900 sm:text-6xl md:text-7xl">
              Bridge your skills to{" "}
              <span className="text-primary">real opportunities.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
              SkillBridge connects students with employers through meaningful
              projects, jobs, and career opportunities. Build experience, get
              verified, and launch your career.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button asChild variant="primary" size="lg">
                <Link href="/auth/register">Get started free</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/auth/login">I already have an account</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* 2. Value proposition */}
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <Card>
              <div className="text-3xl font-bold text-primary">01</div>
              <h3 className="mt-3 text-lg font-semibold">Discover</h3>
              <p className="mt-2 text-sm text-gray-600">
                Browse curated internships, projects, and entry-level roles
                matched to your skills.
              </p>
            </Card>
            <Card>
              <div className="text-3xl font-bold text-primary">02</div>
              <h3 className="mt-3 text-lg font-semibold">Build</h3>
              <p className="mt-2 text-sm text-gray-600">
                Apply, complete real work, and grow a verified profile
                employers trust.
              </p>
            </Card>
            <Card>
              <div className="text-3xl font-bold text-primary">03</div>
              <h3 className="mt-3 text-lg font-semibold">Connect</h3>
              <p className="mt-2 text-sm text-gray-600">
                Get hired by employers who value proof of work over paper
                credentials.
              </p>
            </Card>
          </div>
        </section>

        {/* 3. How SkillBridge works */}
        <section className="border-y border-gray-100 bg-gray-50 px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <h2 className="font-display text-3xl font-extrabold text-gray-900 text-center">
              How SkillBridge works
            </h2>
            <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-4">
              {[
                { n: "1", t: "Create your profile", d: "Students and employers sign up and build a verified presence." },
                { n: "2", t: "Post & discover", d: "Employers post opportunities; students browse and filter." },
                { n: "3", t: "Apply & work", d: "Students apply, employers review, and verified work happens." },
                { n: "4", t: "Grow your career", d: "Build a portable, trusted record of real experience." },
              ].map((step) => (
                <div key={step.n} className="text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-contrast">
                    {step.n}
                  </div>
                  <h3 className="mt-4 font-semibold text-gray-900">{step.t}</h3>
                  <p className="mt-2 text-sm text-gray-600">{step.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. Opportunity discovery preview */}
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl font-extrabold text-gray-900 text-center">
            Opportunities, made findable
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-gray-600">
            Search, filter, and sort by category, location, work type, and
            skills. Every card shows what matters at a glance.
          </p>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { title: "Frontend Internship", company: "Phnom Penh Labs", loc: "Phnom Penh", type: "Internship" },
              { title: "UX Research Assistant", company: "Mekong Studio", loc: "Remote", type: "Part-time" },
              { title: "Junior Data Analyst", company: "CamTech Solutions", loc: "Siem Reap", type: "Full-time" },
            ].map((opp) => (
              <Card key={opp.title} className="transition-shadow hover:shadow-md">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{opp.title}</h3>
                    <p className="text-sm text-gray-500">{opp.company}</p>
                  </div>
                  <Badge variant="primary">{opp.type}</Badge>
                </div>
                <p className="mt-3 text-sm text-gray-500">📍 {opp.loc}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* 5. Student / employer benefits */}
        <section className="bg-gray-50 px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 md:grid-cols-2">
            <Card className="border-primary/20">
              <h3 className="font-display text-2xl font-bold text-primary">
                For Students
              </h3>
              <ul className="mt-4 space-y-2 text-sm text-gray-600">
                <li>✓ Find projects and roles matched to your skills</li>
                <li>✓ Build a verified, portable career record</li>
                <li>✓ Track applications in one place</li>
                <li>✓ Get discovered by real employers</li>
              </ul>
            </Card>
            <Card className="border-primary/20">
              <h3 className="font-display text-2xl font-bold text-primary">
                For Employers
              </h3>
              <ul className="mt-4 space-y-2 text-sm text-gray-600">
                <li>✓ Post opportunities in minutes</li>
                <li>✓ Review applicants with verified experience</li>
                <li>✓ Manage hiring without the busywork</li>
                <li>✓ Hire talent proven by real work</li>
              </ul>
            </Card>
          </div>
        </section>

        {/* 6. Trust / verification concept */}
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-display text-3xl font-extrabold text-gray-900">
              Trust, by verification
            </h2>
            <p className="mt-4 text-gray-600">
              Every completed opportunity and review is verified and attributed.
              No fake resumes, no inflated claims — just proof of work that both
              sides can rely on.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Badge variant="outline">Verified profiles</Badge>
              <Badge variant="outline">Reviewed experience</Badge>
              <Badge variant="outline">Skill attestations</Badge>
              <Badge variant="outline">Secure by design</Badge>
            </div>
          </div>
        </section>

        {/* 7. CTA */}
        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl rounded-2xl bg-primary px-8 py-14 text-center">
            <h2 className="font-display text-3xl font-extrabold text-primary-contrast sm:text-4xl">
              Ready to bridge the gap?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-primary-contrast/80">
              Join students and employers building Cambodia&apos;s verified
              talent ecosystem.
            </p>
            <div className="mt-8 flex justify-center">
              <Button asChild variant="secondary" size="lg">
                <Link href="/auth/register">Get started free</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* 8. Footer */}
      <footer className="border-t border-gray-100 bg-white px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <Image
              src="/skillbridge-logo.svg"
              alt="SkillBridge"
              width={28}
              height={28}
              className="h-7 w-auto"
            />
            <span className="font-display text-lg font-extrabold text-primary">
              SkillBridge
            </span>
          </div>
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} SkillBridge. Cambodia&apos;s trusted
            workforce development platform.
          </p>
        </div>
      </footer>
    </div>
  );
}
