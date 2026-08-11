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
 *  - top: a 20% frosted glass veil so the aura reads as light through glass
 *
 * The aura is a CSS radial-gradient whose center is driven by spring-smoothed
 * pointer coordinates. Respects prefers-reduced-motion and skips touch devices.
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
      `radial-gradient(40% 44% at ${px}% ${py}%, rgba(123,44,191,0.18), transparent 70%)`,
      `radial-gradient(30% 30% at ${Math.min(100, px + 18)}% ${Math.min(
        100,
        py + 12,
      )}%, rgba(56,189,248,0.10), transparent 70%)`,
    ].join(",");
  });

  const driftRaf = useRef<number | null>(null);
  const phase = useRef(0);

  useEffect(() => {
    // Only enable on devices with a fine pointer (skip touch)
    if (window.matchMedia("(pointer: fine)").matches) setEnabled(true);

    const onMove = (e: PointerEvent) => {
      x.set((e.clientX / window.innerWidth) * 100);
      y.set((e.clientY / window.innerHeight) * 100);
      // User is active — stop the idle drift
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
      {/* Top layer — 20% frosted glass veil */}
      <div
        className="absolute inset-0"
        style={{
          background: "rgba(255,255,255,0.80)",
          backdropFilter: "blur(2px) saturate(120%)",
          WebkitBackdropFilter: "blur(2px) saturate(120%)",
        }}
      />
    </div>
  );
}
