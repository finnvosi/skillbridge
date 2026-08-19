"use client";

import { useRef } from "react";
import Link from "next/link";
import { ArrowUpRight, CheckCircle2 } from "lucide-react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { CountUp, FadeUp, WordReveal } from "@/components/motion";
import { Magnetic } from "@/components/motion/primitives2";
import { Button } from "@/components/ui/button";
import { ProofWebGL } from "./proof-webgl";

const stats = [
  { value: 2400, suffix: "+", label: "Verified students" },
  { value: 310, suffix: "", label: "Partner employers" },
  { value: 1900, suffix: "", label: "Completed projects" },
  { value: 94, suffix: "%", label: "Hire-through rate" },
];

/**
 * Landing hero: a cursor-reactive WebGL proof field replaces decorative cards.
 * The field is progressively enhanced, has a static fallback, and is motion-gated.
 */
export function Hero() {
  const reduce = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const copyY = useSpring(
    useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -82]),
    { stiffness: 90, damping: 26 },
  );
  const copyOpacity = useTransform(
    scrollYProgress,
    [0, 0.8],
    [1, reduce ? 1 : 0.42],
  );
  const fieldY = useSpring(
    useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -124]),
    { stiffness: 80, damping: 25 },
  );

  return (
    <section
      ref={sectionRef}
      className="relative isolate min-h-[780px] overflow-hidden border-b border-[#E6E2F2] bg-[#FCFCFF]"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-20 bg-[radial-gradient(90%_74%_at_72%_38%,rgba(224,242,254,0.88),transparent_58%),radial-gradient(58%_62%_at_52%_44%,rgba(233,216,253,0.64),transparent_66%),linear-gradient(180deg,#ffffff_0%,#FAF9FF_100%)]"
      />
      <div
        aria-hidden="true"
        className="bg-grain absolute inset-0 -z-10 opacity-70"
      />
      <ProofWebGL containerRef={sectionRef} reducedMotion={reduce} />

      <div className="pointer-events-none absolute inset-y-0 right-[6%] z-0 hidden w-px bg-gradient-to-b from-transparent via-primary/20 to-transparent lg:block" />
      <div className="pointer-events-none absolute left-[54%] top-[22%] z-0 hidden size-2 rounded-full bg-primary shadow-[0_0_0_11px_rgba(124,58,237,0.1)] lg:block" />

      <div className="relative z-10 mx-auto flex min-h-[780px] max-w-7xl flex-col px-5 pb-0 pt-32 sm:px-8 lg:px-10 lg:pt-40">
        <div className="grid flex-1 grid-cols-1 items-center gap-12 pb-16 lg:grid-cols-12 lg:gap-10">
          <motion.div
            style={{ y: copyY, opacity: copyOpacity }}
            className="relative lg:col-span-7"
          >
            <FadeUp>
              <div className="inline-flex items-center gap-2 border border-primary/15 bg-white/40 px-3 py-1.5 backdrop-blur-md">
                <span className="relative flex size-1.5">
                  {!reduce && (
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary/65" />
                  )}
                  <span className="relative inline-flex size-1.5 rounded-full bg-primary" />
                </span>
                <span className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-primary">
                  Cambodia&apos;s verified talent network
                </span>
              </div>
            </FadeUp>

            <h1 className="display mt-8 max-w-4xl text-[clamp(3.8rem,8.2vw,7.7rem)] leading-[0.86] tracking-[-0.068em]">
              <WordReveal text="Make your" delay={0.1} />
              <br />
              <WordReveal text="work" delay={0.24} />{" "}
              <span className="bg-gradient-to-r from-primary via-primary-light to-accent bg-clip-text text-transparent">
                <WordReveal text="visible." delay={0.38} />
              </span>
            </h1>

            <FadeUp delay={0.62}>
              <p className="mt-9 max-w-xl text-lg leading-relaxed text-[#5E5871] sm:text-xl">
                SkillBridge turns real student work into a verified signal
                employers can actually read — before the interview, beyond the
                résumé.
              </p>
            </FadeUp>

            <FadeUp delay={0.76}>
              <div className="mt-11 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Magnetic>
                  <Button
                    asChild
                    variant="primary"
                    size="lg"
                    className="group rounded-none shadow-soft"
                  >
                    <Link href="/auth/register">
                      Start your proof
                      <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </Link>
                  </Button>
                </Magnetic>
                <Link
                  href="/#how"
                  className="inline-flex items-center gap-2 px-3 py-3 font-mono text-[10px] font-medium uppercase tracking-[0.15em] text-gray-600 transition-colors hover:text-primary"
                >
                  See the system <span aria-hidden="true">↓</span>
                </Link>
              </div>
            </FadeUp>
          </motion.div>

          <motion.div
            style={{ y: fieldY }}
            className="relative hidden min-h-[420px] lg:col-span-5 lg:block"
            aria-hidden="true"
          >
            <div className="absolute inset-0 border border-white/70 bg-white/10 backdrop-blur-[2px]" />
            <div className="absolute inset-x-5 top-5 flex items-center justify-between border-b border-primary/15 pb-3 font-mono text-[10px] uppercase tracking-[0.15em] text-primary/70">
              <span>Proof field / 01</span>
              <span>Live signal</span>
            </div>
            <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between border-t border-primary/15 pt-4">
              <span className="max-w-[14rem] font-display text-2xl font-bold leading-none tracking-[-0.04em] text-[#241438]">
                Move through the field.
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-primary/70">
                cursor reactive
              </span>
            </div>
          </motion.div>
        </div>

        <div className="relative z-10 grid grid-cols-2 border-x border-t border-[#E6E2F2] bg-white/38 backdrop-blur-md sm:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="border-b border-r border-[#E6E2F2] px-5 py-5 last:border-r-0 sm:border-b-0 sm:px-7 sm:py-7"
            >
              <div className="font-display text-3xl font-extrabold tracking-[-0.06em] text-primary sm:text-4xl">
                <CountUp value={stat.value} suffix={stat.suffix} />
              </div>
              <div className="mt-1.5 font-mono text-[9px] uppercase tracking-[0.13em] text-gray-500 sm:text-[10px]">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-32 left-[8%] z-10 hidden items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-primary/65 xl:flex">
        <CheckCircle2 className="size-3.5" />
        Cursor field / live proof
      </div>
    </section>
  );
}
