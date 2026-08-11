"use client";

import { useEffect, useState } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  animate,
  useReducedMotion,
} from "framer-motion";

/**
 * SkillBridge preloader — "Settle".
 *
 * A single thin charcoal baseline draws slowly across the center; the
 * SKILLBRIDGE wordmark settles onto it; a quiet purple dot appears at the
 * terminus; it holds; then the whole frame gently fades into the hero.
 *
 * One line, one wordmark, one accent. No rings, blades, rotation, snap,
 * reticle, or zoom. Calm and editorial. Driven by a master `progress` 0→1
 * over ~3.0s. Reduced-motion shows the final frame briefly, then unmounts.
 * The component removes itself via onComplete so it never blocks or replays.
 */

const DUR = 3.0; // seconds, total animation (slow + calm)
const P = {
  lineDraw: [0.04, 0.5], // baseline grows from center
  wordmark: [0.4, 0.72], // wordmark fades up onto the line
  tick: [0.62, 0.8], // purple dot settles at the terminus
  hold: 0.86,
  exit: [0.86, 1], // gentle crossfade into hero
};

const PURPLE = "#3C096C";
const CHARCOAL = "#1A1A1A";
const C = { x: 200, y: 100 }; // viewBox center
const LINE = { x1: 120, x2: 280 }; // baseline endpoints (length 160)

function seg(p: number, from: number, to: number, out: [number, number] = [0, 1]) {
  const t = Math.min(1, Math.max(0, (p - from) / (to - from)));
  return out[0] + (out[1] - out[0]) * t;
}

export function Preloader({ onComplete }: { onComplete: () => void }) {
  const reduce = useReducedMotion();
  const [gone, setGone] = useState(false);
  const progress = useMotionValue(reduce ? 1 : 0);

  // ---- master timeline ----
  useEffect(() => {
    if (reduce) {
      const t = setTimeout(() => {
        setGone(true);
        onComplete();
      }, 600);
      return () => clearTimeout(t);
    }
    const controls = animate(progress, 1, {
      duration: DUR,
      ease: [0.22, 1, 0.36, 1],
      onComplete: () => {
        setGone(true);
        onComplete();
      },
    });
    return () => controls.stop();
  }, [reduce, progress, onComplete]);

  const p = progress;

  // baseline draws from center outward (transform-origin = center)
  const lineScaleX = useTransform(p, (v) =>
    reduce ? 1 : seg(v, P.lineDraw[0], P.lineDraw[1]),
  );

  // wordmark settles onto the line
  const wordmarkOpacity = useTransform(p, (v) =>
    reduce ? 1 : seg(v, P.wordmark[0], P.wordmark[1]),
  );
  const wordmarkY = useTransform(p, (v) =>
    reduce ? 0 : seg(v, P.wordmark[0], P.wordmark[1], [10, 0]),
  );

  // quiet purple dot at the terminus
  const tickOpacity = useTransform(p, (v) =>
    reduce ? 1 : seg(v, P.tick[0], P.tick[1]),
  );

  // gentle crossfade into the hero
  const overlayOpacity = useTransform(p, (v) =>
    reduce ? 1 : 1 - seg(v, P.exit[0], P.exit[1]),
  );

  if (gone) return null;

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#F3F3F1]"
      style={{ opacity: overlayOpacity }}
      aria-hidden
    >
      <div className="bg-grain pointer-events-none absolute inset-0 opacity-[0.7]" />

      <motion.svg
        viewBox="0 0 400 200"
        className="relative h-[34vmin] max-h-[260px] w-[80vmin] max-w-[640px]"
      >
        {/* charcoal baseline draws from center */}
        <motion.line
          x1={LINE.x1}
          y1={C.y}
          x2={LINE.x2}
          y2={C.y}
          stroke={CHARCOAL}
          strokeWidth="1"
          style={{
            transformBox: "view-box",
            transformOrigin: "200px 100px",
            scaleX: lineScaleX,
          }}
        />

        {/* quiet purple dot at the right terminus */}
        <motion.circle
          cx={LINE.x2}
          cy={C.y}
          r="3"
          fill={PURPLE}
          style={{ opacity: tickOpacity }}
        />
      </motion.svg>

      {/* wordmark settles onto the baseline */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        style={{ opacity: wordmarkOpacity, y: wordmarkY }}
      >
        <span
          className="font-display font-extrabold uppercase text-[#1A1A1A]"
          style={{
            letterSpacing: "0.24em",
            fontSize: "clamp(1.5rem, 5.5vw, 3.2rem)",
            paddingLeft: "0.24em",
          }}
        >
          SkillBridge
        </span>
      </motion.div>
    </motion.div>
  );
}
