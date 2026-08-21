---
version: alpha
name: SkillBridge — Connected Calm
description: >-
  A calm, trustworthy worker app for Cambodia. Soft purple (connected to the
  SkillBridge brand) replaces the old industrial navy so workers feel relaxed,
  not pressured. A single warm gold carries the one happy "apply" moment;
  verified green is reserved for confirmed states only; risk red appears only for
  danger. Surfaces are minimal and flat with hairline borders; icons are geometric,
  thin-stroke line glyphs; the active nav tab is spotlighted with a thin underline.
colors:
  primary: "#6B5B95"        # Soft Purple — trust anchor, nav, headers, active states
  ink: "#33304A"            # Ink — primary text on light surfaces (purple-tinted, warm)
  secondary: "#6B6780"      # Muted — secondary text, meta
  tertiary: "#9A95AB"       # Pale — tertiary text, inactive nav labels
  accent: "#E0A526"         # Happy Gold — the SINGLE apply moment; nothing else
  neutral: "#F1EEF7"        # Airy Lilac Canvas — app background (soft, not gray)
  surface: "#FFFFFF"        # Paper — cards, sheets, fields
  surfaceMuted: "#EFEBF5"   # Inset surface — fact rows, chips, dividers
  border: "#E0DAEA"         # Hairline border
  success: "#2BA372"        # Verified Green (calm sage) — verified / confirmed ONLY
  successSoft: "#E3F5EC"
  warning: "#E0A526"        # Reuses gold warm — warning surface uses amber text below
  warningInk: "#3A2E07"
  warningSoft: "#FBEFCF"
  danger: "#D23B2E"         # Risk Red — destructive / scam-risk states ONLY
  dangerSoft: "#F9E4E1"
typography:
  display:
    fontFamily: Urbanist
    fontSize: 2rem
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  h1:
    fontFamily: Urbanist
    fontSize: 1.5rem
    fontWeight: 700
    lineHeight: 1.18
    letterSpacing: "-0.015em"
  h2:
    fontFamily: Urbanist
    fontSize: 1.3125rem
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0em"
  h3:
    fontFamily: Urbanist
    fontSize: 1.125rem
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "0em"
  body-md:
    fontFamily: Jost
    fontSize: 1rem
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0em"
  body-sm:
    fontFamily: Jost
    fontSize: 0.8125rem
    fontWeight: 400
    lineHeight: 1.45
    letterSpacing: "0em"
  label:
    fontFamily: Jost
    fontSize: 0.6875rem
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0.12em"
rounded:
  sm: 12px
  md: 16px
  lg: 20px
  pill: 999px
spacing:
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 24px
  xxl: 32px
  xxxl: 48px
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "#3A2A05"
    typography: "{typography.body-md}"
    rounded: "{rounded.sm}"
    height: 48px
    padding: 16px
  button-primary-pressed:
    backgroundColor: "{colors.warningInk}"
    textColor: "#FFFFFF"
    typography: "{typography.body-md}"
    rounded: "{rounded.sm}"
    height: 48px
    padding: 16px
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.sm}"
    height: 48px
    padding: 16px
  button-ghost:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.primary}"
    typography: "{typography.body-md}"
    rounded: "{rounded.sm}"
    height: 48px
    padding: 16px
  button-danger:
    backgroundColor: "{colors.danger}"
    textColor: "#FFFFFF"
    typography: "{typography.body-md}"
    rounded: "{rounded.sm}"
    height: 48px
    padding: 16px
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: 16px
  card-elevated:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: 16px
  chip-active:
    backgroundColor: "{colors.primary}"
    textColor: "#FFFFFF"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    height: 40px
    padding: 12px
  status-pill-warning:
    backgroundColor: "{colors.warningSoft}"
    textColor: "{colors.warningInk}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: 8px
  chip:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.secondary}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    height: 40px
    padding: 12px
  status-pill-success:
    backgroundColor: "{colors.successSoft}"
    textColor: "#1F7E54"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: 8px
  status-pill-danger:
    backgroundColor: "{colors.dangerSoft}"
    textColor: "#B5322A"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: 8px
  tabbar:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.secondary}"
    rounded: 0px
    height: 76px
    padding: 12px
  tabbar-active:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.primary}"
    rounded: 0px
    height: 76px
    padding: 12px
---

# Overview

SkillBridge is an employment platform for Cambodia. Its job is not to be
delightful in the loyalty-stamp sense — its job is to be **trusted and calm**.
Workers browse verified jobs, carry a Career Passport of proven skills, track
real application status, and report scams without fear.

This language is **original** and was developed by studying the *discipline* of
minimalist consumer apps (strict grid, high-contrast typography, flat geometric
icons, generous whitespace, card-based composition) — then rejecting their
goals. Where those apps gamify repeat purchases, SkillBridge turns the same rigor
toward **verification, honesty, and safety**. Progress is expressed as *trust
gained*, not *coffee earned*: passport readiness, an application tracker that
actually moves, and "what we checked / what we cannot guarantee" copy.

The visual anchor is **Soft Purple** — calm, connected to the SkillBridge
brand, and psychologically lower-arousal than navy (which reads as corporate
pressure). A single warm signal, **Happy Gold**, carries the one happy moment:
tapping *Apply with Passport*. **Verified Green** (a calm sage) appears *only*
where something was actually confirmed. **Risk Red** appears *only* for
destructive or scam-risk states. Status is never carried by color alone: every
pill and badge pairs an icon with a label.

