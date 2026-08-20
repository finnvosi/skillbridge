"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useReducedMotion } from "framer-motion";
import { ProofObject3D } from "@/components/sections/proof-object-3d";

const proofSignals = [
  ["01", "Verified profiles"],
  ["02", "Reviewed experience"],
  ["03", "Skill attestations"],
  ["04", "Secure by design"],
] as const;

export function ProofManifesto() {
  const reducedMotion = useReducedMotion();

  return (
    <section
      id="trust"
      className="relative isolate min-h-[680px] overflow-hidden border-b border-gray-200 bg-[#F8F7FC] px-4 py-20 sm:px-6 lg:px-8 lg:py-28"
      aria-labelledby="proof-manifesto-title"
    >
      <ProofObject3D reducedMotion={reducedMotion} />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-0 bg-[linear-gradient(90deg,rgba(248,247,252,0.98)_0%,rgba(248,247,252,0.9)_34%,rgba(248,247,252,0.28)_72%,rgba(248,247,252,0.58)_100%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-0 bg-[radial-gradient(circle_at_78%_42%,rgba(255,255,255,0.48),transparent_32%)]"
      />

      <div className="relative z-10 mx-auto flex min-h-[580px] max-w-7xl flex-col justify-between">
        <div className="max-w-3xl pt-4 sm:pt-8">
          <p className="label-mono">The bet</p>
          <h2
            id="proof-manifesto-title"
            className="display mt-5 max-w-[12ch] text-5xl leading-[0.92] sm:text-7xl"
          >
            A degree shows you showed up.
            <br />
            <span className="text-gradient">Proof shows what you can do.</span>
          </h2>
          <p className="mt-7 max-w-[43ch] text-base leading-relaxed text-gray-600 sm:text-lg">
            SkillBridge makes the work behind a profile easier to see, review,
            and trust.
          </p>
          <Link
            href="/auth/register"
            className="group mt-8 inline-flex min-h-11 items-center gap-3 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-contrast shadow-soft transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            Make your proof visible
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-2 border-t border-primary/20 bg-white/28 backdrop-blur-sm sm:grid-cols-4">
          {proofSignals.map(([number, label]) => (
            <div
              key={label}
              className="border-b border-r border-primary/15 px-4 py-4 last:border-r-0 sm:border-b-0 sm:px-5 sm:py-5"
            >
              <span className="block font-mono text-[10px] tracking-[0.18em] text-primary/65">
                {number}
              </span>
              <span className="mt-2 block font-display text-sm font-bold text-gray-900">
                {label}
              </span>
            </div>
          ))}
        </div>

        <p className="pointer-events-none absolute bottom-28 right-0 hidden font-mono text-[10px] uppercase tracking-[0.18em] text-primary/65 lg:block">
          {reducedMotion
            ? "Proof field / still signal"
            : "Proof field / move to resolve"}
        </p>
      </div>
      <p className="sr-only">
        An interactive 3D proof artifact responds to pointer movement behind the
        manifesto. Reduced-motion users receive a still object with the same
        message.
      </p>
    </section>
  );
}
