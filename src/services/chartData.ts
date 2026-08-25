import { mulberry32 } from '@/utils';

export type Timeframe = '1D' | '1W' | '1M' | '3M' | '1Y';

export interface Bar {
  time: number; // UNIX seconds
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
}

export const TIMEFRAMES: Record<Timeframe, { points: number; step: number; label: string }> = {
  '1D': { points: 96, step: 300, label: '5m' },
  '1W': { points: 84, step: 3600, label: '1h' },
  '1M': { points: 30, step: 86400, label: '1d' },
  '3M': { points: 66, step: 86400, label: '1d' },
  '1Y': { points: 52, step: 604800, label: '1w' },
};

export const TIMEFRAME_ORDER: Timeframe[] = ['1D', '1W', '1M', '3M', '1Y'];

/** FNV-1a string hash → 32-bit unsigned seed (matches the reference app). */
function hashSeed(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const r2 = (x: number) => Math.round(x * 100) / 100;

/**
 * Deterministic OHLCV series for a stock + timeframe.
 * Ported from the reference app's generateOHLC(): mean-reverting drift toward
 * the live price, layered sine waves for ebb & flow, and realistic noise —
 * so every stock renders a clean, stable chart (no external symbol needed).
 */
export function generateSeries(
  id: string,
  target: number,
  baseVolume: number,
  tf: Timeframe,
): Bar[] {
  const rnd = mulberry32(hashSeed(`${id}:${tf}`));
  const cfg = TIMEFRAMES[tf];
  const n = cfg.points;
  const step = cfg.step;
  const endTime = Math.floor(Date.now() / 1000);
  const arr: Bar[] = [];

  const startBias = tf === '1D' ? 0.998 : tf === '1W' ? 0.985 : tf === '1M' ? 0.97 : tf === '3M' ? 0.9 : 0.8;
  let price = target * (startBias + rnd() * 0.04);
  const volBase = tf === '1D' ? 0.0018 : tf === '1W' ? 0.004 : tf === '1M' ? 0.008 : tf === '3M' ? 0.012 : 0.016;

  const waves = 2 + Math.floor(rnd() * 2);
  const phases: { amp: number; freq: number; ph: number }[] = [];
  for (let w = 0; w < waves; w++) phases.push({ amp: 0.4 + rnd() * 0.8, freq: 0.6 + rnd() * 1.8, ph: rnd() * Math.PI * 2 });

  const vol0 = baseVolume || 2_000_000;

  for (let i = 0; i < n; i++) {
    const progress = i / (n - 1);
    const pull = (target - price) * (0.03 + progress * 0.12);
    let wave = 0;
    for (const w of phases) wave += Math.sin(progress * w.freq * Math.PI * 2 + w.ph) * w.amp;
    wave *= price * volBase * 0.4;
    const noise = (rnd() - 0.5) * price * volBase * 1.6;
    const drift = pull + wave + noise;
    const open = price;
    let close = price + drift;
    if (close <= target * 0.5) close = target * 0.5;
    const spread = price * volBase * (0.5 + rnd() * 0.9);
    const high = Math.max(open, close) + spread * rnd();
    const low = Math.min(open, close) - spread * rnd();
    const volume = Math.round(vol0 * (0.4 + rnd() * 1.3));
    arr.push({ time: endTime - (n - 1 - i) * step, o: r2(open), h: r2(high), l: r2(low), c: r2(close), v: volume });
    price = close;
  }
  return arr;
}
