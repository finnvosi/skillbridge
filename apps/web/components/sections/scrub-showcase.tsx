"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useReducedMotion,
} from "framer-motion";

/**
 * Full-screen scroll-scrub: hero.mp4 plays behind the whole viewport as a
 * fixed background, and its currentTime is mapped to scroll progress (alethia
 * "object turning" mechanic). Editorial text lines float in and out at scroll
 * checkpoints over the clip. The HUD shows the REAL frame index at the source
 * fps (60fps -> ~900 frames), derived from the video metadata — not a fake 23.
 *
 * Falls back to a normal autoplay loop when prefers-reduced-motion is set.
 */
const STEPS = [
  { t: "Captured", d: "Real coursework and projects, imported once." },
  { t: "Attested", d: "Employers and lecturers verify each layer." },
  { t: "Stacked", d: "Layers compose into one portable record." },
  { t: "Shown", d: "Hiring happens on the object, not the résumé." },
];

/** One editorial line that fades in, holds, then fades out across its slice. */
function FloatingStep({
  step,
  index,
  progress,
}: {
  step: { t: string; d: string };
  index: number;
  progress: ReturnType<typeof useSpring>;
}) {
  const n = STEPS.length;
  const a = index / n;
  const b = (index + 1) / n;
  const c = (index + 0.5) / n;
  const opacity = useTransform(
    progress,
    [a - 0.06, a, c, b, b + 0.06],
    [0, 1, 1, 1, 0],
  );
  const y = useTransform(progress, [a, c, b], [40, 0, -40]);
  return (
    <motion.div
      style={{ opacity, y }}
      className="absolute bottom-0 left-0 max-w-xl"
    >
      <div className="flex items-start gap-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-base font-bold text-primary-contrast">
          {index + 1}
        </span>
        <div>
          <p className="font-display text-2xl font-bold text-white sm:text-3xl">
            {step.t}
          </p>
          <p className="mt-1 text-base text-white/80 sm:text-lg">{step.d}</p>
        </div>
      </div>
    </motion.div>
  );
}

export function ScrubShowcase() {
  const ref = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const durationRef = useRef(0);
  const fpsRef = useRef(60);
  const totalFramesRef = useRef(0);
  const reduce = useReducedMotion();
  const [frame, setFrame] = useState(0);
  const [totalFrames, setTotalFrames] = useState(0);
  const [fps, setFps] = useState(60);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  const sy = useSpring(scrollYProgress, { stiffness: 170, damping: 30 });

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const onMeta = () => {
      durationRef.current = v.duration || 0;
      // Derive real fps from metadata rate string (tolerant if absent)
      const rateStr =
        // @ts-expect-error non-standard but present in some builds
        (v.videoTracks?.[0]?.frameRate as string | undefined) ?? "";
      const m = /(\d+)\/(\d+)/.exec(rateStr);
      const rate = m ? Number(m[1]) / Number(m[2]) : 60;
      fpsRef.current = rate || 60;
      const total = Math.round((durationRef.current || 0) * fpsRef.current);
      totalFramesRef.current = total || 0;
      setTotalFrames(total || 0);
      setFps(fpsRef.current);
      if (!reduce) v.currentTime = 0;
    };
    v.addEventListener("loadedmetadata", onMeta);
    onMeta();

    if (reduce) {
      v.loop = true;
      v.play().catch(() => {});
      return () => v.removeEventListener("loadedmetadata", onMeta);
    }

    const unsub = sy.on("change", (p) => {
      const d = durationRef.current;
      const vd = videoRef.current;
      if (d && vd && vd.readyState >= 1) {
        const t = Math.min(d - 0.001, Math.max(0, p * d));
        if (Math.abs(vd.currentTime - t) > 0.008) vd.currentTime = t;
        setFrame(Math.round(p * (totalFramesRef.current || 0)));
      }
    });
    return () => {
      v.removeEventListener("loadedmetadata", onMeta);
      unsub();
    };
  }, [sy, reduce]);

  const headlineY = useTransform(sy, [0, 1], [60, -60]);
  const headlineOpacity = useTransform(sy, [0, 0.12, 0.9, 1], [1, 1, 1, 0]);

  // Video tile grows from corner-sized to fullscreen as you enter the section;
  // the shared layoutId drives the position/size morph, borderRadius eases
  // the corners from rounded tile to hard fullscreen.
  const videoRadius = useTransform(sy, [0, 0.12], [16, 0]);

  return (
    <section
      ref={ref}
      id="scrub-section"
      className="relative h-[400vh] bg-black"
      aria-label="How proof is built"
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* Video morphs from the hero corner tile (shared layoutId) to
            fullscreen, then scrubs by scroll */}
        <motion.div
          layoutId="hero-scrub-video"
          style={{ borderRadius: videoRadius }}
          className="absolute left-1/2 top-1/2 z-0 h-screen w-screen -translate-x-1/2 -translate-y-1/2 overflow-hidden"
        >
          <video
            ref={videoRef}
            src="/scrub/hero-60.mp4"
            muted
            playsInline
            preload="auto"
            poster="/scrub/object-01.png"
            className="absolute inset-0 h-full w-full object-cover"
          />
        </motion.div>
        {/* Readability scrim so floating text stays legible on any frame */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/25 to-black/55" />
        <div className="bg-grain absolute inset-0 opacity-30" />

        {/* Floating editorial content */}
        <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-between px-4 py-20 sm:px-6 lg:px-8">
          <motion.div
            style={{ y: headlineY, opacity: headlineOpacity }}
            className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between"
          >
            <div>
              <p className="label-mono text-white/70">The mechanic</p>
              <h2 className="display mt-3 max-w-3xl text-4xl leading-tight text-white sm:text-6xl">
                Proof isn&apos;t a PDF.
                <br />
                It&apos;s an object.
              </h2>
            </div>
            <p className="shrink-0 self-start font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-white/45 sm:text-right sm:text-xs">
              003 — Proof
            </p>
          </motion.div>

          {/* Steps that float in/out as you scroll */}
          <div className="relative min-h-[40vh]">
            {STEPS.map((s, i) => (
              <FloatingStep key={s.t} step={s} index={i} progress={sy} />
            ))}
          </div>
        </div>

        {/* Frame HUD — real frame index at source fps */}
        <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 font-mono text-xs text-white/70">
          <span>
            FRAME <span className="text-primary">{frame}</span>
            {totalFrames > 0 && (
              <span className="text-white/50">/{totalFrames}</span>
            )}
          </span>
          <span className="text-white/40">·</span>
          <span>{fps}fps · SCRUB ▸ scroll</span>
        </div>
      </div>
    </section>
  );
}
