#!/usr/bin/env node
// Slice a video into N evenly-spaced frames for scroll-scrubbing.
// Usage: node scripts/extract-frames.mjs <videoPath> [frameCount]
import { execSync } from "node:child_process";
import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";

const video = process.argv[2];
const count = parseInt(process.argv[3] || "60", 10);
if (!video) {
  console.error("usage: node scripts/extract-frames.mjs <videoPath> [frameCount]");
  process.exit(1);
}

const outDir = join(process.cwd(), "apps/web/public/scrub");
rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

// Extract N frames, one per (duration/count) — use fps filter by duration.
const dur = parseFloat(
  execSync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${video}"`).toString().trim()
);
const fps = count / dur;

execSync(
  `ffmpeg -y -i "${video}" -vf "fps=${fps}" -qscale:v 3 "${join(outDir, "frame-%03d.jpg")}"`,
  { stdio: "inherit" }
);

// Walk to collect actual files (ffmpeg may produce slightly more/fewer).
const files = execSync(`ls -1 "${outDir}" | sort`)
  .toString()
  .trim()
  .split("\n")
  .filter((f) => f.endsWith(".jpg"))
  .map((f) => `/scrub/${f}`);

writeFileSync(
  join(outDir, "frames.json"),
  JSON.stringify({ count: files.length, frames: files }, null, 2)
);
console.log(`Extracted ${files.length} frames -> ${outDir}`);
