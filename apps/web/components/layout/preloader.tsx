"use client";

import { useEffect, useState } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  useMotionTemplate,
  animate,
  useReducedMotion,
} from "framer-motion";

/**
 * SkillBridge preloader — "The Bridge Forms".
 *
 * Two points (Potential / Opportunity) extend thin architectural lines toward
 * a center, fragments align along the paths, a restrained purple signal
 * travels left→right through the connection, the geometry locks into an
 * abstract SB bridge, the wordmark reveals, then the structure stretches
 * beyond the viewport and crossfades into the hero. No spinners, no %.
 *
 * Driven by a single master `progress` 0→1 over ~2.1s. Reduced-motion shows
 * the final wordmark immediately (no sequence). The component unmounts itself
 * via onComplete so it never blocks or replays.
 */

const DUR = 2.1; // seconds, total animation
const P = {
  pointsIn: 0.05, // 0.10s
  linesGrow: 0.32, // ~0.67s
  fragments: 0.5, // ~1.05s
  signal: 0.62, // ~1.30s
  lock: 0.8, // ~1.68s
  wordmark: 0.86, // ~1.81s
  exit: 0.95, // ~2.0s
};

function seg(p: number, from: number, to: number, out: [number, number] = [0, 1]) {
  // linear ramped value across [from,to] clamped, mapped to [out[0],out[1]]
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
      }, 450);
      return () => clearTimeout(t);
    }
    const controls = animate(progress, 1, {
      duration: DUR,
      ease: [0.16, 1, 0.3, 1], // ease-out, engineered
      onComplete: () => {
        setGone(true);
        onComplete();
      },
    });
    return () => controls.stop();
  }, [reduce, progress, onComplete]);

  // ---- derived values (all at top level, no hooks in loops) ----
  const p = progress;

  // Phase 02 — points + lines grow from each side toward center
  const pointsOpacity = useTransform(p, (v) => seg(v, 0, P.pointsIn));
  const leftLineScaleX = useTransform(p, (v) => seg(v, P.pointsIn, P.linesGrow));
  const rightLineScaleX = useTransform(p, (v) => seg(v, P.pointsIn, P.linesGrow));
  const leftLineTransform = useMotionTemplate`scaleX(${leftLineScaleX})`;
  const rightLineTransform = useMotionTemplate`scaleX(${rightLineScaleX})`;

  // Phase 03 — drafting fragments align
  const fragOpacity = useTransform(p, (v) => seg(v, P.fragments - 0.06, P.fragments));
  const fragY = useTransform(p, (v) => seg(v, P.fragments - 0.06, P.fragments, [-6, 0]));

  // Phase 04 — purple signal travels left→right (linear)
  const signalX = useTransform(p, (v) => {
    const t = seg(v, P.signal, P.lock);
    return 70 + t * 260; // from x70 to x330
  });
  const signalOpacity = useTransform(p, (v) =>
    Math.max(0, seg(v, P.signal, P.signal + 0.03)) * (1 - seg(v, P.lock - 0.02, P.lock)),
  );

  // Phase 05 — bridge locks (center geometry) + wordmark
  const bridgeOpacity = useTransform(p, (v) => seg(v, P.lock - 0.04, P.lock));
  const wordmarkOpacity = useTransform(p, (v) => seg(v, P.wordmark, P.wordmark + 0.04));
  const wordmarkY = useTransform(p, (v) => seg(v, P.wordmark, P.wordmark + 0.04, [8, 0]));

  // Phase 06 — structure stretches out + fades, crossfade to site
  const exitProgress = useTransform(p, (v) => seg(v, P.exit, 1));
  const groupScaleX = useTransform(exitProgress, [0, 1], [1, 2.6]);
  const overlayOpacity = useTransform(p, (v) => 1 - seg(v, P.exit, 1));

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
        style={{ scaleX: reduce ? 1 : groupScaleX }}
      >
        {/* baseline */}
        <line x1="40" y1="100" x2="360" y2="100" stroke="#1A1A1A" strokeWidth="0.5" opacity="0.12" />

        {/* LEFT side: point + line extending right from x70 toward center 200 */}
        <motion.circle cx="70" cy="100" r="3" fill="#1A1A1A" style={{ opacity: pointsOpacity }} />
        <motion.g style={{ opacity: pointsOpacity }}>
          <motion.line
            x1="70"
            y1="100"
            x2="200"
            y2="100"
            stroke="#1A1A1A"
            strokeWidth="1.2"
            strokeLinecap="square"
            style={{ transformBox: "fill-box", transformOrigin: "left center", transform: leftLineTransform }}
          />
        </motion.g>

        {/* RIGHT side: point + line extending left from x330 toward center 200 */}
        <motion.circle cx="330" cy="100" r="3" fill="#1A1A1A" style={{ opacity: pointsOpacity }} />
        <motion.g style={{ opacity: pointsOpacity }}>
          <motion.line
            x1="330"
            y1="100"
            x2="200"
            y2="100"
            stroke="#1A1A1A"
            strokeWidth="1.2"
            strokeLinecap="square"
            style={{ transformBox: "fill-box", transformOrigin: "right center", transform: rightLineTransform }}
          />
        </motion.g>

        {/* Phase 03 — drafting fragments along the path (small ticks + grid square) */}
        <motion.g style={{ opacity: fragOpacity, y: fragY }}>
          <line x1="120" y1="92" x2="120" y2="108" stroke="#1A1A1A" strokeWidth="0.6" opacity="0.5" />
          <line x1="160" y1="94" x2="160" y2="106" stroke="#1A1A1A" strokeWidth="0.6" opacity="0.4" />
          <line x1="240" y1="94" x2="240" y2="106" stroke="#1A1A1A" strokeWidth="0.6" opacity="0.4" />
          <line x1="280" y1="92" x2="280" y2="108" stroke="#1A1A1A" strokeWidth="0.6" opacity="0.5" />
          {/* faint grid square fragment near center */}
          <rect x="186" y="86" width="28" height="28" fill="none" stroke="#1A1A1A" strokeWidth="0.5" opacity="0.18" />
        </motion.g>

        {/* Phase 05 — abstract bridge lock: vertical join + diagonal crossing (SB feel) */}
        <motion.g style={{ opacity: bridgeOpacity }}>
          <line x1="200" y1="74" x2="200" y2="126" stroke="#1A1A1A" strokeWidth="1.4" strokeLinecap="square" />
          <line x1="178" y1="112" x2="222" y2="88" stroke="#1A1A1A" strokeWidth="0.8" opacity="0.55" />
          <line x1="178" y1="88" x2="222" y2="112" stroke="#1A1A1A" strokeWidth="0.5" opacity="0.3" />
        </motion.g>

        {/* Phase 04 — purple signal travelling left→right through the connection */}
        <motion.rect
          x={signalX}
          y="86"
          width="3"
          height="28"
          rx="1.5"
          fill="#3C096C"
          style={{
            opacity: signalOpacity,
            filter: "drop-shadow(0 0 6px rgba(60,9,108,0.5))",
          }}
        />
      </motion.svg>

      {/* Phase 05 — wordmark */}
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
