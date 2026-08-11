"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Stagger, StaggerItem } from "@/components/motion";
import type { ReactNode } from "react";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Split-screen auth layout — light editorial, Swiss-brutalist tone.
 *
 * Left panel: titanium #F3F3F1 base, bg-grain texture, charcoal wordmark and
 * headline, a single thin purple rule as a signal (purple is a *signal* color,
 * never a dominant background here — unlike the old solid-purple block).
 * Right: elevated white card with the form slot. On mobile the panel collapses
 * to a compact top bar so the form owns the screen.
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
  return (
    <div className="flex min-h-screen bg-[#F3F3F1] text-gray-900">
      {/* ===== Light editorial texture ===== */}
      <div className="bg-grain pointer-events-none absolute inset-0 opacity-[0.06]" />

      {/* Brand panel — desktop only */}
      <aside className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-[#F3F3F1] p-12 lg:flex">
        <div className="bg-grain pointer-events-none absolute inset-0 opacity-[0.06]" />

        <Link href="/">
          <motion.span
            className="font-display text-2xl font-extrabold text-gray-900"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            SkillBridge
          </motion.span>
        </Link>

        <Stagger className="space-y-6">
          <StaggerItem>
            <h1 className="display text-5xl leading-[1.05]">
              {mode === "login" ? "Welcome back." : "Build your bridge."}
            </h1>
          </StaggerItem>

          <StaggerItem>
            <p className="max-w-sm text-lg text-gray-600">{subtitle}</p>
          </StaggerItem>

          <StaggerItem>
            <ul className="space-y-3 text-sm text-gray-700">
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

        <p className="text-xs text-gray-500">
          SkillBridge · Phnom Penh, Cambodia
        </p>
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
          <Link href="/" className="mb-8 flex items-center gap-2">
            <span className="font-display text-xl font-extrabold text-gray-900">
              SkillBridge
            </span>
          </Link>

          <Stagger>
            <StaggerItem>
              <h1 className="display text-3xl text-gray-900">{title}</h1>
            </StaggerItem>
            <StaggerItem>
              <p className="mt-2 text-gray-600">{subtitle}</p>
            </StaggerItem>

            <StaggerItem>
              <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-8 shadow-soft sm:p-10">
                {children}
              </div>
            </StaggerItem>

            <StaggerItem>
              <p className="mt-6 text-center text-sm text-gray-500">
                By continuing you agree to our{" "}
                <Link href="/#" className="font-medium text-gray-700 underline">
                  Terms
                </Link>{" "}
                &{" "}
                <Link href="/#" className="font-medium text-gray-700 underline">
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
