"use client";

import { useEffect, useRef } from "react";
import { motion, useScroll, useTransform, useSpring, useReducedMotion } from "framer-motion";
import { FadeUp } from "@/components/motion";

/**
 * Alethia-inspired scroll-scrub: the real hero clip (hero.mp4) is scrubbed
 * frame-by-frame as the user scrolls through the pinned section — the video's
 * currentTime is mapped to scroll progress, so it plays forward/backward with
 * the scrollbar exactly like the alethia "object turning" effect. A HUD shows
 * FRAME n/23 (stylized frame index) and a generated still as the poster.
 *
 * Falls back to a normal autoplay loop when prefers-reduced-motion is set.
 */
const FRAMES = 24;

export function ScrubShowcase() {
  const ref = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const durationRef = useRef(0);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  const sy = useSpring(scrollYProgress, { stiffness: 170, damping: 30 });

  // Discrete "frame" quantization (frame-stepping HUD feel)
  const frame = useSpring(useTransform(sy, [0, 1], [0, FRAMES - 1]), {
    stiffness: 260,
    damping: 30,
  });

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const onMeta = () => {
      durationRef.current = v.duration || 0;
      if (!reduce) v.currentTime = 0;
    };
    v.addEventListener("loadedmetadata", onMeta);
    onMeta();

    if (reduce) {
      // Reduced motion: just loop the clip instead of scrubbing
      v.loop = true;
      v.play().catch(() => {});
      return () => v.removeEventListener("loadedmetadata", onMeta);
    }

    // Scrub: drive currentTime from the spring-smoothed scroll progress.
    const unsub = sy.on("change", (p) => {
      const d = durationRef.current;
      if (d && v.readyState >= 1) {
        const t = Math.min(d - 0.001, Math.max(0, p * d));
        if (Math.abs(v.currentTime - t) > 0.008) v.currentTime = t;
      }
    });
    return () => {
      v.removeEventListener("loadedmetadata", onMeta);
      unsub();
    };
  }, [sy, reduce]);

  return (
    <section
      ref={ref}
      className="relative h-[300vh] border-b border-gray-200 bg-white"
      aria-label="How proof is built"
    >
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <div className="glow-purple absolute inset-0 -z-10 opacity-70" />
        <div className="bg-grain absolute inset-0 -z-10" />

        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          {/* Copy column — steps that activate as you scroll */}
          <div className="order-2 lg:order-1">
            <p className="label-mono">The mechanic</p>
            <h2 className="display mt-3 text-4xl leading-tight sm:text-5xl">
              Proof isn&apos;t a PDF.
              <br />
              It&apos;s an object.
            </h2>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-gray-600">
              Scroll, and the record turns. Every verified project is a layer —
              stacked, attested, and portable. That&apos;s the difference
              between claiming work and showing it.
            </p>

            <ol className="mt-8 space-y-4">
              {[
                { t: "Captured", d: "Real coursework and projects, imported once." },
                { t: "Attested", d: "Employers and lecturers verify each layer." },
                { t: "Stacked", d: "Layers compose into one portable record." },
                { t: "Shown", d: "Hiring happens on the object, not the résumé." },
              ].map((s, i) => (
                <FadeUp key={s.t} delay={i * 0.05}>
                  <li className="flex items-start gap-4 border-t border-gray-100 pt-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-contrast">
                      {i + 1}
                    </span>
                    <div>
                      <p className="font-display text-base font-bold text-gray-900">
                        {s.t}
                      </p>
                      <p className="text-sm text-gray-600">{s.d}</p>
                    </div>
                  </li>
                </FadeUp>
              ))}
            </ol>
          </div>

          {/* Video scrub column — real clip driven by scroll */}
          <div className="order-1 flex justify-center lg:order-2">
            <div className="[perspective:1100px] w-full max-w-[520px]">
              {/* Frame HUD — reads like a video scrubber */}
              <div className="mb-4 flex items-center justify-between font-mono text-xs text-gray-400">
                <span>
                  FRAME <motion.span className="text-primary">{frame}</motion.span>/
                  {FRAMES - 1}
                </span>
                <span>SCRUB ▸ scroll</span>
              </div>
              <div className="relative h-[420px] w-full overflow-hidden rounded-2xl border border-gray-200 bg-gray-100 shadow-soft-lg">
                <video
                  ref={videoRef}
                  src="/scrub/hero.mp4"
                  muted
                  playsInline
                  preload="auto"
                  poster="/scrub/object-01.png"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
