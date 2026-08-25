import { Platform } from 'react-native';

/**
 * StocksX design system — premium light fintech.
 * Deep emerald hero, soft off-white canvas, white rounded cards, soft shadows.
 */

export const C = {
  // ---- Brand greens ----
  green: '#0E8A57',
  greenDark: '#0A6B41',
  greenDeep: '#07593A',
  greenBright: '#11A06B',
  greenGlow: '#0FB372',

  // hero gradient (top -> bottom)
  hero1: '#0A6B41',
  hero2: '#0E8A57',
  hero3: '#13B077',

  // light green tints
  greenSoft: '#E7F4EE',
  greenTint: '#F1F9F5',

  // ---- Neutrals ----
  white: '#FFFFFF',
  canvas: '#F4F6F5', // soft off-white page background
  canvasAlt: '#EDF1EE',
  card: '#FFFFFF',
  hairline: '#EAEFEB',
  hairlineSoft: '#F1F4F1',

  // ---- Text ----
  ink: '#15201A', // primary charcoal w/ green undertone
  ink2: '#3A453F',
  muted: '#6C7771',
  faint: '#9AA49E',

  // ---- Semantic ----
  positive: '#0E9F5E',
  positiveSoft: '#E7F6EE',
  negative: '#DD4B3E',
  negativeSoft: '#FCEAE8',

  // ---- Misc ----
  dark: '#16211B',
  darkSoft: '#22302A',
} as const;

export const R = {
  xs: 10,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 28,
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

export const F = {
  // Text font. iOS: SF Pro (System). Android: Roboto. Web: Inter, like the
  // StocksX web reference.
  sans: Platform.select({
    ios: 'System',
    android: 'sans-serif',
    web: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    default: 'normal',
  }),
  // Display font for brand, titles and financial numerals (balances, prices,
  // stats) — Space Grotesk on web, exactly like the reference app's
  // --font-display. System font on native (unchanged look).
  display: Platform.select({
    ios: 'System',
    android: 'sans-serif',
    web: "'Space Grotesk', Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    default: 'normal',
  }),
  // Numerals font kept for legacy F.mono usages (prices/values): renders as the
  // display font on web and the system font on native.
  mono: Platform.select({
    ios: 'SF Pro Text',
    android: 'sans-serif',
    web: "'Space Grotesk', Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    default: 'normal',
  }),
} as const;

export const SH = {
  // soft ambient card shadow
  card: {
    shadowColor: '#0A3D28',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
  },
  // lighter list-item shadow
  soft: {
    shadowColor: '#0A3D28',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  // floating elements (nav, bridge card)
  float: {
    shadowColor: '#08402A',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.14,
    shadowRadius: 28,
    elevation: 10,
  },
  // green-tinted hero elements
  green: {
    shadowColor: C.green,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 6,
  },
} as const;
