"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ScrollProgress } from "@/components/motion/scroll-progress";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 w-full border-b backdrop-blur-xl transition-all duration-300 ${
        scrolled
          ? "border-gray-200/70 bg-white/70 shadow-[0_6px_24px_-12px_rgba(60,9,108,0.18)]"
          : "border-transparent bg-white/40"
      }`}
    >
      <ScrollProgress />
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/skillbridge-logo.svg"
            alt="SkillBridge"
            width={30}
            height={30}
            className="h-7 w-auto"
          />
          <span className="font-display text-xl font-extrabold tracking-tight text-gray-900">
            Skill<span className="text-primary">Bridge</span>
          </span>
        </Link>

        <nav className="flex items-center gap-6">
          <Link
            href="/#how"
            className="hidden font-mono text-xs font-medium uppercase tracking-[0.14em] text-gray-500 transition-colors hover:text-gray-900 sm:block"
          >
            How it works
          </Link>
          <Link
            href="/#students"
            className="hidden font-mono text-xs font-medium uppercase tracking-[0.14em] text-gray-500 transition-colors hover:text-gray-900 sm:block"
          >
            Students
          </Link>
          <Link
            href="/#employers"
            className="hidden font-mono text-xs font-medium uppercase tracking-[0.14em] text-gray-500 transition-colors hover:text-gray-900 sm:block"
          >
            Employers
          </Link>
          <Link
            href="/auth/login"
            className="font-mono text-xs font-medium uppercase tracking-[0.14em] text-gray-700 transition-colors hover:text-primary"
          >
            Sign in
          </Link>
          <Button variant="primary" size="sm" asChild className="shadow-soft">
            <Link href="/auth/register">Get started</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
