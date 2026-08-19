"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from "framer-motion";
import { gsap } from "gsap";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  Compass,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollProgress } from "@/components/motion/scroll-progress";
import { cn } from "@/lib/utils";

const PRIMARY_LINKS = [
  {
    href: "/#how",
    label: "How it works",
    index: "01",
    description: "A proof-first path from work to opportunity.",
    icon: Compass,
  },
  {
    href: "/#students",
    label: "For students",
    index: "02",
    description: "Turn the work you have done into a record that travels.",
    icon: Sparkles,
  },
  {
    href: "/#employers",
    label: "For employers",
    index: "03",
    description: "Meet people through what they can actually do.",
    icon: BriefcaseBusiness,
  },
] as const;

const UTILITY_LINKS = [
  { href: "/auth/login", label: "Sign in" },
  { href: "/auth/register", label: "Create your profile" },
] as const;

function MenuToggle({
  open,
  onClick,
  buttonRef,
  topLineRef,
  bottomLineRef,
}: {
  open: boolean;
  onClick: () => void;
  buttonRef: React.RefObject<HTMLButtonElement | null>;
  topLineRef: React.RefObject<HTMLSpanElement | null>;
  bottomLineRef: React.RefObject<HTMLSpanElement | null>;
}) {
  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={onClick}
      aria-label={open ? "Close navigation menu" : "Open navigation menu"}
      aria-controls="site-mega-menu"
      aria-expanded={open}
      className={cn(
        "group relative flex h-10 items-center gap-2.5 rounded-full border px-3.5 font-mono text-[10px] font-medium uppercase tracking-[0.16em] transition-colors sm:h-11 sm:px-4",
        open
          ? "border-white/20 bg-white text-[#121214]"
          : "border-gray-200/80 bg-white/70 text-gray-700 hover:border-primary/25 hover:text-primary",
      )}
    >
      <span className="hidden sm:block">{open ? "Close" : "Menu"}</span>
      <span className="relative block h-3.5 w-4" aria-hidden="true">
        <span
          ref={topLineRef}
          className="absolute left-0 top-[3px] h-px w-4 origin-center bg-current"
        />
        <span
          ref={bottomLineRef}
          className="absolute bottom-[3px] left-0 h-px w-4 origin-center bg-current"
        />
      </span>
    </button>
  );
}

