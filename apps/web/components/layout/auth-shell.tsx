"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Stagger, StaggerItem } from "@/components/motion";
import type { ReactNode } from "react";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Split-screen auth layout — cinematic editorial.
 *
 * Left panel: full-bleed autoplay loop of the brand hero clip (same asset as
 * the landing scrub-showcase, /scrub/hero.mp4) with the same readability scrim
 * + grain the landing uses, so the auth screen belongs to the same visual
 * system. Editorial headline + proof points float over it. Purple appears only
 * as the signal CTA / accents, never as a dominant background.
 *
 * Right: elevated white card holding the form slot.
 * On mobile the video panel collapses to a compact top bar so the form owns
 * the screen. prefers-reduced-motion swaps the video for the poster frame.
 */
export function AuthShell({
  title,
  subtitle,
  children,
  mode = "login",
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  mode?: "login" | "register";
}) {
  const reduce = useReducedMotion();

  return (
    <div className="flex min-h-screen bg-[#0d0d0d] text-gray-900">
      {/* ===== Cinematic brand panel — desktop only ===== */}
      <aside className="relative hidden w-1/2 overflow-hidden bg-[#0d0d0d] lg:flex">
        {reduce ? (
          // Reduced-motion: static poster instead of looping video
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url(/scrub/object-01.png)" }}
          />
        ) : (
          <video
            className="absolute inset-0 h-full w-full object-cover"
            src="/scrub/hero.mp4"
            poster="/scrub/object-01.png"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            aria-hidden
          />
        )}

        {/* Readability scrim + grain (matches landing treatment) */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/35 to-black/70" />
        <div className="bg-grain absolute inset-0 opacity-30" />

        {/* Floating editorial content */}
        <div className="relative z-10 flex h-full flex-col justify-between p-12">
          <Link href="/">
            <motion.span
              className="font-display text-2xl font-extrabold text-white"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE }}
            >
              SkillBridge
            </motion.span>
          </Link>

          <Stagger className="space-y-6">
            <StaggerItem>
              <h1 className="display max-w-md text-5xl leading-[1.05] text-white">
                {mode === "login" ? "Welcome back." : "Build your bridge."}
              </h1>
            </StaggerItem>

            <StaggerItem>
              <p className="max-w-sm text-lg text-white/80">{subtitle}</p>
            </StaggerItem>

            <StaggerItem>
              <ul className="space-y-3 text-sm text-white/85">
                <li className="flex items-center gap-2.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  <span>Verified by the people who saw your work</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  <span>Portable proof that travels with you</span>
                </li>
              </ul>
            </StaggerItem>
          </Stagger>

          <p className="text-xs text-white/50">SkillBridge · Phnom Penh, Cambodia</p>
        </div>
      </aside>

      {/* ===== Form side ===== */}
      <main className="flex w-full flex-col items-center justify-center px-4 py-14 sm:px-6 lg:w-1/2 lg:px-12">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.05 }}
        >
          {/* mobile wordmark */}
          <Link href="/" className="mb-8 flex items-center gap-2 lg:hidden">
            <span className="font-display text-xl font-extrabold text-white">SkillBridge</span>
          </Link>

          <Stagger>
            <StaggerItem>
              <h1 className="display text-3xl text-white">{title}</h1>
            </StaggerItem>
            <StaggerItem>
              <p className="mt-2 text-gray-400">{subtitle}</p>
            </StaggerItem>

            <StaggerItem>
              <div className="mt-8 rounded-2xl border border-white/10 bg-white/95 p-8 shadow-soft backdrop-blur-sm sm:p-10">
                {children}
              </div>
            </StaggerItem>

            <StaggerItem>
              <p className="mt-6 text-center text-sm text-gray-500">
                By continuing you agree to our{" "}
                <Link href="/#" className="font-medium text-gray-300 underline">
                  Terms
                </Link>{" "}
                &{" "}
                <Link href="/#" className="font-medium text-gray-300 underline">
                  Privacy
                </Link>
                .
              </p>
            </StaggerItem>
          </Stagger>
        </motion.div>
      </main>
    </div>
  );
}
