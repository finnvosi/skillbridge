"use client";

import Link from "next/link";
import { ArrowUpRight, ArrowRight } from "lucide-react";
import { Magnetic } from "@/components/motion/primitives2";
import { ScrollVelocityMarquee } from "@/components/motion/index";
import { useReducedMotion } from "framer-motion";

const columns = [
  {
    title: "Platform",
    links: [
      { label: "For Students", href: "/#students" },
      { label: "For Employers", href: "/#employers" },
      { label: "How it works", href: "/#how" },
      { label: "Opportunities", href: "/auth/register" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/#" },
      { label: "Careers", href: "/#" },
      { label: "Manifesto", href: "/#trust" },
      { label: "Contact", href: "/#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "/#" },
      { label: "Terms", href: "/#" },
      { label: "Verification Policy", href: "/#trust" },
      { label: "Security", href: "/#" },
    ],
  },
];

const MARQUEE = [
  "Verified",
  "Portable",
  "Proof travels",
  "Hire on proof",
  "Built in Cambodia",
  "Real work",
  "No résumés",
];

export function Footer() {
  const reduce = useReducedMotion();
  const toTop = () =>
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });

  return (
    <footer className="relative mt-auto bg-white">
      {/* Ambient glow + grain */}
      <div className="glow-purple absolute inset-x-0 top-0 -z-10 h-48 opacity-60" />
      <div className="bg-grain absolute inset-0 -z-10 opacity-50" />

      {/* ===== Scroll-velocity marquee band (reacts to scroll speed) ===== */}
      <div className="border-y border-primary/15 bg-primary text-primary-contrast">
        <ScrollVelocityMarquee
          items={MARQUEE}
          baseVelocity={3}
          className="py-3 [&_span]:!text-base [&_span]:!font-semibold [&_span]:!text-white/80"
        />
      </div>

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          {/* ===== Brand / CTA block ===== */}
          <div className="lg:col-span-6">
            <p className="label-mono">Get started</p>
            <h2 className="mt-4 font-display text-[clamp(2.5rem,6vw,4.5rem)] font-extrabold leading-[0.95] tracking-[-0.03em] text-gray-900">
              Bridge the gap.
              <br />
              <span className="bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
                Today.
              </span>
            </h2>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-gray-600">
              Cambodia&apos;s verified talent network. Turn real work into
              portable proof — and let employers hire on what&apos;s been done.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Magnetic strength={0.4}>
                <Link
                  href="/auth/register"
                  className="group inline-flex h-12 items-center gap-2 rounded-full bg-primary px-6 font-mono text-xs font-semibold uppercase tracking-[0.14em] text-primary-contrast shadow-soft-lg transition-colors hover:bg-primary-hover"
                >
                  Get started free
                  <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              </Magnetic>

              <button
                type="button"
                onClick={toTop}
                className="group inline-flex items-center gap-2 rounded-full border border-gray-200 px-4 py-3 font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-gray-500 transition-colors hover:border-primary hover:text-primary"
              >
                Back to top
                <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5" />
              </button>
            </div>
          </div>

          {/* ===== Link columns ===== */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-6">
            {columns.map((col) => (
              <div key={col.title}>
                <h4 className="label-mono-muted">{col.title}</h4>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <Link
                        href={l.href}
                        className="group flex items-center justify-between text-sm text-gray-700 transition-colors hover:text-primary"
                      >
                        <span>{l.label}</span>
                        <ArrowRight className="h-3.5 w-3.5 -translate-x-1 text-primary opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* ===== Bottom bar ===== */}
        <div className="rule mt-14 flex flex-col items-start justify-between gap-4 pt-6 sm:flex-row sm:items-center">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} SkillBridge. All rights reserved.
          </p>
          <div className="flex items-center gap-3">
            <Magnetic strength={0.5}>
              <button
                type="button"
                onClick={toTop}
                aria-label="Back to top"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-contrast shadow-soft transition-colors hover:bg-primary-hover"
              >
                <ArrowUpRight className="h-4 w-4" />
              </button>
            </Magnetic>
            <p className="label-mono-muted">Built in Cambodia · Verified by proof</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
