"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useReducedMotion,
} from "framer-motion";

/**
 * Custom agency cursor:
 *  - a tiny precise dot that tracks the pointer 1:1
 *  - a larger ring that trails with spring lag
 *  - on hover over interactive elements the ring MAGNETICALLY eases toward the
 *    element's center and expands (the "pull" toward CTAs), while the dot hides
 *  - mix-blend-difference so it reads on both light and dark sections
 *
 * Disabled on touch devices and when prefers-reduced-motion is set.
 */
export function CustomCursor() {
  const reduce = useReducedMotion();
  const [enabled, setEnabled] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [visible, setVisible] = useState(false);

  // Dot = exact pointer; ring = spring-lagged toward a target we steer
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const targetX = useMotionValue(-100);
  const targetY = useMotionValue(-100);
  const ringX = useSpring(targetX, { stiffness: 260, damping: 26, mass: 0.5 });
  const ringY = useSpring(targetY, { stiffness: 260, damping: 26, mass: 0.5 });

  useEffect(() => {
    if (reduce) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    setEnabled(true);
    document.documentElement.classList.add("has-custom-cursor");

    const hoveringRef = { current: false };

    const move = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      // While not hovering, the ring target follows the pointer
      if (!hoveringRef.current) {
        targetX.set(e.clientX);
        targetY.set(e.clientY);
      }
      if (!visible) setVisible(true);
    };
    const over = (e: Event) => {
      const t = e.target as HTMLElement | null;
      const el = t?.closest(
        "a, button, input, textarea, select, [data-cursor='hover'], [data-cursor-magnetic]",
      ) as HTMLElement | null;
      if (!el) return;
      setHovering(true);
      hoveringRef.current = true;
      const r = el.getBoundingClientRect();
      // Magnetic pull: ring eases to the element's center
      targetX.set(r.left + r.width / 2);
      targetY.set(r.top + r.height / 2);
    };
    const out = (e: Event) => {
      const t = e.target as HTMLElement | null;
      if (t?.closest("a, button, input, textarea, select, [data-cursor='hover'], [data-cursor-magnetic]")) {
        setHovering(false);
        hoveringRef.current = false;
        // Snap target back to the live pointer position
        targetX.set(x.get());
        targetY.set(y.get());
      }
    };
    const leave = () => setVisible(false);

    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerover", over);
    document.addEventListener("pointerout", out);
    document.addEventListener("pointerleave", leave);

    return () => {
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerover", over);
      document.removeEventListener("pointerout", out);
      document.removeEventListener("pointerleave", leave);
      document.documentElement.classList.remove("has-custom-cursor");
    };
  }, [reduce, x, y, targetX, targetY, visible]);

  if (!enabled) return null;

  return (
    <>
      {/* Trailing ring — magnetically pulled toward hovered CTAs */}
      <motion.div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[100] mix-blend-difference"
        style={{ x: ringX, y: ringY, translateX: "-50%", translateY: "-50%" }}
      >
        <motion.div
          className="rounded-full border border-white"
          animate={{
            width: hovering ? 64 : 34,
            height: hovering ? 64 : 34,
            opacity: visible ? 1 : 0,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 24 }}
        />
      </motion.div>

      {/* Precise dot — only when not hovering */}
      <motion.div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[100] mix-blend-difference"
        style={{ x, y, translateX: "-50%", translateY: "-50%" }}
      >
        <motion.div
          className="rounded-full bg-white"
          animate={{
            width: hovering ? 0 : 7,
            height: hovering ? 0 : 7,
            opacity: visible ? 1 : 0,
          }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      </motion.div>
    </>
  );
}
