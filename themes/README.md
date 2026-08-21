# SkillBridge Themes

Swappable visual themes for the SkillBridge worker app. Each theme is a complete
visual language (palette, surfaces, typography, icon style, navbar) applied to the
same worker-app structure (Jobs feed + Passport/Profile, four-tab shell).

| Theme | Mood | Anchor | Icon style | Navbar | Mockup |
|---|---|---|---|---|---|
| **Connected Calm** | Calm, relaxed, trustworthy | Soft Purple `#6B5B95` | Thin 1.5px line, no fill | Spotlight underline | `../sketch-mockup/mockup.png` |
| **Market Pulse** (Fiverr-inspired) | Energetic, bold, marketplace | Fiverr Green `#1DBF73` | Solid filled bold | Green active tint | `../sketch-mockup/theme-fiverr.png` |

The canonical authoring spec is `DESIGN.md` (Connected Calm). Tokens live in
`apps/mobile/src/theme.ts`. To apply a theme, swap the token values and icon
components accordingly.

> **Market Pulse** was designed from Fiverr's documented iOS design language
> (vivid green, near-black ink, white surfaces, capsule buttons, bold heavy
> type, solid filled icons). The exact Mobbin reference screens could not be
> scraped (paywalled); if you have a screenshot, fidelity can be refined.
