"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring, useReducedMotion } from "framer-motion";

/**
 * Hero centerpiece: a floating CSS-3D "bridge" mark — layered translucent
 * planes + orbiting ring + core glow, with depth (preserve-3d). Parallaxes on
 * scroll and tilts toward the pointer. No external assets.
 */
export function HeroObject() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const floatY = useSpring(useTransform(scrollYProgress, [0, 1], [60, -60]), {
    stiffness: 60,
    damping: 20,
  });

  // pointer tilt
  const rx = useSpring(0, { stiffness: 120, damping: 18 });
  const ry = useSpring(0, { stiffness: 120, damping: 18 });
  const onMove = (e: React.MouseEvent) => {
    if (reduce || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    ry.set(((e.clientX - (r.left + r.width / 2)) / r.width) * 18);
    rx.set(-((e.clientY - (r.top + r.height / 2)) / r.height) * 18);
  };
  const reset = () => {
    rx.set(0);
    ry.set(0);
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={reset}
      className="[perspective:1200px]"
    >
      <motion.div
        style={{ y: floatY, rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
        className="relative mx-auto h-[360px] w-[360px] sm:h-[440px] sm:w-[440px]"
      >
        {/* ambient halo */}
        <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-3xl" />

        {/* orbiting ring */}
        <div className="absolute inset-0 rounded-full border border-dashed border-primary/40 animate-[spin_24s_linear_infinite]" />
        <div className="absolute inset-[12%] rounded-full border border-primary-light/30 animate-[spin_18s_linear_infinite_reverse]" />

        {/* layered "record" planes */}
        <motion.div
          style={{ z: 70, y: -34 }}
          className="absolute left-1/2 top-1/2 h-48 w-72 -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-gradient-to-br from-primary to-primary-light opacity-95 shadow-soft-lg"
        />
        <motion.div
          style={{ z: 36, y: 4 }}
          className="absolute left-1/2 top-1/2 h-48 w-72 -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-white/40 bg-primary-light/60 backdrop-blur-sm"
        />
        <motion.div
          style={{ z: -36, y: 42 }}
          className="absolute left-1/2 top-1/2 h-48 w-72 -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-white/30 bg-accent/30 backdrop-blur-sm"
        />

        {/* floating chips */}
        <motion.div
          style={{ z: 90, x: -120, y: -90 }}
          className="absolute left-1/2 top-1/2 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-primary shadow-soft"
        >
          Verified ✓
        </motion.div>
        <motion.div
          style={{ z: 90, x: 120, y: 90 }}
          className="absolute left-1/2 top-1/2 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-soft"
        >
          + Portable
        </motion.div>

        {/* core */}
        <div className="absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/70 blur-xl" />
      </motion.div>
    </div>
  );
}
