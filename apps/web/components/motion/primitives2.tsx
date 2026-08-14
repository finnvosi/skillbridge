"use client";

import React, { useRef, useEffect, useCallback } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion, MotionValue } from "framer-motion";

interface MagneticProps {
  children: React.ReactNode;
  strength?: number; // 0–1, default 1
  className?: string;
}

export function Magnetic({ children, strength = 1, className }: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  // Raw motion values driven by pointer position.
  const mx = useMotionValue(0);
  const my = useMotionValue(0);

  // Spring-filtered values for smooth trailing.
  const springX = useSpring(mx, {
    stiffness: 300,
    damping: 20,
    restDelta: 0.5,
  }) as MotionValue<number>;
  const springY = useSpring(my, {
    stiffness: 300,
    damping: 20,
    restDelta: 0.5,
  }) as MotionValue<number>;

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (reduced || !ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      mx.set((px - 0.5) * 20 * strength);
      my.set((py - 0.5) * 20 * strength);
    },
    [mx, my, reduced, strength]
  );

  const handleMouseLeave = useCallback(() => {
    mx.set(0);
    my.set(0);
  }, [mx, my]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.parentElement?.addEventListener("mousemove", handleMouseMove);
    el.parentElement?.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      el.parentElement?.removeEventListener("mousemove", handleMouseMove);
      el.parentElement?.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [handleMouseMove, handleMouseLeave]);

  const MotionDiv = motion.div as React.ElementType;
  return (
    <MotionDiv
      ref={ref}
      style={{ x: springX, y: springY }}
      className={className}
    >
      {children}
    </MotionDiv>
  );
}

interface ScaleOnScrollProps {
  children: React.ReactNode;
  from?: number;
  to?: number;
  className?: string;
}

export function ScaleOnScroll({
  children,
  from = 0.9,
  to = 1,
  className,
}: ScaleOnScrollProps) {
  const reduced = useReducedMotion();
  const MotionDiv = motion.div as React.ElementType;
  return (
    <MotionDiv
      initial={{ scale: from }}
      whileInView={{ scale: to }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 25,
      }}
      className={className}
    >
      {children}
    </MotionDiv>
  );
}

interface StickySwapProps {
  top?: React.ReactNode;
  bottom?: React.ReactNode;
  swapAt?: number;
  className?: string;
  phrases?: string[];
}

export function StickySwap({
  top,
  bottom,
  swapAt = 80,
  className,
  phrases,
}: StickySwapProps) {
  const [swapped, setSwapped] = React.useState(false);
  const [phraseIdx, setPhraseIdx] = React.useState(0);

  React.useEffect(() => {
    if (!phrases || phrases.length <= 1) return;
    const id = setInterval(() => {
      setPhraseIdx((i) => (i + 1) % phrases.length);
    }, 3000);
    return () => clearInterval(id);
  }, [phrases]);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const onScroll = () => {
      setSwapped(window.scrollY > swapAt);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [swapAt]);

  const MotionDiv = motion.div as React.ElementType;
  return (
    <MotionDiv
      animate={{ opacity: swapped ? 0 : 1, y: swapped ? -8 : 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={className}
    >
      {phrases ? (
        <motion.span
          key={phraseIdx}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className={className}
          style={{ fontSize: 24, fontWeight: 600, color: '#3C096C', textAlign: 'center' }}
        >
          {phrases[phraseIdx]}
        </motion.span>
      ) : swapped ? bottom : top}
    </MotionDiv>
  );
}
