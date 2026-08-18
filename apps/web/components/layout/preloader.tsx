"use client";

import { useEffect, useState } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from "framer-motion";

/**
 * SkillBridge preloader — "The Bridge Forms".
 *
 * Two anchors establish the span. A single purple signal crosses while the
 * structure locks together, briefly revealing the identity. The completed
 * span then becomes an aperture into the landing page beneath it.
 *
 * One deterministic 0→1 timeline; transform, opacity, and clip-path only.
 */

const P = {
  anchors: [0.02, 0.16],
  span: [0.12, 0.46],
  signal: [0.18, 0.61],
  ribsStart: 0.3,
  ribStagger: 0.035,
  ribWindow: 0.16,
  identity: [0.46, 0.68],
  hold: [0.68, 0.79],
  exit: [0.79, 1],
} as const;

const DURATION_CAPABLE = 3.05;
const DURATION_FLOOR = 1.75;
const RIBS = [12, 25, 38, 50, 62, 75, 88];

function segment(value: number, from: number, to: number) {
  if (to <= from) return value >= to ? 1 : 0;
  const t = Math.min(1, Math.max(0, (value - from) / (to - from)));
  return t * t * (3 - 2 * t);
}

function computeDuration() {
  if (typeof navigator === "undefined") return DURATION_CAPABLE;

  let duration = DURATION_CAPABLE;
  const cores = navigator.hardwareConcurrency || 4;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;
  const connection = (
    navigator as Navigator & {
      connection?: { effectiveType?: string; saveData?: boolean };
    }
  ).connection;

  if (cores <= 4) duration *= 0.78;
  if (memory <= 4) duration *= 0.84;
  if (connection?.saveData || /(^|-)(slow-2g|2g|3g)$/.test(connection?.effectiveType ?? "")) {
    duration *= 0.68;
  }

  return Math.max(DURATION_FLOOR, Math.min(duration, DURATION_CAPABLE));
}

function BridgeRib({
  progress,
  position,
  index,
  reduced,
}: {
  progress: MotionValue<number>;
  position: number;
  index: number;
  reduced: boolean;
}) {
  const start = P.ribsStart + index * P.ribStagger;
  const end = start + P.ribWindow;
  const scaleY = useTransform(progress, (value) =>
    reduced ? 1 : segment(value, start, end),
  );
  const opacity = useTransform(progress, (value) =>
    reduced ? 0.3 : segment(value, start, start + 0.06) * 0.3,
  );

  return (
    <motion.span
      className="absolute top-1/2 h-8 w-px -translate-y-1/2 bg-[#1A1A1A] sm:h-10"
      style={{ left: `${position}%`, scaleY, opacity, transformOrigin: "center" }}
    />
  );
}

function Anchor({
  side,
  progress,
  reduced,
}: {
  side: "left" | "right";
  progress: MotionValue<number>;
  reduced: boolean;
}) {
  const scale = useTransform(progress, (value) =>
    reduced ? 1 : 0.65 + segment(value, P.anchors[0], P.anchors[1]) * 0.35,
  );
  const opacity = useTransform(progress, (value) =>
    reduced ? 1 : segment(value, P.anchors[0], P.anchors[1]),
  );

  return (
    <motion.div
      className={`absolute top-1/2 size-3 -translate-y-1/2 border border-[#1A1A1A] bg-[#F3F3F1] sm:size-3.5 ${
        side === "left" ? "left-0 -translate-x-1/2" : "right-0 translate-x-1/2"
      }`}
      style={{ scale, opacity }}
    >
      <span className="absolute left-1/2 top-1/2 h-px w-5 -translate-x-1/2 -translate-y-1/2 bg-[#1A1A1A]/35" />
      <span className="absolute left-1/2 top-1/2 h-5 w-px -translate-x-1/2 -translate-y-1/2 bg-[#1A1A1A]/35" />
    </motion.div>
  );
}

function GridPanel() {
  return (
    <div
      className="absolute inset-0 bg-[#F3F3F1]"
      style={{
        backgroundImage:
          "linear-gradient(rgba(26,26,26,0.032) 1px, transparent 1px), linear-gradient(90deg, rgba(26,26,26,0.032) 1px, transparent 1px)",
        backgroundSize: "48px 48px",
      }}
    />
  );
}

