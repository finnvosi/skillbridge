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
} from "@/components/motion";
import {
  Magnetic,
  ScaleOnScroll,
  StickySwap,
} from "@/components/motion/primitives2";
import { Hero } from "@/components/sections/hero";
import { CaseStudies } from "@/components/sections/case-studies";
import { StickySteps } from "@/components/sections/sticky-steps";
import { GapScrollStory } from "@/components/sections/gap-scroll-story";
import { OpportunityCoverflow } from "@/components/sections/opportunity-coverflow";

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
    <div className="flex min-h-screen flex-col bg-transparent">
      <Navbar />

      <main className="flex-1">
        {/* ============ HERO — engaging: pointer spotlight, floating proof cards, scroll parallax ============ */}
        <Hero />

        {/* ============ STICKY SCROLLYTELLING — the shift ============ */}
        <StickySwap
          phrases={[
            "Résumés lie.",
            "Portfolios get lost.",
            "Proof travels.",
            "Hire on proof.",
          ]}
        />

        {/* ============ THE GAP — scroll-drawn signal path ============ */}
        <GapScrollStory />

        {/* ============ PROOF MARQUEE ============ */}
        <section className="overflow-hidden border-b border-gray-200 bg-gray-50 py-5">
          <ScrollVelocityMarquee items={proof} />
        </section>

        {/* ============ HOW IT WORKS (sticky stagger-stop scroll) ============ */}
        <StickySteps
          eyebrow="How it works"
          title="Four steps. One record."
          steps={[
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
          ]}
        />

        {/* ============ OPPORTUNITIES (scale-on-scroll header moment) ============ */}
        <section className="border-b border-gray-200 px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <FadeUp>
              <div className="flex flex-col gap-4 border-b border-gray-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="label-mono">Open now</p>
                  <ScaleOnScroll
                    className="mt-3 inline-block"
                    from={0.9}
                    to={1.04}
                  >
                    <h2 className="display text-4xl sm:text-5xl">
                      Real opportunities
                    </h2>
                  </ScaleOnScroll>
                </div>
                <Link
                  href="/auth/register"
                  className="font-mono text-xs font-medium uppercase tracking-[0.14em] text-primary hover:underline"
                >
                  Browse all →
                </Link>
              </div>
            </FadeUp>
            <OpportunityCoverflow opportunities={opportunities} />
          </div>
        </section>

        {/* ============ PINNED HORIZONTAL CASE STUDIES ============ */}
        <CaseStudies />

        {/* ============ STUDENTS / EMPLOYERS (asymmetric) ============ */}
        <section className="grid grid-cols-1 border-b border-gray-200 lg:grid-cols-2">
          <div
            id="students"
            className="border-b border-gray-200 px-4 py-16 sm:px-6 lg:border-b-0 lg:border-r lg:px-8"
          >
            <FadeUp>
              <p className="label-mono">For students</p>
              <h3 className="display mt-4 text-3xl sm:text-4xl">
                Your work is your résumé.
              </h3>
              <ul className="mt-8 space-y-4">
                {studentPoints.map((p) => {
                  const Icon = p.icon;
                  return (
                    <li
                      key={p.t}
                      className="flex items-start gap-3 border-t border-gray-100 pt-4"
                    >
                      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="text-sm text-gray-700">{p.t}</span>
                    </li>
                  );
                })}
              </ul>
              <Magnetic>
                <Button asChild variant="primary" className="mt-8 shadow-soft">
                  <Link href="/auth/register">Create student profile</Link>
                </Button>
              </Magnetic>
              <div className="relative mt-8 h-56 w-full overflow-hidden rounded-2xl border border-gray-200 shadow-soft">
                <Image
                  src="/scrub/object-student.png"
                  alt="A student turning work into proof"
                  fill
                  unoptimized
                  className="object-cover"
                  sizes="(max-width:1024px) 100vw, 40vw"
                />
              </div>
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
                    <li
                      key={p.t}
                      className="flex items-start gap-3 border-t border-gray-100 pt-4"
                    >
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
              <div className="relative mt-8 h-56 w-full overflow-hidden rounded-2xl border border-gray-200 shadow-soft">
                <Image
                  src="/scrub/object-employer.jpg"
                  alt="Employers reviewing verified candidates"
                  fill
                  unoptimized
                  className="object-cover"
                  sizes="(max-width:1024px) 100vw, 40vw"
                />
              </div>
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
        <section
          id="trust"
          className="relative overflow-hidden border-b border-gray-200 px-4 py-20 sm:px-6 lg:px-8"
        >
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
        <section className="relative overflow-hidden bg-primary px-4 py-24 sm:px-6 lg:px-8">
          <div className="glow-purple absolute inset-0 -z-10 opacity-40" />
          <div className="bg-grain absolute inset-0 -z-10 opacity-30" />
          <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
            <FadeUp>
              <h2 className="display max-w-xl text-5xl leading-[0.95] text-primary-contrast sm:text-6xl">
                Ready to bridge the gap?
              </h2>
            </FadeUp>
            <Magnetic>
              <Button
                asChild
                size="lg"
                className="bg-white text-primary shadow-soft-lg hover:bg-gray-100 focus-visible:ring-white focus-visible:ring-offset-2"
              >
                <Link href="/auth/register">Get started free</Link>
              </Button>
            </Magnetic>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
