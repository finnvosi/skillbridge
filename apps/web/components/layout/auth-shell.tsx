"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { FadeUp } from "@/components/motion";
import { WordReveal } from "@/components/motion";

/**
 * Split-screen auth layout: branded panel (glow + grain + word-reveal
 * headline + proof row) on the left, form slot on the right. On small
 * screens the panel collapses to a compact top bar. Premium, not the
 * old `bg-gradient-to-br from-purple-100` flat card.
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
    <div className="flex min-h-screen bg-white">
      {/* Brand panel */}
      <aside className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-primary p-12 text-primary-contrast lg:flex">
        <div className="glow-purple absolute inset-0 -z-10 opacity-30" />
        <div className="bg-grain absolute inset-0 -z-10 opacity-20" />
        <Link href="/" className="flex items-center gap-2">
          <span className="font-display text-xl font-extrabold">SkillBridge</span>
        </Link>

        <div>
          <WordReveal
            text={mode === "login" ? "Welcome back." : "Build your bridge."}
            className="display text-5xl leading-[1.05]"
          />
          <p className="mt-5 max-w-sm text-primary-contrast/80">
            Cambodia&apos;s verified talent network. Show the work, skip the
            résumé theatre.
          </p>

          <div className="mt-10 space-y-4">
            {[
              { icon: ShieldCheck, t: "Verified by the people who saw the work" },
              { icon: Sparkles, t: "Portable proof that travels with you" },
            ].map((f) => (
              <div key={f.t} className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
                  <f.icon className="h-4 w-4" />
                </span>
                <span className="text-sm text-primary-contrast/90">{f.t}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-primary-contrast/60">
          TradeLink Technologies · Phnom Penh
        </p>
      </aside>

      {/* Form side */}
      <main className="flex w-full flex-col items-center justify-center px-4 py-12 sm:px-6 lg:w-1/2 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md"
        >
          {/* mobile brand */}
          <Link href="/" className="mb-8 flex items-center gap-2 lg:hidden">
            <span className="font-display text-lg font-extrabold text-primary">
              SkillBridge
            </span>
          </Link>

          <FadeUp>
            <h1 className="display text-3xl text-gray-900">{title}</h1>
            <p className="mt-2 text-gray-600">{subtitle}</p>
          </FadeUp>

          <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-soft sm:p-8">
            {children}
          </div>

          <p className="mt-6 text-center text-sm text-gray-500">
            By continuing you agree to our{" "}
            <Link href="/#" className="font-medium text-primary hover:underline">
              Terms
            </Link>{" "}
            &{" "}
            <Link href="/#" className="font-medium text-primary hover:underline">
              Privacy
            </Link>
            .
          </p>
        </motion.div>
      </main>
    </div>
  );
}
