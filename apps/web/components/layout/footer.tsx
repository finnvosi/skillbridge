"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowUpRight, ArrowRight, BadgeCheck } from "lucide-react";
import {
  motion,
  useInView,
  useReducedMotion,
  useMotionValue,
  useSpring,
  type Variants,
} from "framer-motion";
import { Magnetic } from "@/components/motion/primitives2";
import { ScrollVelocityMarquee } from "@/components/motion/index";

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

// Brand translation of hero-3's image strip: living proof of the network,
// not stock photos. Shown as an infinite, masked marquee on the CTA.
const PROOF_CARDS = [
  { name: "Sophea K.", role: "Frontend Intern", skill: "React" },
  { name: "Dara C.", role: "Data Student", skill: "Python" },
  { name: "Rithy K.", role: "UX Assistant", skill: "Figma" },
  { name: "Chan M.", role: "Backend Intern", skill: "Node" },
  { name: "Srey T.", role: "Design Student", skill: "Brand" },
  { name: "Visal P.", role: "Mobile Intern", skill: "Flutter" },
];

const WORD_REVEAL: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const WORD: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 120, damping: 18 },
  },
};
const FADE_UP: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 110, damping: 20 },
  },
};

// ── Brand signature wordmark ──────────────────────────────────────────────
// A ghosted, outlined "SkillBridge" that un-masks letter-by-letter when the
// footer scrolls into view, with a gentle pointer parallax. Translates the
// "big reveal words" energy of an animated footer into our light editorial
// system — utility preserved, character intact.
const WORDMARK_WRAP: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.045, delayChildren: 0.05 } },
};
const WORDMARK_CHAR: Variants = {
  hidden: { y: "115%" },
  show: {
    y: "0%",
    transition: { duration: 0.85, ease: [0.16, 1, 0.3, 1] },
  },
};

