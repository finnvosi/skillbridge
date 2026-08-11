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
 * seat (a barely-there overshoot). It holds, then the whole frame gently fades
 * into the hero.
 *
 * Calm and editorial — no purple underline, no rings, blades, spinners, %, or
 * zoom. Driven by a master `progress` 0→1.
 *
 * Duration is DEVICE-ADAPTIVE: a capable device gets the full, slow (~3.4s)
 * luxe timing; weaker devices (few cores, low memory, data-saver / slow
 * connection) get a proportionally shorter timeline so the first open never
 * drops frames. Reduced-motion shows the set word briefly, then unmounts.
 * The overlay is pointer-events-none so it never blocks the app behind it.
 */

const WORD = "SKILLBRIDGE";
const LETTERS = WORD.split(""); // 11 glyphs

// Timeline as fractions of the master progress (0→1). The *real* wall-clock
// length of each phase scales with the device-adaptive `duration` below, so
// the relative rhythm stays identical across devices.
const P = {
  baseline: [0.02, 0.34], // charcoal rule draws (slower)
  letterStart: 0.24, // first glyph drops
  letterStagger: 0.052, // per-glyph delay (slower, more deliberate)
  letterWin: 0.18, // per-glyph settle window
  exit: [0.9, 1], // gentle crossfade into hero
};

const DUR_CAPABLE = 3.4; // seconds — full luxe timing on a capable device
const DUR_FLOOR = 1.6; // never shorter than this (word must still read)

/**
 * Pick a duration that won't lag on first open.
 * Heuristics: CPU cores, device memory, and network/data-saver hints.
 * Each weak signal scales the duration down; the result is clamped to
 * [DUR_FLOOR, DUR_CAPABLE].
 */
function computeDuration(): number {
  let dur = DUR_CAPABLE;
  if (typeof navigator === "undefined") return dur;

  const cores = navigator.hardwareConcurrency || 4;
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;
  const conn = (navigator as Navigator & { connection?: { effectiveType?: string; saveData?: boolean } })
    .connection;
  const saveData = conn?.saveData === true;
  const slowConn = /(^|-)(slow-2g|2g|3g)$/.test(conn?.effectiveType ?? "");

  if (cores <= 4) dur *= 0.75; // budget / older phones
  if (mem <= 4) dur *= 0.82; // memory-constrained
  if (saveData || slowConn) dur *= 0.62; // metered / slow network

  return Math.max(DUR_FLOOR, Math.min(dur, DUR_CAPABLE));
}

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
  // Compute the device-adaptive duration exactly once (lazy init runs on mount).
  const [duration] = useState(computeDuration);
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
      duration,
      ease: [0.22, 1, 0.36, 1],
      onComplete: () => {
        setGone(true);
        onComplete();
      },
    });
    return () => controls.stop();
  }, [reduce, progress, onComplete, duration]);

  const p = progress;

  // charcoal baseline draws from center
  const baselineScaleX = useTransform(p, (v) => (reduce ? 1 : seg(v, P.baseline[0], P.baseline[1])));
  const baselineOpacity = useTransform(p, (v) => (reduce ? 1 : seg(v, P.baseline[0], P.baseline[0] + 0.05)));

  // gentle crossfade into the hero
  const overlayOpacity = useTransform(p, (v) => (reduce ? 1 : 1 - seg(v, P.exit[0], P.exit[1])));

  if (gone) return null;

  return (
    <motion.div
      className="pointer-events-none fixed inset-0 z-[100] flex items-center justify-center bg-[#F3F3F1]"
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
      </div>
    </motion.div>
  );
}
