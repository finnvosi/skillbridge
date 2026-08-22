# SkillBridge Themes

Swappable visual themes for the SkillBridge worker app. Each theme is a complete
visual language (palette, surfaces, typography, icon style, navbar) applied to the
same worker-app structure (Jobs feed + Passport/Profile, four-tab shell).

| Theme | Mood | Anchor | Icon style | Navbar | Mockup |
|---|---|---|---|---|---|
| **Connected Calm** | Calm, relaxed, trustworthy | Soft Purple `#6B5B95` | Thin 1.5px line, no fill | Spotlight underline | `../sketch-mockup/mockup.png` |
| **Market Pulse** (Fiverr-inspired) | Energetic, bold, marketplace | Fiverr Green `#1DBF73` | Solid filled bold | Green active tint | `../sketch-mockup/theme-fiverr.png` |
| **Daylight** | Confident, optimistic, trustworthy | Indigo Violet `#5B3FA0` | Solid filled friendly | Spotlight underline | Figma `CdQ2pSZ5CnZaoGp9MRHWri` |

The canonical authoring spec is `DESIGN.md` (Connected Calm). Tokens live in
`apps/mobile/src/theme.ts`. To apply a theme, swap the token values and icon
components accordingly.

> **Daylight** was designed from scratch after auditing the old app (card soup,
> buried CTAs, crude icons). It is delivered as a real Figma file with three
> captured screens (Welcome, Jobs, Passport). No Mobbin/Fiverr reference needed.