function AnimatedWordmark({ text }: { text: string }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-12%" });

  // Pointer parallax (skipped under reduced motion).
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const x = useSpring(px, { stiffness: 50, damping: 16 });
  const y = useSpring(py, { stiffness: 50, damping: 16 });

  useEffect(() => {
    if (reduce) return;
    const onMove = (e: MouseEvent) => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      px.set(((e.clientX - cx) / window.innerWidth) * 2 * 16);
      py.set(((e.clientY - cy) / window.innerHeight) * 2 * 10);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [reduce, px, py]);

  const motionProps = reduce
    ? {}
    : {
        initial: "hidden" as const,
        animate: inView ? ("show" as const) : ("hidden" as const),
      };

  return (
    <div ref={ref} aria-hidden="true" className="relative w-full overflow-hidden">
      <motion.div style={{ x, y }} className="flex select-none justify-center">
        <motion.h2
          variants={WORDMARK_WRAP}
          {...motionProps}
          className="flex font-display font-extrabold leading-[0.78] tracking-[-0.05em] text-transparent"
          style={{
            fontSize: "clamp(3.25rem, 19vw, 16rem)",
            WebkitTextStroke: "1.5px rgba(60,9,108,0.22)",
          }}
        >
          {Array.from(text).map((ch, i) => (
            <span
              key={i}
              className="inline-block overflow-hidden align-bottom"
            >
              <motion.span variants={WORDMARK_CHAR} className="inline-block">
                {ch === " " ? " " : ch}
              </motion.span>
            </span>
          ))}
        </motion.h2>
      </motion.div>
    </div>
  );
}

function ProofCard({ name, role, skill }: { name: string; role: string; skill: string }) {
  return (
    <div className="flex shrink-0 items-center gap-3 rounded-2xl border border-primary/10 bg-white/80 px-4 py-3 shadow-soft backdrop-blur-sm">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky/12 text-sky">
        <BadgeCheck className="h-4 w-4" />
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="truncate text-sm font-medium text-gray-900">{name}</span>
        <span className="truncate text-xs text-gray-500">{role}</span>
      </span>
      <span className="shrink-0 rounded-full bg-primary/8 px-2 py-0.5 text-xs font-medium text-primary">
        {skill}
      </span>
    </div>
  );
}

export function Footer() {
  const reduce = useReducedMotion();
  const ctaRef = useRef<HTMLDivElement>(null);
  const inView = useInView(ctaRef, { once: true, margin: "-80px" });
  const toTop = () =>
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });

  const motionProps = reduce
    ? {}
    : { initial: "hidden" as const, animate: inView ? ("show" as const) : ("hidden" as const) };

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
          <div className="lg:col-span-6" ref={ctaRef}>
            <motion.p
              className="label-mono"
              {...motionProps}
              variants={FADE_UP}
              transition={{ delay: 0 }}
            >
              Get started
            </motion.p>

            <motion.h2
              className="mt-4 font-display text-[clamp(2.5rem,6vw,4.5rem)] font-extrabold leading-[0.95] tracking-[-0.03em] text-gray-900"
              variants={WORD_REVEAL}
              {...motionProps}
            >
              {["Bridge", "the", "gap.", <br key="br" />].map((word, i) =>
                typeof word === "string" ? (
                  <motion.span key={i} variants={WORD} className="inline-block">
                    {word}&nbsp;
                  </motion.span>
                ) : (
                  word
                ),
              )}
              <motion.span
                variants={WORD}
                className="inline-block bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent"
              >
                Today.
              </motion.span>
            </motion.h2>

            <motion.p
              className="mt-5 max-w-md text-sm leading-relaxed text-gray-600"
              {...motionProps}
              variants={FADE_UP}
              transition={{ delay: 0.35 }}
            >
              Cambodia&apos;s verified talent network. Turn real work into
              portable proof — and let employers hire on what&apos;s been done.
            </motion.p>

            {/* ===== Proof-card marquee (hero-3 signature, brand-translated) ===== */}
            {reduce ? (
              <div className="mt-6 flex flex-wrap gap-3">
                {PROOF_CARDS.slice(0, 4).map((c) => (
                  <ProofCard key={c.name} {...c} />
                ))}
              </div>
            ) : (
              <div className="relative mt-6 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
                <motion.div
                  className="flex gap-3"
                  animate={{ x: ["0%", "-50%"] }}
                  transition={{ duration: 28, ease: "linear", repeat: Infinity }}
                >
                  {[...PROOF_CARDS, ...PROOF_CARDS].map((c, i) => (
                    <ProofCard key={`${c.name}-${i}`} {...c} />
                  ))}
                </motion.div>
              </div>
            )}

            <motion.div
              className="mt-8 flex flex-wrap items-center gap-4"
              {...motionProps}
              variants={FADE_UP}
              transition={{ delay: 0.5 }}
            >
              <Magnetic strength={0.4}>
                <Link
                  href="/auth/register"
                  className="group inline-flex h-12 items-center gap-2 rounded-full bg-primary px-6 font-mono text-xs font-semibold uppercase tracking-[0.14em] text-primary-contrast shadow-soft-lg transition-[transform,box-shadow,background-color] duration-300 hover:scale-[1.03] hover:bg-primary-hover hover:shadow-[0_0_30px_rgba(60,9,108,0.35)] active:scale-95"
                >
                  Get started free
                  <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              </Magnetic>

              <button
                type="button"
                onClick={toTop}
                className="group inline-flex min-h-11 items-center gap-2 rounded-full border border-gray-200 px-4 py-3 font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-gray-500 transition-colors hover:border-primary hover:text-primary"
              >
                Back to top
                <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5" />
              </button>
            </motion.div>
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
                        className="group flex min-h-11 items-center justify-between text-sm text-gray-700 transition-colors hover:text-primary"
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

        {/* ===== Brand signature wordmark (reveal-on-scroll + pointer parallax) ===== */}
        <div className="mt-16 border-t border-primary/10 pt-8">
          <AnimatedWordmark text="SkillBridge" />
        </div>

        {/* ===== Bottom bar ===== */}
        <div className="rule mt-2 flex flex-col items-start justify-between gap-4 pt-6 sm:flex-row sm:items-center">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} SkillBridge. All rights reserved.
          </p>
          <div className="flex items-center gap-3">
            <Magnetic strength={0.5}>
              <button
                type="button"
                onClick={toTop}
                aria-label="Back to top"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-contrast shadow-soft transition-colors hover:bg-primary-hover"
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
