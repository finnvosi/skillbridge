import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  CheckCircle2,
  Quote,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
} from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  FadeUp,
  Stagger,
  StaggerItem,
  WordReveal,
  CountUp,
  Parallax,
  ScrollVelocityMarquee,
  Tilt,
} from "@/components/motion";
import { CaseStudies } from "@/components/sections/case-studies";
import { ScrubShowcase } from "@/components/sections/scrub-showcase";

const stats = [
  { value: 2400, suffix: "+", label: "Verified students" },
  { value: 310, suffix: "", label: "Partner employers" },
  { value: 1900, suffix: "", label: "Completed projects" },
  { value: 94, suffix: "%", label: "Hire-through rate" },
];

const proof = [
  "Phnom Penh Labs",
  "Mekong Studio",
  "CamTech Solutions",
  "Angkor Dev",
  "Tonle Sap Foods",
  "Battambang Ventures",
  "Cardamom Group",
  "Siem Reap Digital",
];

const steps = [
  {
    n: "01",
    t: "Build a verified profile",
    d: "Students prove skills with real coursework and projects. Employers verify — so the record means something.",
  },
  {
    n: "02",
    t: "Post & discover",
    d: "Employers publish real roles. Students find work matched to what they can actually do, not a wish list.",
  },
  {
    n: "03",
    t: "Apply, work, get reviewed",
    d: "Students ship real work. Employers attest it. Every completed project becomes permanent, portable proof.",
  },
  {
    n: "04",
    t: "Get hired on proof",
    d: "No inflated resumes. Hiring decisions ride on verified experience both sides can trust.",
  },
];

const opportunities = [
  {
    title: "Frontend Internship",
    company: "Phnom Penh Labs",
    loc: "Phnom Penh",
    type: "Internship",
    skill: "React",
  },
  {
    title: "UX Research Assistant",
    company: "Mekong Studio",
    loc: "Remote",
    type: "Part-time",
    skill: "Research",
  },
  {
    title: "Junior Data Analyst",
    company: "CamTech Solutions",
    loc: "Siem Reap",
    type: "Full-time",
    skill: "SQL",
  },
];

const studentPoints = [
  { icon: Target, t: "Find roles matched to what you can actually do" },
  { icon: Sparkles, t: "Turn coursework into a verified, portable record" },
  { icon: CheckCircle2, t: "Track every application in one place" },
  { icon: Users, t: "Get discovered by employers who hire on proof" },
];

const employerPoints = [
  { icon: ShieldCheck, t: "Publish real opportunities in minutes" },
  { icon: CheckCircle2, t: "Review applicants backed by verified work" },
  { icon: Target, t: "Hire without the resume theatre" },
  { icon: Users, t: "Build a pipeline of proven local talent" },
];

const testimonials = [
  {
    quote:
      "We stopped trusting résumés. SkillBridge shows us the actual work — and our shortlist time dropped to days.",
    name: "Meas Sophea",
    role: "Talent lead, Mekong Studio",
  },
  {
    quote:
      "My class projects became my ticket. I got a paid internship without ever writing a cover letter.",
    name: "Chan Dara",
    role: "Data student, Siem Reap",
  },
  {
    quote:
      "Finally a platform built for Cambodia's students, not a copy of a Western job board.",
    name: "Ken Rithy",
    role: "Founder, CamTech Solutions",
  },
];

