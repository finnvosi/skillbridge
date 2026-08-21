# Theme: Connected Calm

**Status:** Saved / locked. The canonical SkillBridge worker-app theme.
**Authoring spec:** `DESIGN.md` (Google design.md format, 0 lint errors).
**Tokens:** `apps/mobile/src/theme.ts`.
**Mockup:** `sketch-mockup/index.html` + `sketch-mockup/mockup.png`.

## Palette
| Token | Hex | Role |
|---|---|---|
| Soft Purple | `#6B5B95` | Anchor — nav, headers, active states, progress |
| Ink | `#33304A` | Primary text (purple-tinted, warm) |
| Muted | `#6B6780` | Secondary text |
| Pale | `#9A95AB` | Tertiary / inactive nav labels |
| Happy Gold | `#E0A526` | **The single "Apply" moment only** — nothing else |
| Airy Lilac Canvas | `#F1EEF7` | App background |
| Paper | `#FFFFFF` | Cards, sheets, fields |
| Inset | `#EFEBF5` | Fact rows, chips, dividers |
| Border | `#E0DAEA` | Hairline |
| Verified Green (sage) | `#2BA372` | Verified / confirmed ONLY |
| Risk Red | `#D23B2E` | Destructive / scam-risk ONLY |

## Visual Language
- **Mood:** calm, relaxed, low-pressure, trustworthy. No dark walls, no stress.
- **Surfaces:** minimal + flat. White cards on lilac canvas, 1px hairline border, whisper-soft single-direction shadow (low opacity). No neumorphism, no glass.
- **Typography:** Urbanist (display/headings) + Jost (body/labels). Khmer → Noto Sans Khmer. Generous tracking on uppercase labels (0.12em).
- **Icons:** **geometric, thin-stroke (1.5px), line-only, no fills.** Round caps/joins. Inactive = light lavender stroke; active = purple stroke.
- **Navbar:** **spotlight** style — active tab gets a thin purple underline beneath icon+label (not a filled pill). Calm and minimal.
- **Primary action:** gold capsule button, dark text, reserved exclusively for "Apply with Passport."

## When to use
Default worker-app theme. Best when the goal is calm trust + low digital-literacy friendliness for Cambodian workers.

## Contrast / a11y notes
- Status-pill-success text `#1F7E54` on `#E3F5EC`, status-pill-danger `#B5322A` on `#F9E4E1` — both pass WCAG AA.
- Inactive tab label uses Muted `#6B6780` (not Pale) for AA contrast.