export function Preloader({ onComplete }: { onComplete: () => void }) {
  const reduced = Boolean(useReducedMotion());
  const [gone, setGone] = useState(false);
  const [duration] = useState(computeDuration);
  const progress = useMotionValue(reduced ? P.hold[0] : 0);

  useEffect(() => {
    if (reduced) {
      const timeout = window.setTimeout(() => {
        setGone(true);
        onComplete();
      }, 520);
      return () => window.clearTimeout(timeout);
    }

    const controls = animate(progress, 1, {
      duration,
      ease: "linear",
      onComplete: () => {
        setGone(true);
        onComplete();
      },
    });

    return () => controls.stop();
  }, [duration, onComplete, progress, reduced]);

  const topY = useTransform(progress, (value) =>
    reduced ? "0%" : `${-segment(value, P.exit[0], P.exit[1]) * 100}%`,
  );
  const bottomY = useTransform(progress, (value) =>
    reduced ? "0%" : `${segment(value, P.exit[0], P.exit[1]) * 100}%`,
  );
  const spanScaleX = useTransform(progress, (value) =>
    reduced ? 1 : segment(value, P.span[0], P.span[1]),
  );
  const spanOpacity = useTransform(progress, (value) =>
    reduced ? 1 : segment(value, P.span[0], P.span[0] + 0.06),
  );
  const signalLeft = useTransform(progress, (value) => {
    const travel = reduced ? 1 : segment(value, P.signal[0], P.signal[1]);
    return `${travel * 100}%`;
  });
  const signalOpacity = useTransform(progress, (value) => {
    if (reduced) return 1;
    const enter = segment(value, P.signal[0], P.signal[0] + 0.05);
    const settle = 1 - segment(value, P.signal[1] - 0.03, P.signal[1] + 0.06);
    return enter * settle;
  });
  const identityOpacity = useTransform(progress, (value) => {
    if (reduced) return 1;
    const enter = segment(value, P.identity[0], P.identity[1]);
    const exit = 1 - segment(value, P.hold[1], P.exit[0] + 0.06);
    return enter * exit;
  });
  const identityClip = useTransform(progress, (value) => {
    const reveal = reduced ? 1 : segment(value, P.identity[0], P.identity[1]);
    return `inset(0 ${100 - reveal * 100}% 0 0)`;
  });
  const structureOpacity = useTransform(progress, (value) =>
    reduced ? 1 : 1 - segment(value, P.hold[1], P.exit[0] + 0.07),
  );
  const seamScale = useTransform(progress, (value) => {
    if (reduced) return 1;
    const formed = segment(value, P.span[0], P.span[1]);
    const release = 1 - segment(value, P.exit[0], P.exit[0] + 0.12);
    return formed * release;
  });

  if (gone) return null;

  return (
    <motion.div
      data-skillbridge-preloader="bridge-forms"
      className="pointer-events-none fixed inset-0 z-[100] h-[100dvh] w-screen overflow-hidden"
      aria-hidden
    >
      <motion.div className="absolute inset-x-0 top-0 h-[calc(50%+1px)]" style={{ y: topY }}>
        <GridPanel />
      </motion.div>
      <motion.div className="absolute inset-x-0 bottom-0 h-[calc(50%+1px)]" style={{ y: bottomY }}>
        <GridPanel />
      </motion.div>

      <motion.div
        className="absolute inset-0 flex items-center justify-center px-6"
        style={{ opacity: structureOpacity }}
      >
        <div className="w-full max-w-[920px]">
          <div className="mb-5 flex items-center justify-between font-mono text-[8px] uppercase tracking-[0.2em] text-[#1A1A1A]/45 sm:text-[9px]">
            <span>SB / Origin</span>
            <span>Span 00—01</span>
          </div>

          <div className="relative h-14 sm:h-16">
            <motion.div
              className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-[#1A1A1A]"
              style={{ scaleX: spanScaleX, opacity: spanOpacity, transformOrigin: "center" }}
            />
            <motion.div
              className="absolute left-0 top-[calc(50%-16px)] h-px w-full bg-[#1A1A1A]/20 sm:top-[calc(50%-20px)]"
              style={{ scaleX: seamScale, transformOrigin: "center" }}
            />
            <motion.div
              className="absolute left-0 top-[calc(50%+16px)] h-px w-full bg-[#1A1A1A]/20 sm:top-[calc(50%+20px)]"
              style={{ scaleX: seamScale, transformOrigin: "center" }}
            />

            {RIBS.map((position, index) => (
              <BridgeRib
                key={position}
                progress={progress}
                position={position}
                index={index}
                reduced={reduced}
              />
            ))}

            <Anchor side="left" progress={progress} reduced={reduced} />
            <Anchor side="right" progress={progress} reduced={reduced} />

            <motion.span
              className="absolute top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 bg-[#3C096C] shadow-[0_0_0_4px_rgba(60,9,108,0.12)]"
              style={{ left: signalLeft, opacity: signalOpacity }}
            />
          </div>

          <motion.div
            className="mt-4 flex items-end justify-between gap-4"
            style={{ opacity: identityOpacity, clipPath: identityClip }}
          >
            <div>
              <p className="font-display text-[clamp(2rem,7vw,4.6rem)] font-extrabold uppercase leading-[0.82] tracking-[-0.055em] text-[#1A1A1A]">
                SkillBridge
              </p>
              <p className="mt-3 font-mono text-[8px] uppercase tracking-[0.22em] text-[#1A1A1A]/50 sm:text-[9px]">
                Proof travels · Opportunity connects
              </p>
            </div>
            <span className="hidden font-mono text-[9px] uppercase tracking-[0.2em] text-[#3C096C] sm:block">
              Connected
            </span>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}
