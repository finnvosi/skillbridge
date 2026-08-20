"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, MapPin, ArrowUpRight } from "lucide-react";
import { useCallback, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface OpportunityPreview {
  title: string;
  company: string;
  loc: string;
  type: string;
  skill: string;
}

const TYPE_ART: Record<string, { panel: string; ink: string; index: string }> = {
  Internship: {
    panel: "from-[#EEE8F7] via-white to-[#E0F2FE]",
    ink: "text-[#3C096C]",
    index: "01",
  },
  "Part-time": {
    panel: "from-[#E7F5F6] via-white to-[#EEF0FA]",
    ink: "text-[#075985]",
    index: "02",
  },
  "Full-time": {
    panel: "from-[#FFF1E8] via-white to-[#F5EEFF]",
    ink: "text-[#7C2D12]",
    index: "03",
  },
};

function cyclicOffset(index: number, active: number, total: number): number {
  const offset = index - active;
  if (offset > total / 2) return offset - total;
  if (offset < -total / 2) return offset + total;
  return offset;
}

export function OpportunityCoverflow({
  opportunities,
}: {
  opportunities: OpportunityPreview[];
}) {
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState(0);
  const total = opportunities.length;

  const move = useCallback(
    (direction: 1 | -1) => {
      setActive((current) => (current + direction + total) % total);
    },
    [total]
  );

  if (total === 0) return null;

  return (
    <section
      role="region"
      aria-roledescription="carousel"
      aria-label="Open opportunities"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          move(-1);
        }
        if (event.key === "ArrowRight") {
          event.preventDefault();
          move(1);
        }
      }}
      className="group/flow relative mt-8 outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4"
    >
      <p className="sr-only" aria-live="polite">
        Showing {active + 1} of {total}: {opportunities[active].title}
      </p>

      <div className="relative h-[80vh] overflow-hidden [perspective:1200px]">
        <div className="absolute inset-x-0 top-[55%] h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        {opportunities.map((opportunity, index) => {
          const offset = cyclicOffset(index, active, total);
          const isActive = offset === 0;
          const art = TYPE_ART[opportunity.type] ?? TYPE_ART.Internship;

          return (
            <motion.article
              key={opportunity.title}
              aria-hidden={!isActive}
              initial={false}
              animate={{
                x: reduceMotion ? 0 : offset * 188,
                z: reduceMotion ? 0 : isActive ? 50 : -90,
                rotateY: reduceMotion ? 0 : offset * -22,
                scale: isActive ? 1 : 0.82,
                opacity: isActive ? 1 : 0.52,
              }}
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : { type: "spring", stiffness: 240, damping: 26, mass: 0.72 }
              }
              className={cn(
                "absolute left-1/2 top-5 w-[min(78vw,23rem)] -translate-x-1/2 [transform-style:preserve-3d]",
                isActive ? "z-20" : "z-10 cursor-pointer"
              )}
              onClick={() => !isActive && setActive(index)}
              onDragEnd={(_, info) => {
                if (Math.abs(info.offset.x) > 42) move(info.offset.x > 0 ? -1 : 1);
              }}
              drag={!reduceMotion && isActive ? "x" : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.14}
            >
              <div
                className={cn(
                  "relative min-h-[62vh] overflow-hidden rounded-[1.65rem] border p-6 shadow-soft transition-shadow sm:min-h-[66vh] sm:p-7",
                  isActive
                    ? "border-primary/20 bg-white shadow-soft-lg"
                    : "border-gray-200/90 bg-white/85"
                )}
              >
                <div className={cn("absolute inset-x-0 top-0 h-28 bg-gradient-to-br", art.panel)} />
                <div className="bg-grain pointer-events-none absolute inset-x-0 top-0 h-28 opacity-[0.25]" />
                <div className="pointer-events-none absolute right-0 top-0 h-28 w-28 rounded-bl-[5rem] bg-white/55 blur-xl" />

                <div className="relative flex items-start justify-between gap-4">
                  <Badge variant="outline" className="border-white/90 bg-white/70 text-gray-700 backdrop-blur-sm">
                    {opportunity.type}
                  </Badge>
                  <span className={cn("font-mono text-xs tracking-[0.22em]", art.ink)}>
                    {art.index} / 03
                  </span>
                </div>

                <div className="relative mt-14">
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-gray-400">
                    Open role
                  </p>
                  <h3 className="mt-2 font-display text-2xl font-bold leading-[1.02] tracking-tight text-gray-900 sm:text-3xl">
                    {opportunity.title}
                  </h3>
                  <p className="mt-2 text-sm text-gray-600">{opportunity.company}</p>
                </div>

                <div className="relative mt-7 flex items-center justify-between gap-3 border-t border-gray-100 pt-4 text-xs text-gray-500">
                  <span className="flex min-w-0 items-center gap-1.5 truncate">
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
                    {opportunity.loc}
                  </span>
                  <span className="rounded-full bg-primary/8 px-2.5 py-1 font-medium text-primary">
                    {opportunity.skill}
                  </span>
                </div>

                {isActive && (
                  <Link
                    href="/auth/register"
                    aria-label="Explore this opportunity"
                    className="relative mt-4 flex w-full items-center justify-between rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  >
                    Explore this opportunity
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                )}
              </div>
            </motion.article>
          );
        })}
      </div>

      <div className="mt-3 flex flex-col gap-3 sm:mt-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex shrink-0 items-center gap-1" aria-label="Carousel position">
            {opportunities.map((opportunity, index) => (
              <button
                key={opportunity.title}
                type="button"
                aria-label={`Show ${opportunity.title}`}
                aria-current={index === active ? "true" : undefined}
                onClick={() => setActive(index)}
                className={cn(
                  "h-2 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                  index === active ? "w-7 bg-primary" : "w-2 bg-gray-300 hover:bg-gray-400"
                )}
              />
            ))}
          </div>
          <span className="min-w-0 flex-1 truncate px-2 text-center font-mono text-xs text-gray-500">
            {opportunities[active].title} · {String(active + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </span>
          <div className="flex shrink-0 gap-1 rounded-full border border-gray-200 bg-white p-1 shadow-sm">
            <button
              type="button"
              aria-label="Previous opportunity"
              onClick={() => move(-1)}
              className="flex h-11 w-11 items-center justify-center rounded-full text-gray-700 transition hover:bg-gray-100 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Next opportunity"
              onClick={() => move(1)}
              className="flex h-11 w-11 items-center justify-center rounded-full text-gray-700 transition hover:bg-gray-100 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
