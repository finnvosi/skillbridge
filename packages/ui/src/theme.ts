// SkillBridge design tokens — Apple / minimalist aesthetic.
// Single source of truth for color, typography, spacing, radius, shadow.
// Consumed by packages/ui components and the mobile app theme.ts.

export const colors = {
  // Surfaces
  background: '#FFFFFF',
  surface: '#F2F2F7', // iOS systemGray6
  surfaceSecondary: '#FFFFFF',
  separator: '#E5E5EA', // systemGray5

  // Text
  textPrimary: '#1C1C1E', // label
  textSecondary: '#8E8E93', // secondaryLabel
  textTertiary: '#C7C7CC',

  // Accent (iOS systemBlue)
  primary: '#007AFF',
  primaryDark: '#005BB5',
  primaryLight: '#E3F2FD',

  // Semantic
  success: '#34C759',
  warning: '#FF9500',
  danger: '#FF3B30',
  dangerLight: '#FFE5E5',

  // Role accents
  student: '#007AFF',
  employer: '#5856D6', // systemIndigo
} as const;

export const typography = {
  // iOS uses SF Pro; fall back gracefully across platforms.
  fontFamily: {
    regular: 'System',
    medium: 'System',
    semibold: 'System',
    bold: 'System',
  },
  size: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 17, // iOS body
    lg: 20,
    xl: 24,
    xxl: 28,
    display: 34,
  },
  weight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
  },
} as const;

// 8pt grid spacing scale
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

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
  full: 9999,
} as const;

export const shadow = {
  none: {},
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
  },
} as const;

export const theme = { colors, typography, spacing, radius, shadow } as const;
export type Theme = typeof theme;
