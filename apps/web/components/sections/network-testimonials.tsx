"use client";

import { Quote } from "lucide-react";
import { cn } from "@/lib/utils";

export interface NetworkTestimonial {
  quote: string;
  name: string;
  role: string;
}

const AVATAR_TONES = [
  "bg-[#E9D8FD] text-[#3C096C]",
  "bg-[#E0F2FE] text-[#075985]",
  "bg-[#FDECC8] text-[#92400E]",
];

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function TestimonialCard({
  testimonial,
  tone,
}: {
  testimonial: NetworkTestimonial;
  tone: string;
}) {
  return (
    <article className="w-[15.5rem] rounded-2xl border border-gray-200 bg-white/92 p-5 shadow-soft backdrop-blur-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-soft-lg">
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-display text-xs font-extrabold",
            tone,
          )}
        >
          {initials(testimonial.name)}
        </span>
        <div className="min-w-0">
          <p className="truncate font-display text-sm font-bold text-gray-900">
            {testimonial.name}
          </p>
          <p className="truncate text-xs text-gray-500">{testimonial.role}</p>
        </div>
      </div>
      <Quote className="mt-5 h-4 w-4 text-primary/35" aria-hidden="true" />
      <blockquote className="mt-2 text-sm leading-relaxed text-gray-700">
        &ldquo;{testimonial.quote}&rdquo;
      </blockquote>
    </article>
  );
}

function NetworkColumn({
  testimonials,
  column,
}: {
  testimonials: NetworkTestimonial[];
  column: number;
}) {
  const shifted = testimonials.map(
    (_, index) => testimonials[(index + column) % testimonials.length],
  );
  const duplicated = [...shifted, ...shifted];

  return (
    <div
      className={cn(
        "network-testimonials-track flex w-[15.5rem] shrink-0 flex-col gap-4",
        column % 2 === 1 && "network-testimonials-track-reverse",
      )}
      style={{ animationDuration: `${34 + column * 5}s` }}
      aria-hidden="true"
    >
      {duplicated.map((testimonial, index) => (
        <TestimonialCard
          key={`${testimonial.name}-${index}`}
          testimonial={testimonial}
          tone={AVATAR_TONES[(index + column) % AVATAR_TONES.length]}
        />
      ))}
    </div>
  );
}

export function NetworkTestimonials({
  testimonials,
}: {
  testimonials: NetworkTestimonial[];
}) {
  return (
    <section
      className="relative overflow-hidden border-b border-gray-200 bg-[#FAF9FF] px-4 py-20 sm:px-6 lg:min-h-[120vh] lg:px-0 lg:py-0"
      aria-labelledby="network-testimonials-heading"
    >
      <div aria-hidden="true" className="glow-purple absolute inset-0 opacity-45" />
      <div aria-hidden="true" className="bg-grain absolute inset-0 opacity-45" />

      <div className="relative mx-auto max-w-7xl lg:px-8 lg:pb-10 lg:pt-24">
        <div className="max-w-2xl">
          <p className="label-mono">Voices / in motion</p>
          <h2
            id="network-testimonials-heading"
            className="display mt-4 max-w-[10ch] text-5xl leading-[0.92] sm:text-6xl"
          >
            From the network.
          </h2>
          <p className="mt-6 max-w-[34ch] text-base leading-relaxed text-gray-600 sm:text-lg">
            The signal is getting through: less résumé theatre, more work that
            people can actually see.
          </p>
          <p className="mt-8 font-mono text-[10px] uppercase tracking-[0.16em] text-primary/75">
            Live signal / always moving
          </p>

          <ul className="sr-only">
            {testimonials.map((testimonial) => (
              <li key={testimonial.name}>
                {testimonial.name}, {testimonial.role}: {testimonial.quote}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="relative mt-12 lg:mt-0">
        <div
          className="network-testimonials-stage relative h-[29rem] overflow-hidden rounded-[1.75rem] border border-gray-200 bg-white/50 shadow-soft lg:h-[88vh] lg:w-screen lg:rounded-none lg:border-x-0"
          aria-label="Continuously moving testimonials"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(123,44,191,0.09),transparent_52%)]" />
          <div
            aria-hidden="true"
            className="absolute left-1/2 top-1/2 flex gap-4 [transform:translateX(-39%)_translateY(-50%)_translateZ(-90px)_rotateX(16deg)_rotateY(-9deg)_rotateZ(4deg)] [transform-style:preserve-3d] sm:gap-5 lg:left-1/2"
          >
            <div className="sm:hidden">
              <NetworkColumn testimonials={testimonials} column={0} />
            </div>
            <div className="hidden sm:block">
              <NetworkColumn testimonials={testimonials} column={0} />
            </div>
            <div className="hidden sm:block">
              <NetworkColumn testimonials={testimonials} column={1} />
            </div>
            <div className="hidden lg:block">
              <NetworkColumn testimonials={testimonials} column={2} />
            </div>
            <div className="hidden xl:block">
              <NetworkColumn testimonials={testimonials} column={3} />
            </div>
          </div>

          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#FAF9FF] via-[#FAF9FF]/80 to-transparent" />
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#FAF9FF] via-[#FAF9FF]/80 to-transparent" />
          <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[#FAF9FF] to-transparent sm:w-24" />
          <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[#FAF9FF] to-transparent sm:w-24" />
        </div>
      </div>
    </section>
  );
}
