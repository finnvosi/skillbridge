"use client";

import { useLayoutEffect } from "react";

/**
 * The landing page is intentionally a fresh top-of-page experience. Disable
 * browser scroll restoration and apply the position twice so a reload cannot
 * restore a stale scroll offset after hydration.
 */
export function ScrollToTopOnLoad() {
  useLayoutEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    const frame = window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  return null;
}
