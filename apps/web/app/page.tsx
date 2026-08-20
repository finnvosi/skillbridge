import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";

import { FadeUp, ScrollVelocityMarquee } from "@/components/motion";
import {
  Magnetic,
  ScaleOnScroll,
  StickySwap,
} from "@/components/motion/primitives2";
import { Hero } from "@/components/sections/hero";
import { Uvp } from "@/components/sections/uvp";
import { CaseStudies } from "@/components/sections/case-studies";
import { StickySteps } from "@/components/sections/sticky-steps";
import { GapScrollStory } from "@/components/sections/gap-scroll-story";
import { OpportunityCoverflow } from "@/components/sections/opportunity-coverflow";
import { AudienceProof } from "@/components/sections/audience-proof";
import { ProofManifesto } from "@/components/sections/proof-manifesto";
import { FaqManifesto } from "@/components/sections/faq-manifesto";
import { NetworkTestimonials } from "@/components/sections/network-testimonials";
import { ScrollToTopOnLoad } from "@/components/sections/scroll-to-top-on-load";

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

export default function Home() {
  return (
    <div id="top" className="flex min-h-screen flex-col bg-transparent">
      <ScrollToTopOnLoad />
      <Navbar />

      <main className="flex-1">
        {/* ============ HERO — engaging: pointer spotlight, floating proof cards, scroll parallax ============ */}
        <Hero />

        {/* ============ UVP — crisp value proposition ============ */}
        <Uvp />

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
                  <p className="label-mono flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#38BDF8] opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-[#38BDF8]" />
                    </span>
                    Open now
                    <span className="text-primary">
                      · {opportunities.length} open roles
                    </span>
                  </p>
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
                  href="/dashboard/student/discover"
                  className="inline-flex min-h-11 items-center font-mono text-xs font-medium uppercase tracking-[0.14em] text-primary hover:underline"
                >
                  See all roles →
                </Link>
              </div>
            </FadeUp>
            <OpportunityCoverflow opportunities={opportunities} />
          </div>
        </section>

        {/* ============ PINNED HORIZONTAL CASE STUDIES ============ */}
        <CaseStudies />

        {/* ============ AUDIENCE PROOF ============ */}
        <AudienceProof />

        <NetworkTestimonials testimonials={testimonials} />

        {/* ============ TRUST / INTERACTIVE PROOF FIELD ============ */}
        <ProofManifesto />

        {/* ============ FAQ ============ */}
        <FaqManifesto />

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
