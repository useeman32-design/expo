import { Platform } from 'react-native';

/**
 * StocksX design system — premium fintech, light & dark.
 * Light: deep emerald hero, soft off-white canvas, white cards.
 * Dark: near-black green-tinted canvas, graphite cards, brighter emerald accents.
 *
 * `C` is the LIVE palette — a mutable object swapped in place by applyTheme().
 * Every module's StyleSheet is created through `makeStyles()` factories that
 * re-read C, and registered with registerStyles() so a theme switch refreshes
 * all of them; the root tree is remounted with a new key to re-render inline
 * colors as well.
 */

export type ThemeMode = 'light' | 'dark';

const LIGHT = {
  // NOTE: no `as const` — the palette type must be `string` so DARK can swap values
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
  white: '#FFFFFF', // on-accent text color (stays white in both themes)
  surface: '#FFFFFF', // cards / sheets / inputs background
  canvas: '#F4F6F5', // page background
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

  // ---- Warning (info cards) ----
  warnBg: '#FFF9F0',
  warnTitle: '#B07514',
  warnText: '#8A6A2E',

  // ---- Misc ----
  dark: '#16211B', // secondary "dark" button
  darkSoft: '#22302A',
};

const DARK: typeof LIGHT = {
  // ---- Brand greens (brighter for dark surfaces) ----
  green: '#12A26A',
  greenDark: '#0E8A57',
  greenDeep: '#0A6B41',
  greenBright: '#18B478',
  greenGlow: '#0FB372',

  // hero gradient — deep emerald, keeps the brand feel on dark
  hero1: '#07301E',
  hero2: '#0A5236',
  hero3: '#0E7A50',

  // dark green tints
  greenSoft: '#122B1F',
  greenTint: '#0D2118',

  // ---- Neutrals ----
  white: '#FFFFFF', // on-accent text stays white
  surface: '#121814', // cards / sheets / inputs
  canvas: '#0B0F0D', // page background
  canvasAlt: '#161C18',
  card: '#121814',
  hairline: '#232C26',
  hairlineSoft: '#1C241F',

  // ---- Text ----
  ink: '#EDF4EF',
  ink2: '#C3CEC7',
  muted: '#8E9A92',
  faint: '#5F6B64',

  // ---- Semantic ----
  positive: '#18BE7C',
  positiveSoft: '#10301F',
  negative: '#E5584C',
  negativeSoft: '#351B17',

  // ---- Warning ----
  warnBg: '#2B2416',
  warnTitle: '#E3B25C',
  warnText: '#B99553',

  // ---- Misc ----
  dark: '#1D2823', // secondary "dark" button (lighter than canvas)
  darkSoft: '#26332C',
};

/** Live palette — mutated in place by applyTheme(). */
export const C: { [K in keyof typeof LIGHT]: string } = { ...LIGHT };

/** Status-bar icon style for the current theme ('dark' icons on light bg etc). */
export let STATUSBAR: 'light' | 'dark' = 'dark';

let applied: ThemeMode | null = null;
const styleRefreshers: Array<() => void> = [];

/**
 * Modules register their StyleSheet factory here so a theme switch can
 * re-create every style object with the new palette.
 */
export function registerStyles(refresh: () => void): void {
  styleRefreshers.push(refresh);
}

/** Swap the live palette (idempotent — no-op if `mode` is already applied). */
export function applyTheme(mode: ThemeMode): void {
  if (applied === mode) return;
  applied = mode;
  Object.assign(C, mode === 'dark' ? DARK : LIGHT);
  STATUSBAR = mode === 'dark' ? 'light' : 'dark';
  for (const refresh of styleRefreshers) {
    try {
      refresh();
    } catch {
      /* a broken style factory should never take the app down */
    }
  }
}

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
