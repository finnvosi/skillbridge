"use client";

import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";

const SIGNALS = [
  ["Student", "Show the work"],
  ["Employer", "Verify what happened"],
  ["Cambodia", "Keep proof portable"],
] as const;

export function GapScrollStory() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const pathLength = useTransform(scrollYProgress, [0, 0.82], [0, 1]);
  const pathOpacity = useTransform(
    scrollYProgress,
    [0, 0.08, 0.78, 1],
    [0.25, 1, 1, 0.25],
  );
  const introY = useTransform(scrollYProgress, [0, 0.58], [0, -150]);
  const introScale = useTransform(scrollYProgress, [0, 0.58], [1, 0.92]);
  const introOpacity = useTransform(
    scrollYProgress,
    [0, 0.48, 0.68],
    [1, 1, 0.12],
  );
  const proofY = useTransform(scrollYProgress, [0.48, 0.88], [760, 0]);
  const proofScale = useTransform(scrollYProgress, [0.48, 0.88], [0.94, 1]);
  const progressX = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section
      id="gap"
      ref={sectionRef}
      aria-labelledby="gap-story-title"
      className={`relative border-b border-[#E6E2F2] bg-white ${
        reduced ? "min-h-screen" : "h-[285vh]"
      }`}
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(circle_at_78%_18%,rgba(56,189,248,0.10),transparent_30%),radial-gradient(circle_at_18%_66%,rgba(124,58,237,0.10),transparent_33%)]"
        />
        <div
          aria-hidden="true"
          className="bg-grain pointer-events-none absolute inset-0 opacity-[0.045]"
        />

        <motion.svg
          aria-hidden="true"
          viewBox="0 0 1200 1900"
          fill="none"
          className="pointer-events-none absolute left-1/2 top-[-7vh] h-[118vh] w-[52rem] -translate-x-[35%] overflow-visible sm:w-[70rem] lg:left-auto lg:right-[-9rem] lg:translate-x-0"
          style={{ opacity: reduced ? 0.7 : pathOpacity }}
        >
          <motion.path
            d="M720 40C554 6 464 106 536 199C608 292 836 231 862 108C885 0 682 -25 645 84C608 193 807 322 978 253C1127 193 1110 394 935 417C739 443 499 280 358 414C208 557 506 698 737 599C970 499 1112 674 921 806C731 938 309 736 149 949C-34 1191 276 1339 560 1227C876 1103 1189 1295 1035 1538C892 1763 430 1431 268 1715C212 1813 276 1884 384 1935"
            stroke="url(#gap-signal-gradient)"
            strokeWidth="11"
            strokeLinecap="round"
            style={{ pathLength: reduced ? 1 : pathLength }}
          />
          <defs>
            <linearGradient
              id="gap-signal-gradient"
              x1="187"
              y1="70"
              x2="982"
              y2="1740"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#38BDF8" />
              <stop offset="0.52" stopColor="#7C3AED" />
              <stop offset="1" stopColor="#3C096C" />
            </linearGradient>
          </defs>
        </motion.svg>

        <motion.div
          className="relative z-10 mx-auto flex h-full max-w-7xl items-center px-5 sm:px-8 lg:px-10"
          style={
            reduced
              ? undefined
              : { y: introY, scale: introScale, opacity: introOpacity }
          }
        >
          <div className="max-w-5xl pb-[8vh]">
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-[#3C096C] sm:text-xs">
              001 — The gap
            </p>
            <h2
              id="gap-story-title"
              className="mt-7 max-w-5xl font-display text-[clamp(3.5rem,8.4vw,8.5rem)] font-extrabold leading-[0.84] tracking-[-0.075em] text-[#141127]"
            >
              Ability is everywhere.
              <br />
              <span className="text-gradient">Proof is invisible.</span>
            </h2>
            <p className="mt-9 max-w-2xl text-lg leading-relaxed text-[#4A4760] sm:text-xl lg:text-2xl">
              Students are already building. Employers are already hiring. What
              is missing is a shared record of work both sides can trust.
            </p>
            <p className="mt-7 font-mono text-[10px] uppercase tracking-[0.2em] text-[#5B5872]">
              Scroll to make the signal visible ↓
            </p>
          </div>
        </motion.div>

        <motion.div
          className="absolute inset-x-3 bottom-3 z-20 overflow-hidden rounded-[1.25rem] border border-white/10 bg-[#171426] text-white sm:inset-x-5 sm:bottom-5 lg:inset-x-8"
          style={reduced ? undefined : { y: proofY, scale: proofScale }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_92%_0%,rgba(56,189,248,0.18),transparent_33%),radial-gradient(circle_at_12%_100%,rgba(124,58,237,0.24),transparent_35%)]" />
          <div className="bg-grain pointer-events-none absolute inset-0 opacity-[0.08]" />

          <div className="relative grid min-h-[62vh] grid-cols-1 content-between gap-10 p-6 sm:p-9 lg:grid-cols-12 lg:p-12">
            <div className="lg:col-span-8">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/55">
                The bridge / 001
              </p>
              <h3 className="mt-5 max-w-4xl font-display text-[clamp(3.1rem,7.2vw,7.8rem)] font-extrabold leading-[0.86] tracking-[-0.07em]">
                Make work
                <br />
                legible.
              </h3>
            </div>

            <div className="self-end lg:col-span-4">
              <p className="max-w-md text-lg leading-relaxed text-white/68 sm:text-xl">
                SkillBridge turns projects, attestations, and skills into one
                living record — owned by the student and readable by employers.
              </p>
            </div>

            <div className="border-t border-white/14 pt-5 lg:col-span-12">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 sm:gap-0">
                {SIGNALS.map(([label, value], index) => (
                  <div
                    key={label}
                    className={`flex items-end justify-between gap-4 sm:block ${
                      index > 0 ? "sm:border-l sm:border-white/14 sm:pl-6" : ""
                    }`}
                  >
                    <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/40">
                      {label}
                    </p>
                    <p className="mt-2 text-sm font-medium text-white sm:text-base">
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="relative h-px bg-white/10">
            <motion.div
              aria-hidden="true"
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#38BDF8] via-[#7C3AED] to-[#C77DFF]"
              style={{ width: reduced ? "100%" : progressX }}
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
