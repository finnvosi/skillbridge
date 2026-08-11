"use client";

import { useRef } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
  useMotionTemplate,
  useReducedMotion,
} from "framer-motion";
import { FadeUp, WordReveal, CountUp } from "@/components/motion";
import { Magnetic } from "@/components/motion/primitives2";
import { Button } from "@/components/ui/button";
import { HeroObject } from "./hero-object";
import { HeroVideo } from "./hero-video";

const stats = [
  { value: 2400, suffix: "+", label: "Verified students" },
  { value: 310, suffix: "", label: "Partner employers" },
  { value: 1900, suffix: "", label: "Completed projects" },
  { value: 94, suffix: "%", label: "Hire-through rate" },
];

type FloatingCard = {
  initials: string;
  name: string;
  role: string;
  metric: string;
  pos: string;
  drift: number;
  delay: number;
};

const cards: FloatingCard[] = [
  { initials: "SD", name: "Chan Dara", role: "Data student", metric: "3 projects verified", pos: "left-2 top-[22%]", drift: -14, delay: 0 },
  { initials: "MS", name: "Meas Sophea", role: "Talent lead · Mekong", metric: "12 hires on proof", pos: "right-2 top-[30%]", drift: 16, delay: 0.6 },
  { initials: "KR", name: "Ken Rithy", role: "Founder · CamTech", metric: "Built in Cambodia", pos: "left-6 bottom-[20%]", drift: 12, delay: 1.1 },
];

/** Floating "verified proof" card — gentle float + scroll parallax. Hook at top level. */
function FloatingCard({
  card,
  scrollYProgress,
}: {
  card: FloatingCard;
  scrollYProgress: import("framer-motion").MotionValue<number>;
}) {
  const y = useTransform(scrollYProgress, [0, 1], [0, card.drift * 2.4]);
  return (
    <motion.div
      key={card.name}
      className={`absolute ${card.pos} w-60 rounded-2xl border border-gray-200/80 bg-white/80 p-4 shadow-soft backdrop-blur-md`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: [0, card.drift, 0] }}
      transition={{
        opacity: { duration: 0.6, delay: card.delay },
        y: { duration: 5 + card.delay, repeat: Infinity, ease: "easeInOut", delay: card.delay },
      }}
      style={{ y }}
    >
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-light font-display text-sm font-bold text-white">
          {card.initials}
        </span>
        <div className="min-w-0">
          <p className="truncate font-display text-sm font-bold text-gray-900">{card.name}</p>
          <p className="truncate text-xs text-gray-500">{card.role}</p>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-1.5">
        <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
        <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-primary">
          {card.metric}
        </span>
      </div>
    </motion.div>
  );
}

export function Hero() {
  const reduce = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);

  // ----- pointer spotlight -----
  const mx = useMotionValue(50);
  const my = useMotionValue(38);
  const sx = useSpring(mx, { stiffness: 80, damping: 22 });
  const sy = useSpring(my, { stiffness: 80, damping: 22 });
  const spotlight = useMotionTemplate`radial-gradient(620px circle at ${sx}% ${sy}%, rgba(60,9,108,0.14), transparent 68%)`;

  const onPointer = (e: React.PointerEvent<HTMLElement>) => {
    if (reduce || !sectionRef.current) return;
    const r = sectionRef.current.getBoundingClientRect();
    mx.set(((e.clientX - r.left) / r.width) * 100);
    my.set(((e.clientY - r.top) / r.height) * 100);
  };

  // ----- scroll parallax on copy -----
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const copyY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -70]);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.8], [1, reduce ? 1 : 0.55]);

  return (
    <section
      ref={sectionRef}
      onPointerMove={onPointer}
      className="relative overflow-hidden"
    >
      {/* Hero background video — muted autoplay loop, morphs into scrub section */}
      <HeroVideo />
      {/* Readability veil over the video — light so the clip shows through */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white/40 via-white/25 to-white/70" />
      <div className="glow-purple absolute inset-0 -z-10" />
      {/* pointer-following spotlight */}
      {!reduce && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{ background: spotlight }}
        />
      )}
      <div className="bg-grain absolute inset-0 -z-10" />

      <div className="mx-auto max-w-7xl px-4 pt-20 sm:px-6 lg:px-8 lg:pt-28">
        <motion.div style={{ y: copyY, opacity: copyOpacity }}>
          <FadeUp>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
              </span>
              <span className="label-mono">Cambodia&apos;s verified talent network</span>
            </div>
          </FadeUp>

          {/* Oversized magazine headline */}
          <h1 className="display mt-8 max-w-5xl text-[clamp(3rem,11vw,8.5rem)] leading-[0.9]">
            <WordReveal text="Stop sending" delay={0.1} />
            <br />
            <WordReveal text="résumés." delay={0.28} />
            <br />
            <span className="bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
              <WordReveal text="Show the" delay={0.46} />
            </span>{" "}
            <span className="bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
              <WordReveal text="proof." delay={0.62} />
            </span>
          </h1>

          <FadeUp delay={0.8}>
            <p className="mt-8 max-w-xl text-lg leading-relaxed text-gray-600">
              SkillBridge turns real student work into verified, portable proof
              — and helps Cambodian employers hire on what&apos;s been done,
              not what&apos;s been claimed.
            </p>
          </FadeUp>

          <FadeUp delay={0.95}>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
              <Magnetic>
                <Button asChild variant="primary" size="lg" className="shadow-soft">
                  <Link href="/auth/register">Get started free</Link>
                </Button>
              </Magnetic>
              <Button asChild variant="outline" size="lg">
                <Link href="/#how">See how it works</Link>
              </Button>
            </div>
          </FadeUp>
        </motion.div>

        {/* Centerpiece object — anchored, parallax + pointer tilt */}
        <div className="mt-12 lg:mt-16">
          <HeroObject />
        </div>

        {/* Stat strip under hero */}
        <div className="mx-auto mt-8 grid max-w-5xl grid-cols-2 gap-px border-y border-gray-200 bg-gray-200 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="bg-white px-6 py-6 text-center">
              <div className="display text-3xl text-primary sm:text-4xl">
                <CountUp value={s.value} suffix={s.suffix} />
              </div>
              <div className="mt-1 text-xs uppercase tracking-wide text-gray-500">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating "verified proof" cards — drift + parallax, desktop only */}
      {!reduce && (
        <div className="pointer-events-none absolute inset-0 hidden overflow-hidden xl:block">
          {cards.map((c) => (
            <FloatingCard key={c.name} card={c} scrollYProgress={scrollYProgress} />
          ))}
        </div>
      )}
    </section>
  );
}
