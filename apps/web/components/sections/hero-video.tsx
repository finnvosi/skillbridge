"use client";

import { useEffect, useRef } from "react";

/**
 * Hero background video. Muted/loop/playsInline for autoplay policies.
 * We also call play() on mount because some browsers won't honor the
 * autoPlay attribute until a play() is explicitly invoked. A poster keeps
 * the frame meaningful before playback starts.
 */
export function HeroVideo() {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const tryPlay = () => v.play().catch(() => {});
    tryPlay();
    // Re-attempt once metadata is ready (covers slow decode)
    v.addEventListener("loadeddata", tryPlay, { once: true });
    return () => v.removeEventListener("loadeddata", tryPlay);
  }, []);

  return (
    <video
      ref={ref}
      className="absolute inset-0 -z-20 h-full w-full object-cover opacity-70"
      src="/scrub/hero.mp4"
      poster="/scrub/object-01.png"
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      aria-hidden
    />
  );
}
