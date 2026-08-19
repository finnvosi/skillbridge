# SkillBridge Website — UX/Product Improvement Plan

**Prepared by:** Miro (UI/UX, SkillBridge)
**Audience:** Atlas (eng lead) → Developer (implementation)
**Scope:** Public marketing site (`apps/web/app/page.tsx` + `components/sections/*`,
`components/layout/navbar.tsx`) and the auth surface (`/auth/*`).
Read-only review of the running site on :3000. No app/API behavior changes.

---

## 0. INCIDENT (already resolved by Miro)
- The dev server (PID 44074) was wedged: pegged at ~146% CPU / 976 MB, returning
  HTTP 000 for ALL routes including `/`. Triggered during an on-demand compile of
  `/auth/login`. Not a route bug — a one-time Turbopack hang.
- Miro killed the wedged server, cleared `.next/cache`, and restarted `pnpm dev`.
  All routes now return 200 (`/`, `/auth/login`, `/auth/register`, `/auth/forgot-password`).
- **Action for Atlas:** add a guard so a single bad compile can't wedge the whole
  server (or move to a supervised dev process). Also note `next.config.ts` warns
  that the `middleware` convention is deprecated → migrate to `proxy`.

---

## 1. WHAT'S WORKING (keep)
- Visual DNA is excellent and on-brand: purple/indigo `#3C096C`+`#7C3AED`, sky `#38BDF8`,
  titanium `#F3F3F1`, Urbanist display + Jost body, glass + grain + soft gradients.
- Hero ("Make your work visible") — strong hierarchy, WebGL proof object reads clearly,
  stat row is scannable.
- Navbar — transparent-over-hero, hides on scroll-down, full Escape/outside-click
  accessible mega-menu, focus management. This is the REFERENCE implementation;
  the dashboard kebab menu must be brought up to this standard, not the reverse.
- Sticky-step "how it works" scroll-scrub is distinctive and has a proper
  reduced-motion fallback (`StaticSteps`).
- Footer contrast is good.

## 2. MUST FIX (defects / clarity)

### M1 — Low-contrast body copy in the "Ability is everywhere" section
`components/sections/gap-scroll-story.tsx:111`
`text-[#6E6A85]` on white for the paragraph is too faint (fails WCAG AA for body text).
The intro subsection labels at line 115 (`text-[#6E6A85]`) are even fainter.
- Change body to `text-[#4A4760]` (or `#3A374F`) and keep labels at a minimum of `#5B5872`.
- Verify contrast ≥ 4.5:1 for body, ≥ 3:1 for large/labels.

### M2 — Copy not audience-appropriate
- `sticky-steps.tsx:117` & `app/page.tsx:155`: title **"Four steps. No theatre."**
  "No theatre" reads as internal jargon on a Cambodia-first public site. Rename to
  something concrete, e.g. **"Four steps. One record."** or **"From work to offer."**
- Keep the rest of the copy; it's strong.

### M3 — "Proof isn't a PDF" section: empty space + tiny trailing label
`components/sections/proof-webgl.tsx` (the "Captured" microcopy sits low with a long
vertical void above it). Balance the vertical rhythm: either lift the caption or add a
supporting micro-visual. Low priority but reads as "unfinished" to a first-time visitor.

## 3. SHOULD FIX (polish / conversion)

### S1 — Opportunity carousel is the primary conversion surface — verify & harden
`components/sections/opportunity-coverflow.tsx` (used on `/`). It's a 3-item coverflow
("Showing 1 of 3"). Requirements:
- Carousel position dots/arrows MUST be keyboard-operable (focusable, ArrowLeft/Right,
  aria-label per slide). Confirm at build.
- On mobile, ensure the non-active cards don't overflow horizontally or trap the scroll.
- Each card needs a clear primary CTA ("Explore this opportunity" → `/dashboard/student/discover`
  or the project detail). Confirm the CTA is obvious, not just the whole card being clickable.
- If only 3 seeded opportunities exist, add a "Browse all opportunities" entry card or
  ensure "BROWSE ALL →" routes somewhere real (currently `/` anchor? verify target).

### S2 — Don't show the proof video to logged-out / anon users without intent
`components/sections/proof-webgl.tsx` runs a heavy WebGL canvas for every visitor.
For anon users this is CPU cost with low payoff (they can't act on it). Gate the heavy
animation behind `useAuth()` — anon gets a static poster/loop; authed gets the live canvas.
(This also reduces the chance of the kind of compile/hang we just hit.)

### S3 — Mega-menu utility links are easy to miss on mobile
Navbar `UTILITY_LINKS` ("Sign in", "Create your profile") only render in the desktop header
(`navbar.tsx:410-421`, `hidden md:inline-flex`). On mobile they live inside the mega-menu
bottom row — fine, but confirm they're prominent and not below the fold on small screens.

### S4 — Footer CTA flatness
The bottom "Bridge the gap. Today." CTA button is plain white while upper CTAs are purple.
Either give it the primary treatment or intentionally make it a quiet secondary — decide,
don't leave it looking like a styling miss.

## 4. EDGE CASES
- E1. Reduced-motion users: confirm `gap-scroll-story` and `sticky-steps` both fall back to
  static, no scroll-jank. They do today — keep that contract in any edit.
- E2. Khmer/mononym names: not on the public site, but the dashboard `initials()` bug
  (`team/page.tsx:31`) will show for any team member — out of scope here but flag to Atlas.
- E3. Very narrow viewport (<360px): stat row + hero headline wrap behavior — confirm no
  horizontal scroll.
- E4. CSP: `middleware.ts` blocks `form-action` to `'self'` only. The auth forms POST to
  `/api/v1/*` (same-origin rewrite) so they're fine — but any future third-party form action
  will be silently blocked. Document this.
- E5. The dev server hang (§0) — treat as a real infra edge case; a supervised/restart-on-hang
  dev process should exist before the next person navigates `/auth/*`.

## 5. OUT OF SCOPE (this tranche)
- App dashboard, withdrawal flow, notifications, team permissions — separate hardening doc.
- CMS / copy pipeline.
- i18n (Khmer locale) — noted as a future need given the Cambodia-first audience.
- Visual redesign of the dashboard chrome.

---

## File map (exact paths)
- `apps/web/app/page.tsx` — landing composition (hero, sections, footer)
- `apps/web/components/layout/navbar.tsx` — top nav + mega-menu (reference a11y)
- `apps/web/components/sections/gap-scroll-story.tsx` — "Ability is everywhere" (M1 fix)
- `apps/web/components/sections/sticky-steps.tsx` — "how it works" (M2 copy)
- `apps/web/components/sections/proof-webgl.tsx` — proof video (M3, S2)
- `apps/web/components/sections/opportunity-coverflow.tsx` — opportunity carousel (S1)
- `apps/web/components/sections/hero.tsx` / `hero-object.tsx` — hero (keep)
- `apps/web/app/auth/login/page.tsx` + `components/auth/login-form.tsx` — auth (verify 200, OK)
- `apps/web/next.config.ts` — middleware→proxy migration note (Atlas)
- `apps/web/middleware.ts` — security headers (keep, note CSP E4)