# Colors

- **Primary — Soft Purple (#6B5B95):** The anchor. Navigation, headers, active
  tab, selected filters, progress bars. Connected to the SkillBridge brand
  purple — calm, not stressful.
- **Ink (#33304A):** Primary text on light surfaces. Purple-tinted dark, not pure
  black — keeps the warm, relaxed temperature.
- **Accent — Happy Gold (#E0A526):** The *only* warm signal. Reserved exclusively
  for the primary "Apply" action. If gold appears anywhere else, it dilutes the
  one happy moment.
- **Neutral — Airy Lilac Canvas (#F1EEF7):** App background. A soft, faintly
  purple off-white — airy, not gray, not beige.
- **Success — Verified Green (#2BA372):** Calm sage, verified / confirmed states
  only. Never decorative.
- **Danger — Risk Red (#D23B2E):** Destructive actions and scam-risk states only.

# Typography

- **Urbanist** for display and headings — geometric, confident, with gentle
  negative tracking on large sizes for an editorial, calm feel.
- **Jost** for body and labels — humanist, neutral, highly legible. Khmer UI uses
  Noto Sans Khmer (covers Khmer + Latin glyphs) via the same weight scale;
  English swaps the family only.
- **Label** is uppercase with `0.12em` tracking — the small, structured captions
  that give the layout its Swiss rhythm. Never used for long copy.

# Layout

- **Grid:** 8pt spacing system. Content max-width follows the device; on mobile,
  full-bleed headers with 16px inset content.
- **Worker model:** Welcome (language gate) → four-tab shell (Jobs, Applications,
  Passport, Help) → stacks for Job Detail, Apply Review, Report. Four tabs, not
  five — restraint over feature spray.
- **Card archetypes:** *Monitor* (job list, application tracker), *Operate* (apply
  review, report form), *Inspect* (job detail, passport), *Compare* (filter
  chips). One surface archetype per screen; do not mix.
- **Whitespace:** Generous. Empty states are onboarding, not errors — they
  explain what belongs, why it is empty, and the next step.
- **Composition:** Editorial hierarchy via scale and weight, not boxes. Not every
  element needs a card border; dividers, type, and alignment carry relationships.

# Elevation & Depth

Borders before shadows. Cards are **flat minimal surfaces**: white on the lilac
canvas with a 1px hairline border and a whisper-soft single-direction shadow
(low opacity). No neumorphism, no heavy dual shadows, no glass. Depth must feel
clean and structural, not puffy.

# Shapes

- Fields and inputs: 12px (sm).
- Cards and sheets: 16px (md).
- Large containers: 20px (lg).
- Chips and pills: full pill (999px) — used only for compact filters and status,
  never for primary actions.
- Sharp 90° corners are allowed for tab bars and full-bleed structural elements.

# Icons

- **Geometric, thin-stroke, line-only.** Every icon is a precise geometric form
  (circle, square, triangle, hexagon) drawn with a uniform **1.5px stroke**,
  round line caps and joins. **No fills.** Inactive icons use a light lavender
  stroke (#B7AFCB); the active icon uses the primary purple stroke.
- **Spotlight navbar:** the active tab is indicated by a **thin purple underline**
  beneath the icon+label — not a filled pill, not a colored chip. This keeps the
  bar calm and minimal while making "where am I" instantly clear.
- Icons must remain recognizable at 20–24px. Favor simple, universal metaphors
  (briefcase, document, shield, house). Avoid decorative flourishes.

# Components

- `button-primary` is the single high-emphasis action — and it is **gold**, not
  purple. Full-width on mobile, 48px tall, dark text on gold. This is the one
  happy moment in the app.
- `button-secondary` (bordered paper) and `button-ghost` (canvas, purple text)
  are lower-emphasis. `button-danger` is red and used exclusively for destructive
  or report flows.
- `chip` / `chip-active`: horizontal filter pills. Active = solid purple fill.
- `status-pill-*`: icon + label, never color alone. Success/warning/danger tones
  map to verified / caution / risk semantics.
- `tabbar` / `tabbar-active`: fixed bottom nav, paper surface, thin-stroke line
  icons, active tab gets a purple underline (spotlight).

# Do's and Don'ts

**Do**
- Lead with verification and honesty copy ("what we checked", "what we cannot
  guarantee").
- Keep the palette calm: purple anchor, gold only for apply, sage for verified,
  red only for risk.
- Use geometric thin-stroke line icons with a spotlight underline for active nav.
- Pair every status with an icon and a label.
- Use the 8pt grid and generous whitespace; let type create hierarchy.
- Keep Khmer-first; swap the font family, never the structure.

**Don't**
- Don't gamify trust (no stamps, no streaks, no fake rewards).
- Don't use navy or high-contrast corporate palettes — they read as pressure.
- Don't make gold decorative; if it's on more than the apply action, pull it back.
- Don't use filled, heavy, or neumorphic icons — keep them thin geometric lines.
- Don't hide actions behind ambiguous icons; label the primary action in words.
- Don't add blur, glass, or heavy shadows where a flat minimal surface is clearer.
