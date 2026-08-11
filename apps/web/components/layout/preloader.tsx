"use client";

import { useEffect, useState } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  animate,
  useReducedMotion,
  type MotionValue,
} from "framer-motion";

/**
 * SkillBridge preloader — "Typeset".
 *
 * A charcoal baseline (the composing stick) draws across first; then each
 * letter of SKILLBRIDGE drops into place one-by-one with a subtle letterpress
 * seat (a barely-there overshoot). A quiet purple underline registers under
 * the word, it holds, then the whole frame gently fades into the hero.
 *
 * Calm and editorial — no rings, blades, spinners, %, or zoom. Driven by a
 * master `progress` 0→1 over ~2.4s. Reduced-motion shows the set word briefly,
 * then unmounts. The component removes itself via onComplete so it never
 * blocks or replays.
 */

const WORD = "SKILLBRIDGE";
const LETTERS = WORD.split(""); // 11 glyphs

const DUR = 2.4; // seconds, total animation (calm)
const P = {
  baseline: [0.02, 0.3], // charcoal rule draws
  letterStart: 0.28, // first glyph drops
  letterStagger: 0.045, // per-glyph delay
  letterWin: 0.14, // per-glyph settle window
  purple: [0.8, 0.95], // purple registration underline draws
  exit: [0.92, 1], // gentle crossfade into hero
};

function seg(p: number, from: number, to: number, out: [number, number] = [0, 1]) {
  const t = Math.min(1, Math.max(0, (p - from) / (to - from)));
  return out[0] + (out[1] - out[0]) * t;
}

// mild easeOutBack — a barely-there overshoot so each glyph "seats"
function easeOutBack(t: number) {
  const c1 = 1.1;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

function letterWindow(i: number): [number, number] {
  return [P.letterStart + i * P.letterStagger, P.letterStart + i * P.letterStagger + P.letterWin];
}

function Glyph({
  char,
  progress,
  ws,
  we,
}: {
  char: string;
  progress: MotionValue<number>;
  ws: number;
  we: number;
}) {
  const opacity = useTransform(progress, (v) => seg(v, ws, we));
  const y = useTransform(progress, (v) => {
    const t = Math.min(1, Math.max(0, (v - ws) / (we - ws)));
    return -16 * (1 - easeOutBack(t)); // drops from -16, seats at 0
  });
  return (
    <motion.span className="inline-block" style={{ opacity, y }}>
      {char}
    </motion.span>
  );
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

  // charcoal baseline draws from center
  const baselineScaleX = useTransform(p, (v) => (reduce ? 1 : seg(v, P.baseline[0], P.baseline[1])));
  const baselineOpacity = useTransform(p, (v) => (reduce ? 1 : seg(v, P.baseline[0], P.baseline[0] + 0.05)));

  // purple registration underline draws under the word
  const purpleScaleX = useTransform(p, (v) => (reduce ? 1 : seg(v, P.purple[0], P.purple[1])));
  const purpleOpacity = useTransform(
    p,
    (v) => (reduce ? 1 : seg(v, P.purple[0], P.purple[0] + 0.05)) * (reduce ? 1 : 1 - seg(v, P.exit[0], P.exit[1])),
  );

  // gentle crossfade into the hero
  const overlayOpacity = useTransform(p, (v) => (reduce ? 1 : 1 - seg(v, P.exit[0], P.exit[1])));

  if (gone) return null;

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#F3F3F1]"
      style={{ opacity: overlayOpacity }}
      aria-hidden
    >
      <div className="bg-grain pointer-events-none absolute inset-0 opacity-[0.7]" />

      <div className="relative flex flex-col items-center">
        {/* SKILLBRIDGE — typeset one glyph at a time */}
        <div
          className="font-display font-extrabold uppercase text-[#1A1A1A]"
          style={{ letterSpacing: "0.2em", fontSize: "clamp(1.6rem, 6vw, 3.6rem)", paddingLeft: "0.2em" }}
        >
          {LETTERS.map((c, i) => {
            const [ws, we] = letterWindow(i);
            return <Glyph key={i} char={c} progress={p} ws={ws} we={we} />;
          })}
        </div>

        {/* charcoal baseline (composing stick) */}
        <motion.div
          className="mt-3 h-px w-full bg-[#1A1A1A]"
          style={{
            transformBox: "border-box",
            transformOrigin: "center",
            scaleX: baselineScaleX,
            opacity: baselineOpacity,
          }}
        />

        {/* quiet purple registration underline */}
        <motion.div
          className="absolute -bottom-1 left-0 h-[2px] w-full bg-[#3C096C]"
          style={{
            transformBox: "border-box",
            transformOrigin: "left",
            scaleX: purpleScaleX,
            opacity: purpleOpacity,
          }}
        />
      </div>
    </motion.div>
  );
}
