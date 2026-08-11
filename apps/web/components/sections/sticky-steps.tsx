"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useReducedMotion,
  type MotionValue,
} from "framer-motion";
import { cn } from "@/lib/utils";

export type Step = { n: string; t: string; d: string };

/** One tick on the left progress rail. Hook calls live at top level. */
function RailTick({ progress, start, end, n }: { progress: MotionValue<number>; start: number; end: number; n: string }) {
  const active = useTransform(progress, [start, end], [0.25, 1]);
  const scaleX = useSpring(active, { stiffness: 120, damping: 30 });
  return (
    <div className="flex items-center gap-3">
      <motion.span className="block h-1.5 w-10 origin-left rounded-full bg-primary" style={{ scaleX }} />
      <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-gray-400">{n}</span>
    </div>
  );
}

/** One step card that locks in as its scroll slice enters. Hook calls at top level. */
function Step({ progress, index, count, step, reduce }: { progress: MotionValue<number>; index: number; count: number; step: Step; reduce: boolean }) {
  const start = reduce ? 0 : index / count + 0.04;
  const end = reduce ? 1 : (index + 1) / count - 0.04;
  const y = useTransform(progress, [start, end], [40, 0]);
  const opacity = useTransform(progress, [start, start + 0.12], [reduce ? 1 : 0.15, 1]);
  const numX = useTransform(progress, [start, start + 0.12], [reduce ? 0 : -24, 0]);
  const scale = useSpring(useTransform(progress, [start, end], [reduce ? 1 : 0.96, 1]), { stiffness: 140, damping: 26 });

  return (
    <motion.li
      style={reduce ? undefined : { y, opacity, scale }}
      className={cn(
        "flex items-start gap-5 rounded-2xl border border-gray-200 bg-white/70 p-6 shadow-soft backdrop-blur-sm",
        reduce && "opacity-100",
      )}
    >
      <motion.span
        style={reduce ? undefined : { x: numX }}
        className="font-display text-4xl font-extrabold leading-none bg-gradient-to-br from-primary to-primary-light bg-clip-text text-transparent sm:text-5xl"
      >
        {step.n}
      </motion.span>
      <div>
        <h3 className="font-display text-xl font-bold text-gray-900">{step.t}</h3>
        <p className="mt-2 text-sm leading-relaxed text-gray-600">{step.d}</p>
      </div>
    </motion.li>
  );
}

/**
 * StickySteps — "staggering stop scroll" effect for a step list.
 *
 * Outer section is tall (steps × ~100vh). Inner panel is `sticky top-0
 * h-screen`, pinning to the viewport while you scroll through the section.
 * One useScroll drives `scrollYProgress` (0→1 across the whole section);
 * each step owns a slice and animates in with a spring (number slides, copy
 * rises) as its slice enters — the stop-and-reveal stagger. A left progress
 * rail tracks position.
 *
 * Honors prefers-reduced-motion: renders all steps statically, no pin.
 */
export function StickySteps({
  eyebrow = "How it works",
  title = "Four steps. No theatre.",
  steps,
  className,
}: {
  eyebrow?: string;
  title?: string;
  steps: Step[];
  className?: string;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });
  const sectionH = `${steps.length * 100}vh`;

  return (
    <section
      ref={ref}
      id="how"
      className={cn("relative border-b border-gray-200", className)}
      style={{ height: reduce ? "auto" : sectionH }}
    >
      <div className="sticky top-0 flex h-screen items-center overflow-hidden bg-white">
        <div className="glow-purple pointer-events-none absolute -right-40 top-1/3 -z-10 h-96 w-96 opacity-50" />

        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-10 px-4 sm:px-6 lg:grid-cols-12 lg:gap-16 lg:px-8">
          {/* left: heading + progress rail */}
          <div className="lg:col-span-5">
            <p className="label-mono">{eyebrow}</p>
            <h2 className="mt-4 font-display text-[clamp(2.25rem,5vw,4rem)] font-extrabold leading-[0.98] tracking-[-0.03em] text-gray-900">
              {title}
            </h2>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-gray-600">
              Real work, verified once, portable for life. Scroll to walk the
              path students and employers actually take.
            </p>

            {/* progress rail */}
            <div className="mt-10 hidden flex-col gap-3 lg:flex">
              {steps.map((s, i) => (
                <RailTick key={s.n} progress={progress} start={i / steps.length} end={(i + 1) / steps.length} n={s.n} />
              ))}
            </div>
          </div>

          {/* right: stacked steps that lock in as you scroll */}
          <div className="lg:col-span-7">
            <ul className="flex flex-col gap-5">
              {steps.map((s, i) => (
                <Step key={s.n} progress={progress} index={i} count={steps.length} step={s} reduce={!!reduce} />
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
