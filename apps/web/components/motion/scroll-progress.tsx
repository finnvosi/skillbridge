"use client";

import { motion, useScroll, useSpring } from "framer-motion";

/**
 * Fixed top scroll-progress bar. Tracks total document scroll progress
 * (useScroll without a target = viewport scroll) and renders a thin
 * spring-eased purple fill. Reduced-motion: still reflects progress (no anim).
 */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });
  return (
    <motion.div
      style={{ scaleX }}
      className="absolute left-0 top-0 h-[2px] w-full origin-left bg-gradient-to-r from-primary-light via-primary to-accent"
    />
  );
}