const faqs = [
  {
    q: "Is SkillBridge only for tech roles?",
    a: "No. Any student with real, demonstrable work — design, data, writing, ops, engineering — can build a verified record and get discovered.",
  },
  {
    q: "How is a profile 'verified'?",
    a: "Each project is attested by the employer or lecturer who saw the work. No self-claiming. That's what makes the record trustworthy.",
  },
  {
    q: "Does it cost students anything?",
    a: "Creating a student profile and applying is free. Employers pay to post and manage verified opportunities.",
  },
  {
    q: "Where does my record live?",
    a: "With you. It's portable — when you move cities or roles, your proof moves with you, not locked in one inbox.",
  },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navbar />

      <main className="flex-1">
        {/* ============ HERO ============ */}
        <section className="relative overflow-hidden">
          <div className="glow-purple absolute inset-0 -z-10" />
          <div className="bg-grain absolute inset-0 -z-10" />
          <div className="bg-gradient-to-b from-transparent to-white/40 absolute inset-0 -z-10" />

          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8">
              <div className="lg:col-span-8">
                <FadeUp>
                  <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
                    </span>
                    <span className="label-mono">
                      Cambodia&apos;s verified talent network
                    </span>
                  </div>
                </FadeUp>

                <h1 className="display mt-6 text-5xl leading-[0.95] sm:text-6xl lg:text-7xl xl:text-8xl">
                  <WordReveal text="Stop sending" delay={0.1} />
                  <br />
                  <WordReveal text="resumes." delay={0.25} />
                  <br />
                  <span className="bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
                    <WordReveal text="Start showing" delay={0.4} />
                  </span>
                  <br />
                  <WordReveal text="proof." delay={0.55} />
                </h1>

                <FadeUp delay={0.7}>
                  <p className="mt-8 max-w-xl text-lg leading-relaxed text-gray-600">
                    SkillBridge is where Cambodian students turn real projects
                    into verified work history — and where employers hire on
                    what&apos;s been done, not what&apos;s been claimed.
                  </p>
                </FadeUp>

                <FadeUp delay={0.85}>
                  <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                    <Button asChild variant="primary" size="lg" className="shadow-soft">
                      <Link href="/auth/register">Get started free</Link>
                    </Button>
                    <Button asChild variant="outline" size="lg">
                      <Link href="/#how">See how it works</Link>
                    </Button>
                  </div>
                </FadeUp>
              </div>

              {/* Right: live-network stat card, parallax + soft glass elevation */}
              <div className="lg:col-span-4">
                <Parallax speed={0.5}>
                  <Card className="overflow-hidden rounded-2xl border-gray-200 shadow-soft-lg">
                    <div className="border-b border-gray-100 bg-gradient-to-r from-primary to-primary-light px-5 py-3">
                      <p className="font-mono text-xs font-medium uppercase tracking-[0.14em] text-primary-contrast">
                        Live network
                      </p>
                    </div>
                    <div className="divide-y divide-gray-100">
                      {stats.map((s) => (
                        <div
                          key={s.label}
                          className="flex items-baseline justify-between px-5 py-4"
                        >
                          <span className="display text-3xl">
                            <CountUp value={s.value} suffix={s.suffix} />
                          </span>
                          <span className="text-right text-xs uppercase tracking-wide text-gray-500">
                            {s.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </Card>
                </Parallax>
              </div>
            </div>
          </div>
        </section>

        {/* ============ INTRO / MANIFESTO BAND ============ */}
        <section className="border-y border-gray-200 bg-gray-50 px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 lg:grid-cols-3 lg:gap-12">
            <FadeUp className="lg:col-span-1">
              <p className="label-mono">The problem</p>
              <h2 className="display mt-3 text-3xl leading-tight sm:text-4xl">
                A degree says you showed up. It doesn&apos;t say you can build.
              </h2>
            </FadeUp>
            <FadeUp delay={0.1} className="lg:col-span-2">
              <p className="text-lg leading-relaxed text-gray-600">
                Cambodia has thousands of sharp students and hundreds of
                companies that need them. The gap isn&apos;t talent or intent —
                it&apos;s proof. Résumés lie, portfolios get lost, and
                &quot;experience&quot; becomes a checkbox nobody can verify.
                SkillBridge closes that gap by making real work the unit of
                trust: captured once, attested by the people who saw it, and
                portable for life.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                <Badge variant="outline">For students</Badge>
                <Badge variant="outline">For employers</Badge>
                <Badge variant="outline">Built in Cambodia</Badge>
              </div>
            </FadeUp>
          </div>
        </section>

        {/* ============ PROOF MARQUEE ============ */}
        <section className="overflow-hidden border-b border-gray-200 bg-white py-5">
          <ScrollVelocityMarquee items={proof} />
        </section>

        {/* ============ HOW IT WORKS ============ */}
        <section id="how" className="border-b border-gray-200 px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <FadeUp>
              <div className="flex items-end justify-between gap-6 border-b border-gray-200 pb-6">
                <h2 className="display text-4xl sm:text-5xl">
                  How it works
                </h2>
                <p className="label-mono-muted hidden sm:block">
                  Four steps · No theatre
                </p>
              </div>
            </FadeUp>

            <Stagger className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
              {steps.map((step) => (
                <StaggerItem key={step.n} as="div">
                  <Card className="h-full rounded-2xl border-gray-200 shadow-soft transition-shadow duration-300 hover:shadow-soft-lg">
                    <div className="flex h-full flex-col p-6">
                      <span className="display text-5xl bg-gradient-to-br from-primary to-primary-light bg-clip-text text-transparent">
                        {step.n}
                      </span>
                      <h3 className="mt-6 font-display text-xl font-bold text-gray-900">
                        {step.t}
                      </h3>
                      <p className="mt-3 text-sm leading-relaxed text-gray-600">
                        {step.d}
                      </p>
                    </div>
                  </Card>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>

        {/* ============ OPPORTUNITIES ============ */}
        <section className="border-b border-gray-200 px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <FadeUp>
              <div className="flex flex-col gap-4 border-b border-gray-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="label-mono">Open now</p>
                  <h2 className="display mt-3 text-4xl sm:text-5xl">
                    Real opportunities
                  </h2>
                </div>
                <Link
                  href="/auth/register"
                  className="font-mono text-xs font-medium uppercase tracking-[0.14em] text-primary hover:underline"
                >
                  Browse all →
                </Link>
              </div>
            </FadeUp>

            <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {opportunities.map((opp, i) => (
                <FadeUp key={opp.title} delay={i * 0.1} as="div">
                  <Tilt intensity={6}>
                    <Card className="group h-full rounded-2xl border-gray-200 shadow-soft transition-shadow duration-300 hover:shadow-soft-lg">
                      <div className="flex h-full flex-col p-6">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-display text-lg font-bold text-gray-900">
                              {opp.title}
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                              {opp.company}
                            </p>
                          </div>
                          <Badge variant="primary">{opp.type}</Badge>
                        </div>
                        <div className="mt-6 flex items-center gap-2 text-xs uppercase tracking-wide text-gray-500">
                          <span>📍 {opp.loc}</span>
                          <span className="text-gray-300">·</span>
                          <span className="text-primary">{opp.skill}</span>
                        </div>
                      </div>
                    </Card>
                  </Tilt>
                </FadeUp>
              ))}
            </div>
          </div>
        </section>

        {/* ============ 3D SCROLL-SCRUB SHOWCASE (alethia-inspired) ============ */}
        <ScrubShowcase />

        {/* ============ PINNED HORIZONTAL CASE STUDIES ============ */}
        <CaseStudies />

        {/* ============ STUDENTS / EMPLOYERS ============ */}
        <section className="grid grid-cols-1 border-b border-gray-200 lg:grid-cols-2">
          <div id="students" className="border-b border-gray-200 px-4 py-16 sm:px-6 lg:border-b-0 lg:border-r lg:px-8">
            <FadeUp>
              <p className="label-mono">For students</p>
              <h3 className="display mt-4 text-3xl sm:text-4xl">
                Your work is your résumé.
              </h3>
              <ul className="mt-8 space-y-4">
                {studentPoints.map((p) => {
                  const Icon = p.icon;
                  return (
                    <li key={p.t} className="flex items-start gap-3 border-t border-gray-100 pt-4">
                      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="text-sm text-gray-700">{p.t}</span>
                    </li>
                  );
                })}
              </ul>
              <Button asChild variant="primary" className="mt-8 shadow-soft">
                <Link href="/auth/register">Create student profile</Link>
              </Button>
            </FadeUp>
          </div>

          <div id="employers" className="px-4 py-16 sm:px-6 lg:px-8">
            <FadeUp>
              <p className="label-mono">For employers</p>
              <h3 className="display mt-4 text-3xl sm:text-4xl">
                Hire on proof,
                <br />
                not promises.
              </h3>
              <ul className="mt-8 space-y-4">
                {employerPoints.map((p) => {
                  const Icon = p.icon;
                  return (
                    <li key={p.t} className="flex items-start gap-3 border-t border-gray-100 pt-4">
                      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="text-sm text-gray-700">{p.t}</span>
                    </li>
                  );
                })}
              </ul>
              <Button asChild variant="outline" className="mt-8">
                <Link href="/auth/register">Post a role</Link>
              </Button>
            </FadeUp>
          </div>
        </section>

        {/* ============ TESTIMONIALS ============ */}
        <section className="border-b border-gray-200 px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <FadeUp>
              <div className="border-b border-gray-200 pb-6">
                <p className="label-mono">Voices</p>
                <h2 className="display mt-3 text-4xl sm:text-5xl">
                  From the network
                </h2>
              </div>
            </FadeUp>
            <Stagger className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
              {testimonials.map((t) => (
                <StaggerItem key={t.name} as="div">
                  <Card className="flex h-full flex-col rounded-2xl border-gray-200 p-7 shadow-soft">
                    <Quote className="h-7 w-7 text-primary/40" />
                    <p className="mt-4 flex-1 text-sm leading-relaxed text-gray-700">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    <div className="mt-6 border-t border-gray-100 pt-4">
                      <p className="font-display text-sm font-bold text-gray-900">
                        {t.name}
                      </p>
                      <p className="text-xs text-gray-500">{t.role}</p>
                    </div>
                  </Card>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>

        {/* ============ TRUST / MANIFESTO ============ */}
        <section id="trust" className="relative overflow-hidden border-b border-gray-200 px-4 py-20 sm:px-6 lg:px-8">
          <div className="glow-purple absolute inset-0 -z-10 opacity-60" />
          <div className="mx-auto max-w-4xl text-center">
            <FadeUp>
              <p className="label-mono">The bet</p>
              <h2 className="display mt-4 text-4xl leading-tight sm:text-5xl">
                A degree tells us you showed up.
                <br />
                <span className="accent-red">Proof</span> tells us you can do
                the work.
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-gray-600">
                Every completed project and review on SkillBridge is verified
                and attributed. No fake resumes, no inflated claims — just a
                portable record of real experience that both sides can rely on.
              </p>
              <div className="mt-10 flex flex-wrap justify-center gap-3">
                <Badge variant="outline">Verified profiles</Badge>
                <Badge variant="outline">Reviewed experience</Badge>
                <Badge variant="outline">Skill attestations</Badge>
                <Badge variant="outline">Secure by design</Badge>
              </div>
            </FadeUp>
          </div>
        </section>

        {/* ============ FAQ ============ */}
        <section className="border-b border-gray-200 px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <FadeUp>
              <div className="border-b border-gray-200 pb-6 text-center">
                <p className="label-mono">Questions</p>
                <h2 className="display mt-3 text-4xl sm:text-5xl">
                  Frequently asked
                </h2>
              </div>
            </FadeUp>
            <div className="mt-10 divide-y divide-gray-100">
              {faqs.map((f, i) => (
                <FadeUp key={f.q} delay={i * 0.05}>
                  <details className="group py-5">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                      <span className="font-display text-lg font-bold text-gray-900">
                        {f.q}
                      </span>
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-gray-200 text-primary transition-transform group-open:rotate-45">
                        <ArrowRight className="h-4 w-4" />
                      </span>
                    </summary>
                    <p className="mt-3 text-sm leading-relaxed text-gray-600">
                      {f.a}
                    </p>
                  </details>
                </FadeUp>
              ))}
            </div>
          </div>
        </section>

        {/* ============ FINAL CTA ============ */}
        <section className="relative overflow-hidden bg-primary px-4 py-20 sm:px-6 lg:px-8">
          <div className="glow-purple absolute inset-0 -z-10 opacity-40" />
          <div className="bg-grain absolute inset-0 -z-10 opacity-30" />
          <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
            <FadeUp>
              <h2 className="display text-4xl leading-tight text-primary-contrast sm:text-5xl">
                Ready to bridge the gap?
              </h2>
              <p className="mt-4 max-w-xl text-primary-contrast/80">
                Join the students and employers building Cambodia&apos;s
                verified talent network.
              </p>
            </FadeUp>
            <FadeUp delay={0.15}>
              <Button asChild size="lg" className="bg-white text-primary shadow-soft hover:bg-gray-100 focus-visible:ring-white">
                <Link href="/auth/register">Get started free</Link>
              </Button>
            </FadeUp>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