function MegaMenu({
  onNavigate,
  menuRef,
}: {
  onNavigate: () => void;
  menuRef: React.MutableRefObject<HTMLElement | null>;
}) {
  const reduced = useReducedMotion();
  const rootRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || reduced) return;

    const context = gsap.context(() => {
      const timeline = gsap.timeline({ defaults: { ease: "power4.out" } });
      timeline
        .set("[data-mega-surface]", { clipPath: "inset(0 0 100% 0)" })
        .set("[data-mega-panel]", { yPercent: 105 })
        .set("[data-mega-reveal]", { autoAlpha: 0, y: 28 })
        .to("[data-mega-surface]", {
          clipPath: "inset(0 0 0% 0)",
          duration: 0.82,
          ease: "power4.inOut",
        })
        .to(
          "[data-mega-panel]",
          { yPercent: 0, duration: 0.72, stagger: 0.07, ease: "power4.out" },
          0.12,
        )
        .to(
          "[data-mega-reveal]",
          { autoAlpha: 1, y: 0, duration: 0.58, stagger: 0.055 },
          0.36,
        );
    }, root);

    return () => context.revert();
  }, [reduced]);

  return (
    <motion.section
      ref={(node) => {
        rootRef.current = node;
        menuRef.current = node;
      }}
      id="site-mega-menu"
      role="dialog"
      aria-modal="true"
      aria-label="SkillBridge navigation"
      tabIndex={-1}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduced ? 0 : 0.18 }}
      className="pointer-events-auto fixed inset-0 z-10 overflow-hidden bg-[#111114] pt-[84px] text-[#F8F8F6] sm:pt-[96px]"
    >
      <motion.div
        data-mega-surface
        exit={{ clipPath: "inset(0 0 100% 0)" }}
        transition={{ duration: reduced ? 0 : 0.48, ease: [0.76, 0, 0.24, 1] }}
        className="absolute inset-0 overflow-hidden bg-[#111114]"
      >
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.055) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.055) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />
        <div
          data-mega-panel
          className="absolute inset-y-0 left-0 w-1/3 border-r border-white/10 bg-white/[0.018]"
        />
        <div
          data-mega-panel
          className="absolute inset-y-0 left-1/3 w-1/3 border-r border-white/10 bg-[#3C096C]/[0.13]"
        />
        <div
          data-mega-panel
          className="absolute inset-y-0 right-0 w-1/3 bg-white/[0.025]"
        />
        <div className="absolute inset-x-0 top-[57%] h-px bg-gradient-to-r from-transparent via-[#9D4EDD]/70 to-transparent" />
        <div className="absolute left-[54%] top-[57%] size-2 -translate-x-1/2 -translate-y-1/2 bg-[#C77DFF] shadow-[0_0_0_9px_rgba(199,125,255,0.12)]" />
      </motion.div>

      <div className="relative mx-auto grid h-full max-w-7xl grid-rows-[auto_1fr_auto] px-5 pb-6 pt-8 sm:px-8 sm:pt-10 lg:grid-cols-12 lg:grid-rows-[1fr_auto] lg:gap-x-8 lg:px-10 lg:pb-10">
        <div className="hidden lg:col-span-4 lg:flex lg:flex-col lg:justify-between">
          <div>
            <p
              data-mega-reveal
              className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/45"
            >
              SkillBridge / Navigation system
            </p>
            <p
              data-mega-reveal
              className="mt-8 max-w-sm font-display text-5xl font-extrabold leading-[0.88] tracking-[-0.055em] text-white xl:text-6xl"
            >
              The proof should travel further than the résumé.
            </p>
          </div>
          <div
            data-mega-reveal
            className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.18em] text-white/50"
          >
            <span className="size-2 rounded-full bg-[#C77DFF]" />
            Built for Cambodia
          </div>
        </div>

        <nav
          aria-label="Primary menu"
          className="lg:col-span-7 lg:col-start-6 lg:flex lg:items-center"
        >
          <div className="w-full">
            <p
              data-mega-reveal
              className="mb-4 font-mono text-[10px] uppercase tracking-[0.22em] text-white/45 lg:mb-7"
            >
              Navigate / 03 routes
            </p>
            <div className="divide-y divide-white/15 border-y border-white/15">
              {PRIMARY_LINKS.map((item) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.href}
                    data-mega-reveal
                    whileHover={reduced ? undefined : { x: 8 }}
                    transition={{ type: "spring", stiffness: 320, damping: 28 }}
                  >
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      className="group grid grid-cols-[28px_1fr_auto] items-center gap-3 py-4 sm:grid-cols-[42px_1fr_auto] sm:gap-5 sm:py-5 lg:py-6"
                    >
                      <span className="font-mono text-[10px] tracking-[0.12em] text-[#C77DFF]">
                        {item.index}
                      </span>
                      <span>
                        <span className="block font-display text-[clamp(1.65rem,4.2vw,3.6rem)] font-bold leading-none tracking-[-0.045em] text-white transition-colors group-hover:text-[#E0AAFF]">
                          {item.label}
                        </span>
                        <span className="mt-1.5 hidden max-w-md text-sm leading-relaxed text-white/50 sm:block">
                          {item.description}
                        </span>
                      </span>
                      <span className="flex size-9 items-center justify-center rounded-full border border-white/15 text-white/60 transition-all group-hover:border-[#C77DFF]/60 group-hover:bg-[#C77DFF] group-hover:text-[#1B1022]">
                        <Icon className="size-4" />
                      </span>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </nav>

        <div className="col-span-full mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-white/15 pt-5 lg:col-start-6 lg:mt-0 lg:pt-6">
          <div data-mega-reveal className="flex items-center gap-4">
            {UTILITY_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/60 transition-colors hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </div>
          <Link
            data-mega-reveal
            href="/auth/register"
            onClick={onNavigate}
            className="group inline-flex items-center gap-2 rounded-full bg-[#F8F8F6] px-4 py-2.5 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-[#161419] transition-colors hover:bg-[#E0AAFF]"
          >
            Start with your proof
            <ArrowUpRight className="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </motion.section>
  );
}

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const reduced = useReducedMotion();
  const { scrollY } = useScroll();
  const lastScrollY = useRef(0);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLElement | null>(null);
  const topLineRef = useRef<HTMLSpanElement>(null);
  const bottomLineRef = useRef<HTMLSpanElement>(null);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const delta = latest - lastScrollY.current;

    if (reduced || open || latest < 80) {
      setHidden(false);
    } else if (delta > 6) {
      setHidden(true);
    } else if (delta < -6) {
      setHidden(false);
    }

    lastScrollY.current = latest;
  });

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const inactiveSurfaces = Array.from(
      document.querySelectorAll("main, footer"),
    );
    if (open) {
      document.body.style.overflow = "hidden";
      inactiveSurfaces.forEach((surface) => surface.setAttribute("inert", ""));
      window.requestAnimationFrame(() => menuRef.current?.focus());
    }

    return () => {
      document.body.style.overflow = previousOverflow;
      inactiveSurfaces.forEach((surface) => surface.removeAttribute("inert"));
    };
  }, [open]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && open) {
        setOpen(false);
        menuButtonRef.current?.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  useLayoutEffect(() => {
    const lines = [topLineRef.current, bottomLineRef.current].filter(Boolean);
    if (!lines.length || reduced) return;

    gsap.to(topLineRef.current, {
      y: open ? 3.5 : 0,
      rotate: open ? 45 : 0,
      duration: 0.32,
      ease: "power3.out",
    });
    gsap.to(bottomLineRef.current, {
      y: open ? -3.5 : 0,
      rotate: open ? -45 : 0,
      duration: 0.32,
      ease: "power3.out",
    });
  }, [open, reduced]);

  const closeMenu = () => {
    setOpen(false);
    menuButtonRef.current?.focus();
  };

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-4 sm:pt-4">
      <ScrollProgress className="rounded-full" />
      <motion.div
        initial={{ y: -24, opacity: 0 }}
        animate={{
          y: hidden && !open && !reduced ? "-130%" : 0,
          opacity: hidden && !open && !reduced ? 0 : 1,
        }}
        transition={{
          duration: reduced ? 0 : 0.34,
          ease: [0.22, 1, 0.36, 1],
        }}
        className={cn(
          "pointer-events-auto relative z-20 mx-auto flex h-16 max-w-6xl items-center justify-between overflow-hidden rounded-2xl border px-3 pl-3.5 transition-[background-color,border-color,box-shadow] duration-500 [isolation:isolate] sm:h-[68px] sm:px-4",
          open
            ? "border-white/15 bg-[#19181C]/78 text-white shadow-[0_20px_65px_-22px_rgba(8,6,12,0.68),inset_0_1px_0_rgba(255,255,255,0.14)] backdrop-blur-[28px]"
            : "border-transparent bg-transparent shadow-none backdrop-blur-none",
        )}
      >
        <div
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-500",
            open &&
              "bg-[linear-gradient(112deg,rgba(255,255,255,0.1)_0%,rgba(124,58,237,0.13)_47%,rgba(255,255,255,0.06)_100%)] opacity-100",
          )}
        >
          <span className="absolute -left-10 top-0 h-full w-1/2 -skew-x-12 bg-white/18 blur-2xl" />
          <span className="absolute -right-8 -top-10 size-28 rounded-full bg-[#C77DFF]/18 blur-3xl" />
          <span className="absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-white/95 to-transparent" />
        </div>
        <Link
          href="/"
          className="group relative z-10 flex items-center gap-2.5"
          aria-label="SkillBridge home"
        >
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
        </Link>

        <div className="relative z-10 ml-auto flex items-center gap-2">
          <Link
            href="/auth/login"
            className={cn(
              "hidden rounded-full px-3 py-1.5 font-mono text-[11px] font-medium uppercase tracking-[0.12em] transition-colors md:inline-flex",
              open
                ? "text-white/65 hover:text-white"
                : "text-gray-600 hover:text-primary",
            )}
          >
            Sign in
          </Link>
        </div>

        <div className="relative z-10 flex items-center gap-2">
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
          <MenuToggle
            open={open}
            onClick={() => setOpen((value) => !value)}
            buttonRef={menuButtonRef}
            topLineRef={topLineRef}
            bottomLineRef={bottomLineRef}
          />
        </div>
      </motion.div>

      <AnimatePresence>
        {open && <MegaMenu menuRef={menuRef} onNavigate={closeMenu} />}
      </AnimatePresence>
    </header>
  );
}
