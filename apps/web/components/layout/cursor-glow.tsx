"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
} from "framer-motion";

/**
 * Three-layer ambient background:
 *  - bottom: solid pure white (the page background)
 *  - middle: a soft radial gradient that follows the cursor (the "aura")
 *  - top: a frosted glass veil (translucent white + blur + fine grain) so the
 *    aura reads as light seen through glass
 *
 * The aura is a CSS radial-gradient whose center is driven by spring-smoothed
 * pointer coordinates, and is strong enough to be clearly visible. Respects
 * prefers-reduced-motion and skips touch devices.
 */
export function CursorGlow() {
  const reduce = useReducedMotion();
  const [enabled, setEnabled] = useState(false);

  // Raw pointer position (viewport %, 0-100)
  const x = useMotionValue(50);
  const y = useMotionValue(50);
  // Spring-smoothed so the aura trails the cursor gently
  const sx = useSpring(x, { stiffness: 60, damping: 20, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 60, damping: 20, mass: 0.6 });

  // Build the gradient string from the spring values (no re-render)
  const background = useTransform([sx, sy], ([vx, vy]) => {
    const px = Number(vx);
    const py = Number(vy);
    return [
      // Primary purple aura — strong + large so it's clearly visible
      `radial-gradient(42% 46% at ${px}% ${py}%, rgba(123,44,191,0.34), transparent 72%)`,
      // Accent azure halo offset from the cursor
      `radial-gradient(30% 30% at ${Math.min(100, px + 20)}% ${Math.min(
        100,
        py + 14,
      )}%, rgba(56,189,248,0.20), transparent 72%)`,
    ].join(",");
  });

  const driftRaf = useRef<number | null>(null);
  const phase = useRef(0);

  useEffect(() => {
    if (window.matchMedia("(pointer: fine)").matches) setEnabled(true);

    const onMove = (e: PointerEvent) => {
      x.set((e.clientX / window.innerWidth) * 100);
      y.set((e.clientY / window.innerHeight) * 100);
      if (driftRaf.current) {
        cancelAnimationFrame(driftRaf.current);
        driftRaf.current = null;
      }
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    // Gentle idle drift so the background breathes when the mouse is still
    let raf = 0;
    const loop = () => {
      phase.current += 0.008;
      if (!driftRaf.current) {
        x.set(50 + Math.cos(phase.current) * 22);
        y.set(50 + Math.sin(phase.current * 0.8) * 16);
      }
      raf = requestAnimationFrame(loop);
    };
    if (!reduce) raf = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [reduce, x, y]);

  if (!enabled) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[-2] bg-white"
    >
      {/* Middle layer — cursor-following soft gradient */}
      <motion.div className="absolute inset-0" style={{ background }} />
      {/* Top layer — frosted glass veil: translucent white + blur + fine grain
          so it reads as a glass sheet the aura glows through */}
      <div
        className="bg-grain absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.55), rgba(255,255,255,0.42))",
          backdropFilter: "blur(8px) saturate(125%)",
          WebkitBackdropFilter: "blur(8px) saturate(125%)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.6)",
        }}
      />
    </div>
  );
}
