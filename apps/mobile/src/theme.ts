// SkillBridge Worker App — Connected Calm design tokens.
//
// These tokens implement the final Miro handoff palette for the worker vertical
// slice: calm Soft Purple anchor, Happy Gold reserved for the single apply action,
// calm sage Verified Green, and an Airy Lilac Canvas. Minimal flat surfaces with
// hairline borders. Geometric thin-stroke line icons + spotlight underline nav.
// They intentionally OVERRIDE the shared @skillbridge/ui tokens so the worker
// experience uses the agreed calm look without changing the shared package.
//
// TYPOGRAPHY:
//   Khmer   -> Noto Sans Khmer (single family, covers Khmer + Latin glyphs)
//   English -> Urbanist (UI, body, and headings — one family, no pairing)
// AppText applies the correct family per active locale (see fontFamilyFor).
import { Platform } from 'react-native';
import { FONT } from './theme_fonts';
import { Locale } from './types';

export const colors = {
  // Connected Calm surfaces
  background: '#F1EEF7', // Airy Lilac Canvas
  surface: '#FFFFFF', // Paper (cards, forms)
  surfaceMuted: '#EFEBF5', // subtle inset surface
  border: '#E0DAEA', // Border

  // Text
  ink: '#33304A', // Ink (primary text, purple-tinted)
  muted: '#6B6780', // Muted (secondary text)
  mutedLight: '#9A95AB', // tertiary text / inactive nav labels

  // Brand / action
  primary: '#6B5B95', // Soft Purple (anchor, nav, active states)
  primarySoft: '#EFEBF5', // soft purple fill for selections
  accent: '#E0A526', // Happy Gold (the single apply moment)
  accentSoft: '#FBEFCF', // soft gold fill

  // Semantic
  success: '#2BA372', // Verified Green (calm sage, confirmed ONLY)
  successSoft: '#E3F5EC',
  warning: '#E0A526', // Safety Amber (reuses gold warm)
  warningInk: '#3A2E07', // dark text on amber
  warningSoft: '#FBEFCF',
  danger: '#D23B2E', // Risk Red (destructive / scam-risk ONLY)
  dangerSoft: '#F9E4E1',

  // Demo / neutral
  demo: '#6B6780',
  demoSoft: '#EFEBF5',
  white: '#FFFFFF',
} as const;

export const typography = {
  // Khmer is the default UI font. Noto Sans Khmer covers both Khmer + Latin.
  // English uses Urbanist for everything (UI, body, and headings) — a single
  // family, no serif pairing. Native needs a single family per weight, so each
  // mapping resolves to one registered face.
  fontFamily: {
    regular: FONT.khmer.regular,
    medium: FONT.khmer.medium,
    semibold: FONT.khmer.semibold,
    bold: FONT.khmer.bold,
  },
  // Returns the correct font family for a given locale + weight.
  // Khmer always uses Noto Sans Khmer. English always uses Urbanist. The
  // 'display' weight falls back to the same family (Urbanist has no separate
  // display face) so headings stay consistent with body text.
  fontFamilyFor(locale: Locale, weight: 'regular' | 'medium' | 'semibold' | 'bold' = 'regular'): string {
    if (locale === 'km') return FONT.khmer[weight];
    return FONT.urbanist[weight];
  },
  size: {
    xs: 11, // small labels, badges
    sm: 13, // secondary text
    base: 15, // body
    md: 17, // body large / Khmer readability
    lg: 20,
    xl: 24, // important salary
    xxl: 28,
    display: 32,
  },
  weight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.45,
    relaxed: 1.6,
  },
} as const;

// 4pt-grid-aligned spacing (8/12/16/24/32/48).
export const spacing = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

// One radius system: 12px fields, 16px cards, pill only for compact filters.
export const radius = {
  sm: 12, // fields / inputs
  md: 16, // cards
  lg: 20,
  pill: 999,
  full: 9999,
} as const;

// Borders before shadows. Shadows are subtle and used sparingly, but cards
// now carry a defined elevation so the surface reads as a real object rather
// than a flat outline (the previous flat look was the main "cheap" signal).
export const shadow = {
  none: {},
  sm: {
    shadowColor: '#6B5B95',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  md: {
    shadowColor: '#6B5B95',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  // Card elevation: a confident, soft lift that still feels clean/minimal.
  lg: {
    shadowColor: '#6B5B95',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 4,
  },
} as const;

// Minimum tap target.
export const TAP_MIN = 48;

export const theme = { colors, typography, spacing, radius, shadow, TAP_MIN } as const;
export type Theme = typeof theme;
