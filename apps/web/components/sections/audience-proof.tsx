"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  BadgeCheck,
  BriefcaseBusiness,
  FileCheck2,
  Search,
  Users,
} from "lucide-react";
import { FadeUp, Stagger, StaggerItem } from "@/components/motion";

const studentProof = [
  {
    icon: Search,
    title: "Find your fit",
    body: "See roles matched to the skills you already use.",
  },
  {
    icon: FileCheck2,
    title: "Turn work into proof",
    body: "Capture coursework and projects in a portable record.",
  },
  {
    icon: BadgeCheck,
    title: "Keep your momentum",
    body: "Track every application from first click to next step.",
  },
];

const employerProof = [
  {
    icon: BriefcaseBusiness,
    title: "Open a real role",
    body: "Publish an opportunity in minutes, with the work clearly defined.",
  },
  {
    icon: BadgeCheck,
    title: "Read the proof first",
    body: "Review verified work before you spend time on interviews.",
  },
  {
    icon: Users,
    title: "Build your pipeline",
    body: "Keep promising local talent close to the work that needs them.",
  },
];

function ProofRows({
  items,
  dark = false,
}: {
  items: Array<{ icon: typeof Search; title: string; body: string }>;
  dark?: boolean;
}) {
  return (
    <Stagger as="ul" className="mt-10 space-y-0">
      {items.map((item, index) => {
        const Icon = item.icon;
        return (
          <StaggerItem as="li" key={item.title}>
            <div
              className={`flex gap-4 border-t py-4 ${dark ? "border-white/20" : "border-gray-200"}`}
            >
              <span
                className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${dark ? "bg-white/12 text-white" : "bg-primary/10 text-primary"}`}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <div>
                <p
                  className={`font-display text-sm font-bold ${dark ? "text-white" : "text-gray-900"}`}
                >
                  <span className="mr-2 font-mono text-[10px] font-medium tracking-[0.18em] opacity-50">
                    0{index + 1}
                  </span>
                  {item.title}
                </p>
                <p
                  className={`mt-1 max-w-[34ch] text-sm leading-relaxed ${dark ? "text-white/68" : "text-gray-600"}`}
                >
                  {item.body}
                </p>
              </div>
            </div>
          </StaggerItem>
        );
      })}
    </Stagger>
  );
}

export function AudienceProof() {
  return (
    <section className="border-b border-gray-200 bg-[#F8F7FC] px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <FadeUp>
          <div className="max-w-3xl">
            <p className="label-mono">Two sides of the bridge</p>
            <h2 className="display mt-4 text-4xl leading-[0.98] sm:text-6xl">
              The right work becomes easier to find.
            </h2>
            <p className="mt-6 max-w-[56ch] text-base leading-relaxed text-gray-600 sm:text-lg">
              Students turn effort into proof. Employers turn proof into better
              hiring decisions.
            </p>
          </div>
        </FadeUp>

        <div className="mt-14 grid gap-4 lg:grid-cols-12 lg:items-stretch">
          <FadeUp className="h-full lg:col-span-7" delay={0.08}>
            <article
              id="students"
              className="relative isolate flex h-full min-h-[620px] flex-col overflow-hidden rounded-[1.75rem] bg-primary p-7 text-primary-contrast shadow-soft-lg sm:p-10"
            >
              <div className="pointer-events-none absolute -right-24 top-20 -z-10 h-72 w-72 rounded-full bg-accent/20 blur-3xl" />
              <div className="relative z-10 max-w-[31rem] lg:pr-20">
                <p className="font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-white/62">
                  For students
                </p>
                <h3 className="mt-5 max-w-[10ch] font-display text-4xl font-extrabold leading-[0.94] tracking-[-0.05em] sm:text-6xl">
                  Make your work legible.
                </h3>
                <p className="mt-6 max-w-[38ch] text-base leading-relaxed text-white/75 sm:text-lg">
                  Build a record of what you can do, get it verified, and show
                  up where the right roles are looking.
                </p>
                <ProofRows items={studentProof} dark />
                <Link
                  href="/auth/register"
                  className="group mt-8 inline-flex min-h-11 items-center gap-3 rounded-full bg-white px-5 py-3 text-sm font-semibold text-primary transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
                >
                  Build your profile
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </Link>
              </div>
            </article>
          </FadeUp>

          <FadeUp className="h-full lg:col-span-5" delay={0.16}>
            <article
              id="employers"
              className="relative flex h-full min-h-[620px] flex-col overflow-hidden rounded-[1.75rem] border border-gray-200 bg-white p-7 shadow-soft sm:p-10"
            >
              <div>
                <p className="font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-primary">
                  For employers
                </p>
                <h3 className="mt-5 max-w-[9ch] font-display text-4xl font-extrabold leading-[0.94] tracking-[-0.05em] text-gray-900 sm:text-5xl">
                  Hire the signal.
                </h3>
                <p className="mt-6 max-w-[34ch] text-base leading-relaxed text-gray-600">
                  See the work behind the application, then build a pipeline
                  around people who can move the role forward.
                </p>
                <ProofRows items={employerProof} />
                <Link
                  href="/auth/register"
                  className="group mt-8 inline-flex min-h-11 items-center gap-3 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-contrast transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  Post an opportunity
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </Link>
              </div>
            </article>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}
