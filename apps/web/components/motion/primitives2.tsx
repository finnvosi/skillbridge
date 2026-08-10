"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useReducedMotion,
} from "framer-motion";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Magnetic — child pulls toward the cursor, springs back on leave   */
/* ------------------------------------------------------------------ */
export function Magnetic({
  children,
  className,
  strength = 0.35,
}: {
  children: React.ReactNode;
  className?: string;
  strength?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const x = useSpring(0, { stiffness: 200, damping: 15 });
  const y = useSpring(0, { stiffness: 200, damping: 15 });

  const onMove = (e: React.MouseEvent) => {
    if (reduce || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * strength);
    y.set((e.clientY - (r.top + r.height / 2)) * strength);
  };
  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={reset}
      style={{ x, y }}
      className={cn("inline-block", className)}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* ScaleOnScroll — element scales with scroll progress through target */
/* ------------------------------------------------------------------ */
export function ScaleOnScroll({
  children,
  className,
  from = 0.86,
  to = 1,
}: {
  children: React.ReactNode;
  className?: string;
  from?: number;
  to?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center"],
  });
  const scale = useSpring(useTransform(scrollYProgress, [0, 1], [from, to]), {
    stiffness: 120,
    damping: 24,
  });
  return (
    <div ref={ref} className={cn("relative", className)}>
      <motion.div style={{ scale }}>{children}</motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* StickySwap — pinned section that crossfades phrases as you scroll.  */
/* Each phrase is its own component so useTransform is called once per */
/* instance (Rules of Hooks safe).                                     */
/* ------------------------------------------------------------------ */
function SwapPhrase({
  progress,
  index,
  count,
  text,
  isLast,
}: {
  progress: import("framer-motion").MotionValue<number>;
  index: number;
  count: number;
  text: string;
  isLast: boolean;
}) {
  const seg = 1 / count;
  const start = index * seg;
  const mid = start + seg / 2;
  const end = start + seg;
  const opacity = useTransform(progress, [start, mid, end], [0, 1, 0]);
  const y = useTransform(progress, [start, mid, end], [40, 0, -40]);
  return (
    <motion.span
      style={{ opacity, y }}
      className="absolute inset-0 flex items-center justify-center"
    >
      {isLast ? (
        <span className="bg-gradient-to-r from-primary to-primary-light bg-clip-text font-extrabold text-transparent">
          {text}
        </span>
      ) : (
        <span className="font-extrabold text-gray-900">{text}</span>
      )}
    </motion.span>
  );
}

function SwapTick({
  progress,
  index,
  count,
}: {
  progress: import("framer-motion").MotionValue<number>;
  index: number;
  count: number;
}) {
  const seg = 1 / count;
  const scaleX = useTransform(
    progress,
    [index * seg, (index + 1) * seg],
    [0, 1]
  );
  return (
    <span className="block h-1 w-8 overflow-hidden rounded-full bg-gray-200">
      <motion.span
        className="block h-full rounded-full bg-primary"
        style={{ scaleX, transformOrigin: "left" }}
      />
    </span>
  );
}

export function StickySwap({
  phrases,
  className,
}: {
  phrases: string[];
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  return (
    <section
      ref={ref}
      className={cn("relative h-[300vh] border-b border-gray-200", className)}
    >
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden px-4">
        <div className="mx-auto max-w-5xl text-center">
          <p className="label-mono mb-6">The shift</p>
          <div className="relative h-[2.4em] text-[clamp(2rem,7vw,5rem)] font-extrabold leading-[1.05] tracking-[-0.03em]">
            {phrases.map((p, i) => (
              <SwapPhrase
                key={i}
                progress={scrollYProgress}
                index={i}
                count={phrases.length}
                text={p}
                isLast={i === phrases.length - 1}
              />
            ))}
          </div>
          <div className="mt-10 flex justify-center gap-2">
            {phrases.map((_, i) => (
              <SwapTick
                key={i}
                progress={scrollYProgress}
                index={i}
                count={phrases.length}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
