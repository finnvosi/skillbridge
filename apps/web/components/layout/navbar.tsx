"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion, useMotionValue, useSpring } from "framer-motion";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollProgress } from "@/components/motion/scroll-progress";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/#how", label: "How it works" },
  { href: "/#students", label: "Students" },
  { href: "/#employers", label: "Employers" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Hover-following pill indicator under active nav link.
  const pillX = useMotionValue(-100);
  const pillW = useMotionValue(0);
  const sx = useSpring(pillX, { stiffness: 350, damping: 30 });
  const sw = useSpring(pillW, { stiffness: 350, damping: 30 });

  const movePill = (e: React.MouseEvent<HTMLAnchorElement> | React.FocusEvent<HTMLAnchorElement>) => {
    const nav = (e.currentTarget as HTMLElement).parentElement!;
    const r = nav.getBoundingClientRect();
    const b = e.currentTarget.getBoundingClientRect();
    pillX.set(b.left - r.left);
    pillW.set(b.width);
  };
  const hidePill = () => {
    pillX.set(-100);
    pillW.set(0);
  };

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-4 sm:pt-4">
      <ScrollProgress className="rounded-full" />
      <motion.div
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          "pointer-events-auto mx-auto flex h-16 max-w-6xl items-center justify-between rounded-2xl border px-3 pl-3.5 shadow-soft-lg transition-all duration-300 sm:px-4",
          scrolled
            ? "border-white/60 bg-white/70 backdrop-blur-xl"
            : "border-white/40 bg-white/45 backdrop-blur-md",
        )}
      >
        {/* Brand */}
        <Link href="/" className="group flex items-center gap-2.5" aria-label="SkillBridge home">
          <span className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-primary shadow-[0_6px_18px_-6px_rgba(60,9,108,0.6)] transition-transform duration-300 group-hover:scale-105">
            <Image
              src="/skillbridge-logo.svg"
              alt=""
              width={20}
              height={20}
              className="h-5 w-5 invert"
              priority
            />
          </span>
          <span className="font-display text-lg font-extrabold tracking-tight text-gray-900">
            Skill<span className="text-primary">Bridge</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="relative hidden items-center md:flex">
          {/* hover pill */}
          <motion.span
            style={{ x: sx, width: sw }}
            className="pointer-events-none absolute -bottom-1 left-0 h-7 rounded-full bg-primary/10"
          />
          <div className="flex items-center gap-1" onMouseLeave={hidePill}>
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onMouseEnter={movePill}
                onFocus={movePill}
                className="relative rounded-full px-3.5 py-1.5 font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-gray-500 transition-colors hover:text-gray-900"
              >
                {l.label}
              </Link>
            ))}
          </div>
          <span className="mx-2 h-5 w-px bg-gray-200" />
          <Link
            href="/auth/login"
            className="rounded-full px-3 py-1.5 font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-gray-600 transition-colors hover:text-primary"
          >
            Sign in
          </Link>
        </nav>

        {/* CTA + mobile toggle */}
        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            asChild
            className="group hidden rounded-full md:inline-flex"
          >
            <Link href="/auth/register">
              Get started
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </Button>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/60 bg-white/60 text-gray-700 backdrop-blur-md transition-colors hover:bg-white hover:text-primary md:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </motion.div>

      {/* Mobile sheet */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ y: -12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -12, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-auto mx-auto mt-2 max-w-6xl overflow-hidden rounded-2xl border border-white/50 bg-white/90 p-2 shadow-soft-lg backdrop-blur-xl md:hidden"
          >
            <div className="flex flex-col">
              {LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-4 py-3 font-mono text-xs font-medium uppercase tracking-[0.14em] text-gray-600 transition-colors hover:bg-primary/5 hover:text-primary"
                >
                  {l.label}
                </Link>
              ))}
              <Link
                href="/auth/login"
                onClick={() => setOpen(false)}
                className="rounded-xl px-4 py-3 font-mono text-xs font-medium uppercase tracking-[0.14em] text-gray-600 transition-colors hover:bg-primary/5 hover:text-primary"
              >
                Sign in
              </Link>
              <Button variant="primary" size="md" asChild className="mt-1 w-full rounded-xl">
                <Link href="/auth/register" onClick={() => setOpen(false)}>
                  Get started
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
