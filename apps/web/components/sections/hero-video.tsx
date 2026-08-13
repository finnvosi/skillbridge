"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

/**
 * Hero video — starts as a small rounded tile pinned to the bottom-right
 * corner. Once the scroll-scrub section (#scrub-section) reaches the top of
 * the viewport, this tile unmounts and the scrub section's video (same
 * layoutId "hero-scrub-video") animates in from the tile's position and grows
 * to fullscreen — a shared-element morph. Scrolling back up remounts the tile
 * and morphs it home.
 */
export function HeroVideo() {
  const ref = useRef<HTMLVideoElement>(null);
  const [active, setActive] = useState(true);

  useEffect(() => {
    const v = ref.current;
    if (v) {
      const tryPlay = () => v.play().catch(() => {});
      tryPlay();
      v.addEventListener("loadeddata", tryPlay, { once: true });
    }

    // Deterministic: unmount the corner tile as soon as the scrub section's
    // top passes the top of the viewport (so the scrub video can take over
    // via the shared layoutId). Re-mounts when you scroll back up.
    let ticking = false;
    const update = () => {
      ticking = false;
      const target = document.getElementById("scrub-section");
      if (!target) return;
      const top = target.getBoundingClientRect().top;
      setActive(top > 0);
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  if (!active) return null;

  return (
    <motion.div
      layoutId="hero-scrub-video"
      className="fixed bottom-5 right-5 z-30 h-36 w-56 overflow-hidden rounded-2xl border border-white/40 shadow-soft-lg sm:h-44 sm:w-72"
    >
      <video
        ref={ref}
        className="absolute inset-0 h-full w-full object-cover"
        src="/scrub/hero.mp4"
        poster="/scrub/object-01.png"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
      <span className="pointer-events-none absolute bottom-2 left-2.5 font-mono text-[10px] uppercase tracking-[0.14em] text-white/90">
        scroll to expand ▸
      </span>
    </motion.div>
  );
}
