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
 * SkillBridge preloader — "Optics of Talent".
 *
 * A lens iris dilates open (concentric charcoal arcs + radial blades), a
 * restrained purple focus-ring snaps into lock (autofocus confirmation), the
 * SKILLBRIDGE wordmark settles inside the aperture, then the whole lens zooms
 * through and crossfades into the hero. No spinners, %, or glow.
 *
 * Driven by a single master `progress` 0→1 over ~1.9s. Reduced-motion shows
 * the locked final frame briefly, then unmounts. The component removes itself
 * via onComplete so it never blocks or replays.
 */

const DUR = 1.9; // seconds, total animation
const P = {
  irisStart: 0.1,
  irisOpen: 0.55,
  focusLock: 0.62, // purple ring snaps to lock
  wordmark: 0.74,
  exit: 0.9, // lens zooms through + fades
};

const PURPLE = "#3C096C";
const CHARCOAL = "#1A1A1A";
const C = { x: 200, y: 100 }; // viewBox center

// 6 aperture blades radiating from center (inner r=8 → outer r=58)
const BLADES = [0, 60, 120, 180, 240, 300].map((deg) => {
  const a = (deg * Math.PI) / 180;
  return {
    x1: C.x + 8 * Math.cos(a),
    y1: C.y + 8 * Math.sin(a),
    x2: C.x + 58 * Math.cos(a),
    y2: C.y + 58 * Math.sin(a),
  };
});

function seg(p: number, from: number, to: number, out: [number, number] = [0, 1]) {
  const t = Math.min(1, Math.max(0, (p - from) / (to - from)));
  return out[0] + (out[1] - out[0]) * t;
}

