import { Platform } from 'react-native';

/**
 * Albarka design system.
 * A deep, glassy green palette built around barakah (prosperity):
 * Nigeria's green + financial growth + a premium dark-glass aesthetic.
 */

export const C = {
  // Backgrounds (deep green-black gradient)
  bg0: '#03130D',
  bg1: '#07251A',
  bg2: '#04140E',

  // Brand greens
  accent: '#22E59A',
  accent2: '#0FD17F',
  accentDeep: '#0AA663',
  glow: 'rgba(34, 229, 154, 0.45)',
  glowSoft: 'rgba(34, 229, 154, 0.16)',

  // Glass surfaces
  glass: 'rgba(255, 255, 255, 0.055)',
  glassStrong: 'rgba(255, 255, 255, 0.09)',
  glassGreen: 'rgba(34, 229, 154, 0.10)',
  border: 'rgba(255, 255, 255, 0.10)',
  borderStrong: 'rgba(255, 255, 255, 0.16)',

  // Text
  text: '#FFFFFF',
  textMuted: 'rgba(255, 255, 255, 0.64)',
  textFaint: 'rgba(255, 255, 255, 0.42)',

  // Market sentiment
  positive: '#22E59A',
  negative: '#FF6B6B',

  // Sharia badge
  sharia: '#22E59A',
  haram: '#FF8A65',
} as const;

export const R = {
  sm: 12,
  md: 18,
  lg: 24,
  xl: 30,
  pill: 999,
} as const;

export const S = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const FONT = {
  // Use the rounded system font on iOS for a friendlier, premium feel.
  sans: Platform.select({ ios: 'System', default: 'normal' }),
  mono: Platform.select({ ios: 'Menlo', default: 'monospace' }),
} as const;

export const SHADOW = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 10,
  },
  float: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.45,
    shadowRadius: 30,
    elevation: 14,
  },
  glow: {
    shadowColor: C.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.55,
    shadowRadius: 18,
    elevation: 6,
  },
} as const;
