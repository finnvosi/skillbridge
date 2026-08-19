"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  BadgeCheck,
  BriefcaseBusiness,
  FileCheck2,
  Search,
  type LucideIcon,
} from "lucide-react";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export type Step = { n: string; t: string; d: string };

type StepVisual = {
  icon: LucideIcon;
  label: string;
  statement: string;
  surface: string;
  detail: string;
  glow: string;
};

const STEP_VISUALS: StepVisual[] = [
  {
    icon: FileCheck2,
    label: "Evidence enters the record",
    statement: "Show what was actually made.",
    surface: "bg-[#F7F4FF] text-[#171426]",
    detail: "border-[#3C096C]/15 bg-white/55 text-[#3C096C]",
    glow: "bg-[#7C3AED]/18",
  },
  {
    icon: Search,
    label: "The right work finds the right person",
    statement: "Match on ability, not keywords.",
    surface: "bg-[#EAF7FF] text-[#14202E]",
    detail: "border-[#38BDF8]/30 bg-white/60 text-[#075985]",
    glow: "bg-[#38BDF8]/22",
  },
  {
    icon: BriefcaseBusiness,
    label: "Work creates the next signal",
    statement: "Every project leaves evidence.",
    surface: "bg-[#171426] text-white",
    detail: "border-white/15 bg-white/8 text-white/72",
    glow: "bg-[#7C3AED]/30",
  },
  {
    icon: BadgeCheck,
    label: "Proof becomes portable",
    statement: "The record travels. Trust follows.",
    surface: "bg-[#F3F3F1] text-[#171426]",
    detail: "border-[#3C096C]/15 bg-white/65 text-[#3C096C]",
    glow: "bg-[#C77DFF]/22",
  },
];

