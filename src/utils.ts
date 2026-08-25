import { Platform } from 'react-native';

export type Currency = '₦' | '$';

function withCommas(intPart: string): string {
  return intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/** Format a money value with the currency symbol, e.g. ₦1,250.00 */
export function money(n: number, currency: Currency = '₦'): string {
  const neg = n < 0;
  const abs = Math.abs(n);
  const intPart = Math.floor(abs);
  const dec = Math.round((abs - intPart) * 100)
    .toString()
    .padStart(2, '0');
  return `${neg ? '-' : ''}${currency}${withCommas(String(intPart))}.${dec}`;
}

/** Format a price with adaptive decimals (no trailing zeros for large values). */
export function price(n: number, currency: Currency = '₦'): string {
  const neg = n < 0;
  const abs = Math.abs(n);
  const decimals = abs < 1000 ? 2 : 0;
  const fixed = abs.toFixed(decimals);
  const [intPart, dec] = fixed.split('.');
  const out = dec ? `${withCommas(intPart!)}.${dec}` : withCommas(intPart!);
  return `${neg ? '-' : ''}${currency}${out}`;
}

/** Compact a large number, e.g. 4.6T, 3.4B, 920M */
export function compact(n: number): string {
  const abs = Math.abs(n);
  const sign = n < 0 ? '-' : '';
  if (abs >= 1e12) return `${sign}${trim(abs / 1e12)}T`;
  if (abs >= 1e9) return `${sign}${trim(abs / 1e9)}B`;
  if (abs >= 1e6) return `${sign}${trim(abs / 1e6)}M`;
  if (abs >= 1e3) return `${sign}${trim(abs / 1e3)}K`;
  return `${sign}${abs}`;
}

function trim(n: number): string {
  return n.toFixed(1).replace(/\.0$/, '');
}

/** Format a percentage with sign, e.g. +2.45% / -1.10% */
export function pct(n: number): string {
  const sign = n > 0 ? '+' : '';
  return `${sign}${n.toFixed(2)}%`;
}

/** Deterministic pseudo-random generator so sparklines are stable per render. */
export function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Generate a plausible sparkline series for a stock. */
export function genSpark(
  seed: number,
  points = 28,
  volatility = 0.025,
  trend = 0,
): number[] {
  const rnd = mulberry32(seed);
  let v = 100;
  const out: number[] = [];
  for (let i = 0; i < points; i++) {
    const noise = (rnd() - 0.5) * 2 * volatility * 100;
    v += noise + trend * 100;
    v = Math.max(20, v); // keep positive
    out.push(v);
  }
  return out;
}

export const isWeb = Platform.OS === 'web';
export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';

/** Demo USD→NGN rate used to show the mixed portfolio in one currency. */
export const NGN_PER_USD = 1600;

export interface Candle {
  o: number;
  h: number;
  l: number;
  c: number;
}

/** Generate plausible OHLC candle data for charts. */
export function genCandles(seed: number, n = 44): Candle[] {
  const rnd = mulberry32(seed);
  let price = 100;
  const out: Candle[] = [];
  for (let i = 0; i < n; i++) {
    const o = price;
    const vol = 2.2;
    const move = (rnd() - 0.48) * vol * 100;
    const c = Math.max(20, o + move);
    const wickUp = rnd() * vol * 50;
    const wickDn = rnd() * vol * 50;
    out.push({
      o,
      c,
      h: Math.max(o, c) + wickUp,
      l: Math.max(1, Math.min(o, c) - wickDn),
    });
    price = c;
  }
  return out;
}
