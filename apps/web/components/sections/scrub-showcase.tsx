"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { FadeUp } from "@/components/motion";

/**
 * Alethia-inspired scroll-scrub showcase: a CSS-3D "bridge" object that
 * rotates, tilts and scales as the user scrolls through the pinned section.
 * No video / no external assets — built from layered translucent planes so it
 * ships anywhere. Scrub mapping is via useScroll -> useTransform -> rotateY/
 * rotateX/scale, spring-smoothed.
 */
export function ScrubShowcase() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  const sy = useSpring(scrollYProgress, { stiffness: 80, damping: 24 });

  // Map scroll 0..1 -> 3D transforms (a full turn + tilt + subtle scale).
  const rotateY = useTransform(sy, [0, 1], [0, 360]);
  const rotateX = useTransform(sy, [0, 1], [-12, 12]);
  const scale = useTransform(sy, [0, 0.5, 1], [0.82, 1, 0.9]);
  const ringRotate = useTransform(sy, [0, 1], [0, -220]);
  const z1 = useTransform(sy, [0, 1], [0, 60]);
  const z2 = useTransform(sy, [0, 1], [0, 24]);
  const z3 = useTransform(sy, [0, 1], [0, -36]);

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

          {/* 3D object column */}
          <div className="order-1 flex justify-center lg:order-2">
            <div className="[perspective:1100px]">
              <motion.div
                style={{ rotateY, rotateX, scale, transformStyle: "preserve-3d" }}
                className="relative h-[340px] w-[340px] sm:h-[420px] sm:w-[420px]"
              >
                {/* Rotating ring */}
                <motion.div
                  style={{ rotate: ringRotate }}
                  className="absolute inset-0 rounded-full border border-dashed border-primary/40"
                />
                <motion.div
                  style={{ rotate: ringRotate, scale: 0.78 }}
                  className="absolute inset-0 rounded-full border border-primary-light/30"
                />

                {/* Stacked translucent planes (the "record") */}
                <motion.div
                  style={{ z: z1, y: -28 }}
                  className="absolute left-1/2 top-1/2 h-44 w-64 -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-gradient-to-br from-primary to-primary-light opacity-90 shadow-soft-lg"
                />
                <motion.div
                  style={{ z: z2, y: 6 }}
                  className="absolute left-1/2 top-1/2 h-44 w-64 -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/40 bg-primary-light/70 backdrop-blur-sm"
                />
                <motion.div
                  style={{ z: z3, y: 40 }}
                  className="absolute left-1/2 top-1/2 h-44 w-64 -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/30 bg-accent/30 backdrop-blur-sm"
                />

                {/* Core glow */}
                <div className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/60 blur-2xl" />
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