// autofocus "snap" — slight overshoot then settle into lock
function focusScale(v: number) {
  if (v < P.focusLock) return 0;
  const t = Math.min(1, Math.max(0, (v - P.focusLock) / 0.08));
  if (t < 0.6) return 0.82 + (1.05 - 0.82) * (t / 0.6); // overshoot to 1.05
  return 1.05 + (1.0 - 1.05) * ((t - 0.6) / 0.4); // settle to 1.0
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
      }, 500);
      return () => clearTimeout(t);
    }
    const controls = animate(progress, 1, {
      duration: DUR,
      ease: [0.16, 1, 0.3, 1],
      onComplete: () => {
        setGone(true);
        onComplete();
      },
    });
    return () => controls.stop();
  }, [reduce, progress, onComplete]);

  const p = progress;

  // center pin fades as the iris opens
  const pinOpacity = useTransform(p, (v) => 1 - seg(v, 0.1, 0.3));

  // concentric rings dilate open in sequence (outer → inner)
  const ringScale1 = useTransform(p, (v) => seg(v, 0.1, 0.45)); // outer r=88
  const ringScale2 = useTransform(p, (v) => seg(v, 0.14, 0.5)); // r=64
  const ringScale3 = useTransform(p, (v) => seg(v, 0.18, 0.55)); // r=42
  const ringScale4 = useTransform(p, (v) => seg(v, 0.22, 0.58)); // inner r=22

  // blades extend + a subtle mechanical counter-rotation as the iris opens
  const bladeScale = useTransform(p, (v) => seg(v, 0.14, 0.55));
  const bladeRotate = useTransform(p, (v) => seg(v, 0.14, 0.55, [0, 16]));
  const bladeOpacity = useTransform(p, (v) => seg(v, 0.14, 0.5, [0.15, 0.5]));

  // purple focus ring — snaps into lock
  const focusScaleMV = useTransform(p, (v) => focusScale(v));
  const focusOpacity = useTransform(
    p,
    (v) =>
      (reduce ? 1 : seg(v, P.focusLock, P.focusLock + 0.04)) *
      (reduce ? 1 : 1 - seg(v, P.exit, P.exit + 0.05)),
  );
  const reticleOpacity = useTransform(p, (v) =>
    seg(v, P.focusLock + 0.02, P.focusLock + 0.07),
  );

  // wordmark settles inside the aperture
  const wordmarkOpacity = useTransform(p, (v) =>
    reduce ? 1 : seg(v, P.wordmark, P.wordmark + 0.05),
  );
  const wordmarkY = useTransform(p, (v) =>
    seg(v, P.wordmark, P.wordmark + 0.05, [10, 0]),
  );

  // lens zooms through into the hero + crossfade
  const exitScale = useTransform(p, (v) => (reduce ? 1 : seg(v, P.exit, 1, [1, 1.85])));
  const overlayOpacity = useTransform(p, (v) =>
    reduce ? 1 : 1 - seg(v, P.exit, 1),
  );

  // corner registration marks — editorial framing
  const markOpacity = useTransform(p, (v) =>
    Math.min(seg(v, 0, 0.18), reduce ? 1 : 1 - seg(v, P.exit, 1)),
  );

  if (gone) return null;

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#F3F3F1]"
      style={{ opacity: overlayOpacity }}
      aria-hidden
    >
      <div className="bg-grain pointer-events-none absolute inset-0 opacity-[0.9]" />

      <motion.svg
        viewBox="0 0 400 200"
        className="relative h-[42vmin] max-h-[360px] w-[84vmin] max-w-[720px]"
        style={{ scale: exitScale }}
      >
        {/* corner registration marks */}
        <motion.g stroke={CHARCOAL} strokeWidth="0.6" style={{ opacity: markOpacity }}>
          <path d="M20 28 V20 H28" fill="none" />
          <path d="M380 28 V20 H372" fill="none" />
          <path d="M20 172 V180 H28" fill="none" />
          <path d="M380 172 V180 H372" fill="none" />
        </motion.g>

        {/* center pin (fades as iris opens) */}
        <motion.circle
          cx={C.x}
          cy={C.y}
          r="2.2"
          fill={CHARCOAL}
          style={{ opacity: pinOpacity }}
        />

        {/* concentric rings dilating open */}
        <motion.g
          style={{
            transformBox: "view-box",
            transformOrigin: "200px 100px",
            scale: ringScale1,
          }}
        >
          <circle cx={C.x} cy={C.y} r="88" fill="none" stroke={CHARCOAL} strokeWidth="0.6" opacity="0.22" />
        </motion.g>
        <motion.g
          style={{
            transformBox: "view-box",
            transformOrigin: "200px 100px",
            scale: ringScale2,
          }}
        >
          <circle cx={C.x} cy={C.y} r="64" fill="none" stroke={CHARCOAL} strokeWidth="0.7" opacity="0.3" />
        </motion.g>
        <motion.g
          style={{
            transformBox: "view-box",
            transformOrigin: "200px 100px",
            scale: ringScale3,
          }}
        >
          <circle cx={C.x} cy={C.y} r="42" fill="none" stroke={CHARCOAL} strokeWidth="0.8" opacity="0.4" />
        </motion.g>
        <motion.g
          style={{
            transformBox: "view-box",
            transformOrigin: "200px 100px",
            scale: ringScale4,
          }}
        >
          <circle cx={C.x} cy={C.y} r="22" fill="none" stroke={CHARCOAL} strokeWidth="1" opacity="0.55" />
        </motion.g>

        {/* radial aperture blades */}
        <motion.g
          stroke={CHARCOAL}
          strokeWidth="0.6"
          style={{
            transformBox: "view-box",
            transformOrigin: "200px 100px",
            scale: bladeScale,
            rotate: bladeRotate,
            opacity: bladeOpacity,
          }}
        >
          {BLADES.map((b, i) => (
            <line key={i} x1={b.x1} y1={b.y1} x2={b.x2} y2={b.y2} />
          ))}
        </motion.g>

        {/* purple focus ring — autofocus lock */}
        <motion.circle
          cx={C.x}
          cy={C.y}
          r="70"
          fill="none"
          stroke={PURPLE}
          strokeWidth="1.6"
          style={{
            scale: focusScaleMV,
            opacity: focusOpacity,
            transformBox: "view-box",
            transformOrigin: "200px 100px",
            filter: "drop-shadow(0 0 5px rgba(60,9,108,0.45))",
          }}
        />

        {/* focus reticle — purple crosshair ticks at center when locked */}
        <motion.g
          stroke={PURPLE}
          strokeWidth="1.2"
          style={{
            opacity: reticleOpacity,
            transformBox: "view-box",
            transformOrigin: "200px 100px",
          }}
        >
          <line x1={C.x - 12} y1={C.y} x2={C.x - 5} y2={C.y} />
          <line x1={C.x + 5} y1={C.y} x2={C.x + 12} y2={C.y} />
          <line x1={C.x} y1={C.y - 12} x2={C.x} y2={C.y - 5} />
          <line x1={C.x} y1={C.y + 5} x2={C.x} y2={C.y + 12} />
        </motion.g>
      </motion.svg>

      {/* wordmark */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        style={{ opacity: wordmarkOpacity, y: wordmarkY }}
      >
        <span
          className="font-display font-extrabold uppercase text-[#1A1A1A]"
          style={{ letterSpacing: "0.22em", fontSize: "clamp(1.6rem, 6vw, 3.4rem)", paddingLeft: "0.22em" }}
        >
          SkillBridge
        </span>
      </motion.div>
    </motion.div>
  );
}
