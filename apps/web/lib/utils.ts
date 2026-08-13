import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Merge Tailwind classes with dedup, so variant props don't duplicate.
export function cn(...inputs: (string | false | null | undefined)[]) {
  return twMerge(clsx(inputs));
}
