"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight, Building2, GraduationCap, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type Case = {
  index: string;
  title: string;
  who: string;
  metric: string;
  metricLabel: string;
  body: string;
  icon: typeof GraduationCap;
  tint: string;
};

const cases: Case[] = [
  {
    index: "01",
    title: "From coursework to a paid internship",
    who: "Sophea · IT student, Phnom Penh",
    metric: "6 wks",
    metricLabel: "to first paid role",
    body: "Sophea uploaded three class projects. SkillBridge verified them with her lecturers. A local studio found her through the match feed and hired her in six weeks — no CV theatrics.",
    icon: GraduationCap,
    tint: "from-primary/10 to-primary-light/5",
  },
  {
    index: "02",
    title: "A hiring pipeline that actually converts",
    who: "Mekong Studio · Employer",
    metric: "3×",
    metricLabel: "faster shortlist",
    body: "Instead of screening 200 résumés, Mekong filtered by verified skills and reviewed work. Time-to-shortlist dropped from three weeks to under one.",
    icon: Building2,
    tint: "from-primary-light/10 to-accent/5",
  },
  {
    index: "03",
    title: "Proof that travels with you",
    who: "Dara · Data analyst, Siem Reap",
    metric: "12",
    metricLabel: "verified projects",
    body: "Every project Dara shipped is attested by the employer. When he moved cities, his record moved with him — portable, trustworthy, his.",
    icon: Sparkles,
    tint: "from-accent/10 to-primary/5",
  },
  {
    index: "04",
    title: "Closing the talent gap, at scale",
    who: "CamTech Solutions · Employer",
    metric: "94%",
    metricLabel: "hire-through rate",
    body: "CamTech built a standing pipeline of proven local talent. Nine in ten openings now close with a candidate whose work they'd already seen.",
    icon: Building2,
    tint: "from-primary/10 to-primary-light/5",
  },
];

export function CaseStudies() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  // Map vertical scroll progress -> horizontal translate of the track.
  const x = useTransform(scrollYProgress, [0, 1], ["2%", "-78%"]);

  return (
    <section
      ref={ref}
      className="relative h-[320vh] border-b border-gray-200 bg-white"
      aria-label="Case studies"
    >
      {/* Sticky viewport */}
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between gap-6 border-b border-gray-200 pb-6">
            <div>
              <p className="label-mono">Proof in the wild</p>
              <h2 className="display mt-3 text-4xl sm:text-5xl">
                Case studies
              </h2>
            </div>
            <p className="label-mono-muted hidden sm:block">
              Scroll → drag the story sideways
            </p>
          </div>
        </div>

        {/* Horizontal track */}
        <motion.div style={{ x }} className="mt-10 flex gap-6 px-4 sm:px-6 lg:px-8">
          {cases.map((c) => {
            const Icon = c.icon;
            return (
              <article
                key={c.index}
                className={cn(
                  "flex h-[60vh] w-[85vw] shrink-0 flex-col justify-between rounded-3xl border border-gray-200 bg-gradient-to-br p-8 shadow-soft sm:w-[60vw] lg:w-[42vw]",
                  c.tint
                )}
              >
                <div className="flex items-start justify-between">
                  <span className="display text-6xl text-primary/30">{c.index}</span>
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/70 text-primary shadow-soft">
                    <Icon className="h-6 w-6" />
                  </span>
                </div>

                <div>
                  <p className="label-mono-muted">{c.who}</p>
                  <h3 className="mt-3 font-display text-2xl font-bold leading-tight text-gray-900 sm:text-3xl">
                    {c.title}
                  </h3>
                  <p className="mt-4 max-w-md text-sm leading-relaxed text-gray-600">
                    {c.body}
                  </p>
                </div>

                <div className="flex items-end justify-between border-t border-gray-200 pt-5">
                  <div>
                    <div className="display text-4xl text-primary">{c.metric}</div>
                    <div className="text-xs uppercase tracking-wide text-gray-500">
                      {c.metricLabel}
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 font-mono text-xs uppercase tracking-[0.14em] text-primary">
                    Read <ArrowUpRight className="h-4 w-4" />
                  </span>
                </div>
              </article>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
