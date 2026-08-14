"use client";

import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useVelocity,
  useReducedMotion,
  useMotionValue,
  type Variants,
} from "framer-motion";
import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Shared easing — custom cubic-bezier, premium spring feel            */
/* ------------------------------------------------------------------ */
const EASE = [0.16, 1, 0.3, 1] as const;

/* ------------------------------------------------------------------ */
/* FadeUp — enters on viewport with spring (replaces old CSS Reveal)   */
/* ------------------------------------------------------------------ */
export function FadeUp({
  children,
  className,
  delay = 0,
  y = 24,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  as?: "div" | "section" | "li" | "article" | "span";
}) {
  const reduce = useReducedMotion();
  const MotionTag = motion[as] as React.ElementType;
  return (
    <MotionTag
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 0.7, ease: EASE, delay }}
    >
      {children}
    </MotionTag>
  );
}

/* ------------------------------------------------------------------ */
/* Stagger container + item — orchestrated children entrance           */
/* ------------------------------------------------------------------ */
export const staggerContainer: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.09, delayChildren: 0.05 },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 22 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE },
  },
};

export function Stagger({
  children,
  className,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "ul" | "section";
}) {
  const reduce = useReducedMotion();
  const MotionTag = motion[as] as React.ElementType;
  return (
    <MotionTag
      className={className}
      variants={staggerContainer}
      initial={reduce ? false : "hidden"}
      whileInView="show"
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
    >
      {children}
    </MotionTag>
  );
}

export function StaggerItem({
  children,
  className,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "li" | "article";
}) {
  const MotionTag = motion[as] as React.ElementType;
  return (
    <MotionTag className={className} variants={staggerItem}>
      {children}
    </MotionTag>
  );
}

/* ------------------------------------------------------------------ */
/* WordReveal — headline that rises word-by-word with blur             */
/* ------------------------------------------------------------------ */
export function WordReveal({
  text,
  className,
  delay = 0,
}: {
  text: string;
  className?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  const words = text.split(" ");
  return (
    <motion.span
      className={cn("inline-block", className)}
      initial={reduce ? false : "hidden"}
      whileInView="show"
      viewport={{ once: true }}
      transition={{ staggerChildren: 0.08, delayChildren: delay }}
      aria-label={text}
    >
      {words.map((w, i) => (
        <span key={i} className="inline-block overflow-hidden align-bottom">
          <motion.span
            className="inline-block"
            variants={{
              hidden: { y: "110%", opacity: 0, filter: "blur(8px)" },
              show: {
                y: "0%",
                opacity: 1,
                filter: "blur(0px)",
                transition: { duration: 0.7, ease: EASE },
              },
            }}
          >
            {w}
            {i < words.length - 1 ? " " : ""}
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
}

/* ------------------------------------------------------------------ */
/* CountUp — animates a number when scrolled into view                 */
/* ------------------------------------------------------------------ */
export function CountUp({
  value,
  suffix = "",
  className,
}: {
  value: number;
  suffix?: string;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(reduce ? value : 0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!started || reduce) {
      if (reduce) setDisplay(value);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const dur = 1400;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / dur);
      // easeOutExpo
      const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
      setDisplay(Math.round(eased * value));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [started, value, reduce]);

  // Animate once on mount (stats are always in-viewport in the hero).
  useEffect(() => {
    setStarted(true);
  }, []);

  return (
    <span className={className}>
      {display}
      {suffix}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Parallax — translates Y based on scroll progress (useScroll)        */
/* ------------------------------------------------------------------ */
export function Parallax({
  children,
  className,
  speed = 0.3,
}: {
  children: ReactNode;
  className?: string;
  speed?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const MotionDiv = motion.div as React.ElementType;
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const reduce = useReducedMotion();
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    reduce ? ["0%", "0%"] : [`${speed * -60}px`, `${speed * 60}px`]
  );
  return (
    <div ref={ref} className={cn("relative", className)}>
      <MotionDiv style={{ y }}>{children}</MotionDiv>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* ScrollVelocityMarquee — strip whose speed + direction track scroll  */
/* velocity (the signature Framer effect)                              */
/* ------------------------------------------------------------------ */
export function ScrollVelocityMarquee({
  items,
  className,
  baseVelocity = 4,
}: {
  items: string[];
  className?: string;
  baseVelocity?: number;
}) {
  const reduce = useReducedMotion();
  const baseX = useMotionValueX();
  const { scrollYProgress } = useScroll();
  const scrollVelocity = useVelocity(scrollYProgress);
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 50,
    stiffness: 400,
  });
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 5], {
    clamp: false,
  });

  const [duplicated] = useState(() => [...items, ...items]);

  useEffect(() => {
    if (reduce) return;
    let raf = 0;
    const update = () => {
      const moveBy = baseVelocity * (1 + (velocityFactor.get() ?? 0));
      // decrement to scroll left; velocityFactor can flip sign
      const current = baseX.get();
      const next = current - moveBy;
      // wrap around once one copy width passed
      baseX.set(next <= -50 * items.length ? 0 : next);
      raf = requestAnimationFrame(update);
    };
    raf = requestAnimationFrame(update);
    return () => cancelAnimationFrame(raf);
  }, [baseVelocity, baseX, velocityFactor, items.length, reduce]);

  return (
    <div className={cn("overflow-hidden whitespace-nowrap", className)}>
      <motion.div className="inline-flex" style={{ x: baseX }}>
        {duplicated.map((name, i) => (
          <span
            key={i}
            className="mx-8 inline-flex items-center gap-8 font-mono text-sm uppercase tracking-[0.18em] text-gray-500"
          >
            {name}
            <span className="text-primary/50">/</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}

// local helper to create a horizontal motion value (avoids extra import line)
import { useMotionValue as _useMotionValue } from "framer-motion";
function useMotionValueX() {
  return _useMotionValue(0);
}

/* ------------------------------------------------------------------ */
/* Tilt — pointer-driven 3D tilt with spring (cards feel alive)        */
/* ------------------------------------------------------------------ */
export function Tilt({
  children,
  className,
  intensity = 8,
}: {
  children: ReactNode;
  className?: string;
  intensity?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const MotionDiv = motion.div as React.ElementType;
  const x = useSpring(0, { stiffness: 200, damping: 20 });
  const y = useSpring(0, { stiffness: 200, damping: 20 });

  const onMove = (e: React.MouseEvent) => {
    if (reduce || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    x.set(py * -intensity);
    y.set(px * intensity);
  };
  const reset = () => {
    x.set(0);
    y.set(0);
  };

  const rotateX = useTransform(x, (v) => `${v}deg`);
  const rotateY = useTransform(y, (v) => `${v}deg`);

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={reset}
      className={cn("relative [perspective:1000px]", className)}
      style={{ transformStyle: "preserve-3d" }}
    >
      <MotionDiv style={{ rotateX, rotateY }} className="h-full">
        {children}
      </MotionDiv>
    </div>
  );
}