function StaticSteps({ steps }: { steps: Step[] }) {
  return (
    <div className="grid gap-5">
      {steps.map((step, index) => {
        const visual = STEP_VISUALS[index % STEP_VISUALS.length];
        const Icon = visual.icon;

        return (
          <article
            key={step.n}
            className={cn(
              "relative min-h-[25rem] overflow-hidden rounded-[1.5rem] border border-[#E6E2F2] p-6 sm:p-8",
              visual.surface,
            )}
          >
            <div
              aria-hidden="true"
              className={cn(
                "absolute -right-16 -top-16 h-52 w-52 rounded-full blur-3xl",
                visual.glow,
              )}
            />
            <div className="relative flex h-full flex-col justify-between gap-16">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-55">
                  Step / {step.n}
                </span>
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] opacity-55">
                  {visual.label}
                </p>
                <h3 className="mt-4 font-display text-4xl font-extrabold leading-[0.92] tracking-[-0.045em] sm:text-5xl">
                  {step.t}
                </h3>
                <p className="mt-5 max-w-xl text-base leading-relaxed opacity-65">
                  {step.d}
                </p>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

/**
 * A pinned, scroll-scrubbed card stack. Each card rises over the previous
 * record while the outgoing card recedes and rotates, mirroring how each
 * SkillBridge step adds a new layer of verified evidence.
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
  const reduced = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const lastActiveRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (reduced || !sectionRef.current || !pinRef.current) return;

    gsap.registerPlugin(ScrollTrigger);

    const section = sectionRef.current;
    const pin = pinRef.current;
    const cards = cardRefs.current.filter(
      (card): card is HTMLElement => card !== null,
    );

    if (cards.length < 2) return;

    const context = gsap.context(() => {
      cards.forEach((card, index) => {
        gsap.set(card, {
          y: 0,
          yPercent: index === 0 ? 0 : 112,
          scale: 1,
          rotation: 0,
          transformOrigin: "50% 80%",
          zIndex: index + 1,
        });
      });

      const timeline = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${window.innerHeight * (cards.length - 1)}`,
          pin,
          pinSpacing: true,
          scrub: 0.55,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: ({ progress }) => {
            const nextIndex = Math.min(
              cards.length - 1,
              Math.floor(progress * (cards.length - 1) + 0.15),
            );

            if (nextIndex !== lastActiveRef.current) {
              lastActiveRef.current = nextIndex;
              setActiveIndex(nextIndex);
            }
          },
        },
      });

      for (let index = 0; index < cards.length - 1; index += 1) {
        const current = cards[index];
        const next = cards[index + 1];
        const rotation = index % 2 === 0 ? -4 : 4;

        timeline
          .to(
            current,
            {
              scale: 0.76,
              rotation,
              y: -36,
              opacity: 0.42,
              duration: 1,
            },
            index,
          )
          .to(
            next,
            {
              yPercent: 0,
              duration: 1,
            },
            index,
          );
      }
    }, sectionRef);

    const resizeObserver = new ResizeObserver(() => ScrollTrigger.refresh());
    resizeObserver.observe(section);

    return () => {
      resizeObserver.disconnect();
      context.revert();
    };
  }, [reduced, steps.length]);

  if (reduced) {
    return (
      <section
        id="how"
        aria-labelledby="how-title"
        className={cn(
          "border-b border-[#E6E2F2] bg-white px-4 py-20 sm:px-6 lg:px-8",
          className,
        )}
      >
        <div className="mx-auto max-w-7xl">
          <p className="label-mono">002 — {eyebrow}</p>
          <h2
            id="how-title"
            className="mt-4 max-w-3xl font-display text-5xl font-extrabold leading-[0.92] tracking-[-0.045em] text-[#171426] sm:text-6xl"
          >
            {title}
          </h2>
          <p className="mb-12 mt-6 max-w-xl text-base leading-relaxed text-[#6E6A85]">
            Real work, verified once, portable for life. Four moves turn what
            happened into a record both sides can trust.
          </p>
          <StaticSteps steps={steps} />
        </div>
      </section>
    );
  }

  return (
    <section
      id="how"
      ref={sectionRef}
      aria-labelledby="how-title"
      className={cn("relative border-b border-[#E6E2F2] bg-white", className)}
    >
      <div
        ref={pinRef}
        className="relative h-[100svh] overflow-hidden bg-white"
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(circle_at_14%_12%,rgba(124,58,237,0.09),transparent_29%),radial-gradient(circle_at_92%_88%,rgba(56,189,248,0.11),transparent_32%)]"
        />
        <div
          aria-hidden="true"
          className="bg-grain pointer-events-none absolute inset-0 opacity-[0.045]"
        />

        <div className="relative mx-auto grid h-full w-full max-w-[90rem] grid-rows-[auto_minmax(0,1fr)] gap-5 px-4 py-5 sm:px-6 sm:py-7 lg:grid-cols-12 lg:grid-rows-1 lg:gap-12 lg:px-8 lg:py-8">
          <div className="flex min-h-0 flex-col justify-between lg:col-span-4 lg:py-5">
            <div>
              <p className="font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-[#3C096C] sm:text-xs">
                002 — {eyebrow}
              </p>
              <h2
                id="how-title"
                className="mt-3 max-w-3xl font-display text-[clamp(2.55rem,5vw,5.5rem)] font-extrabold leading-[0.88] tracking-[-0.055em] text-[#171426] lg:mt-5"
              >
                {title}
              </h2>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-[#6E6A85] sm:text-base lg:mt-6">
                Real work, verified once, portable for life. Each scroll adds
                the next layer to the record.
              </p>
            </div>

            <div className="mt-4 hidden lg:block">
              <div className="flex items-end gap-3 border-b border-[#E6E2F2] pb-5">
                <span className="font-display text-7xl font-extrabold leading-none tracking-[-0.07em] text-[#3C096C]">
                  {steps[activeIndex]?.n ?? "01"}
                </span>
                <span className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-[#6E6A85]">
                  Active record
                </span>
              </div>
              <div className="mt-5 flex gap-2" aria-hidden="true">
                {steps.map((step, index) => (
                  <span
                    key={step.n}
                    className={cn(
                      "h-1.5 flex-1 rounded-full transition-colors duration-300",
                      index <= activeIndex ? "bg-[#3C096C]" : "bg-[#E6E2F2]",
                    )}
                  />
                ))}
              </div>
              <p className="mt-4 font-mono text-[9px] uppercase tracking-[0.2em] text-[#6E6A85]">
                Scroll to advance ↓
              </p>
            </div>
          </div>

          <div className="relative min-h-0 lg:col-span-8">
            <div className="relative h-full min-h-[28rem] overflow-hidden rounded-[1.6rem] sm:min-h-[31rem] lg:rounded-[2rem]">
              {steps.map((step, index) => {
                const visual = STEP_VISUALS[index % STEP_VISUALS.length];
                const Icon = visual.icon;

                return (
                  <article
                    key={step.n}
                    ref={(element) => {
                      cardRefs.current[index] = element;
                    }}
                    className={cn(
                      "absolute inset-0 overflow-hidden rounded-[1.6rem] border border-[#E6E2F2] p-6 shadow-[0_24px_70px_rgba(25,18,45,0.12)] sm:p-8 lg:rounded-[2rem] lg:p-10",
                      visual.surface,
                    )}
                    style={{
                      transform:
                        index === 0 ? "translateY(0)" : "translateY(112%)",
                    }}
                  >
                    <div
                      aria-hidden="true"
                      className={cn(
                        "absolute -right-20 -top-20 h-72 w-72 rounded-full blur-3xl",
                        visual.glow,
                      )}
                    />
                    <div
                      aria-hidden="true"
                      className="absolute right-5 top-1/2 -translate-y-1/2 font-display text-[clamp(10rem,28vw,26rem)] font-extrabold leading-none tracking-[-0.1em] opacity-[0.045]"
                    >
                      {step.n}
                    </div>
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 bg-[linear-gradient(rgba(60,9,108,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(60,9,108,0.045)_1px,transparent_1px)] bg-[size:42px_42px]"
                    />

                    <div className="relative flex h-full flex-col justify-between gap-8">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-55">
                          Step / {step.n}
                        </span>
                        <span
                          className={cn(
                            "flex h-11 w-11 items-center justify-center rounded-full border backdrop-blur-md",
                            visual.detail,
                          )}
                        >
                          <Icon className="h-5 w-5" aria-hidden="true" />
                        </span>
                      </div>

                      <div>
                        <span
                          className={cn(
                            "inline-flex rounded-full border px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.16em] backdrop-blur-md sm:text-[10px]",
                            visual.detail,
                          )}
                        >
                          {visual.label}
                        </span>
                        <h3 className="mt-5 max-w-3xl font-display text-[clamp(2.4rem,5.4vw,5.8rem)] font-extrabold leading-[0.86] tracking-[-0.06em]">
                          {step.t}
                        </h3>
                        <div className="mt-5 grid gap-4 border-t border-current/12 pt-5 sm:grid-cols-2 sm:gap-8 lg:mt-7 lg:pt-7">
                          <p className="max-w-xl text-sm leading-relaxed opacity-65 sm:text-base lg:text-lg">
                            {step.d}
                          </p>
                          <p className="hidden self-end font-display text-xl font-bold leading-tight tracking-[-0.025em] opacity-90 sm:block lg:text-2xl">
                            {visual.statement}
                          </p>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
