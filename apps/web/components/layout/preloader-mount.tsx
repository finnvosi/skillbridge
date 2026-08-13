"use client";

import { useState } from "react";
import { Preloader } from "@/components/layout/preloader";

/**
 * Client mount for the SkillBridge preloader. Holds the `show` flag so the
 * preloader can unmount itself cleanly once its sequence finishes. The
 * preloader overlays everything (z-[100]) and the page renders behind it,
 * so the exit crossfade reveals the hero seamlessly.
 */
export function PreloaderMount() {
  const [show, setShow] = useState(true);
  if (!show) return null;
  return <Preloader onComplete={() => setShow(false)} />;
}
