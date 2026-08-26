/**
 * Live NGX market data via the MyStocks Africa Partner API.
 *
 * When EXPO_PUBLIC_LIVE_MARKET=1 and a sandbox/partner key is present, the app
 * fetches the real (delayed) NGX catalogue and patches the in-memory stock list
 * so every screen — Markets, Home movers, stock detail, charts — anchors to
 * actual prices instead of mock seeds.
 *
 * NOTE: this ships the *sandbox* key in the client bundle, which is fine for
 * development. In production the app talks to the StocksX backend, which holds
 * the production partner key server-side.
 */

import { STOCKS, patchStock, appendStocks } from '@/services/marketData';
import { genSpark } from '@/utils';
import type { Stock } from '@/types';

const BASE =
  process.env.EXPO_PUBLIC_MYSTOCKS_BASE ?? 'https://mystocks.africa/api/sandbox/v1/partner';
const KEY = process.env.EXPO_PUBLIC_MYSTOCKS_KEY ?? '';

export const LIVE_ENABLED =
  process.env.EXPO_PUBLIC_LIVE_MARKET === '1' && KEY.length > 20;

const CATALOGUE_TTL = 5 * 60 * 1000;
let lastFetch = 0;

interface CatalogueEntry {
  id: string;
  symbol: string; // e.g. MTNN.NG
  name: string;
  exchange: string;
  currency: string;
  sector?: string;
  price?: number;
  usdPrice?: number;
  change?: number;
  changePct?: number;
  dayHigh?: number;
  dayLow?: number;
  volume?: number;
  previousClose?: number;
  lastPriceUpdate?: string;
  description?: string;
  logoUrl?: string;
}

async function apiGet<T>(path: string, timeoutMs = 12000): Promise<T> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(`${BASE}${path}`, {
      headers: { Authorization: `Bearer ${KEY}` },
      signal: ctrl.signal,
    });
    if (!res.ok) throw new Error(`MyStocks ${res.status}`);
    return (await res.json()) as T;
  } finally {
    clearTimeout(t);
  }
}

/** symbol (MTNN.NG) -> app id (mtnn) */
function symToId(symbol: string): string {
  return symbol.replace(/\.(NG|KE|ZA|GH|CI|ZM)$/i, '').toLowerCase();
}

const PALETTE = [
  '#0E8A57', '#1F7AE0', '#F6A623', '#7C5CFF', '#DD4B3E',
  '#0A9396', '#BB3E03', '#9D4EDD', '#2A9D8F', '#E76F51',
];

function colorFor(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return PALETTE[Math.abs(h) % PALETTE.length];
}

function entryToStock(e: CatalogueEntry): Stock {
  const id = symToId(e.symbol);
  const price = e.price ?? 0;
  const prevClose = e.previousClose ?? price;
  const changeAbs = +(price - prevClose).toFixed(2);
  const changePct =
    prevClose > 0 ? +(((price - prevClose) / prevClose) * 100).toFixed(2) : 0;
  return {
    id,
    ticker: id.toUpperCase(),
    name: e.name,
    market: 'NGX',
    currency: 'NGN',
    price,
    prevClose,
    changePct,
    changeAbs,
    sector: e.sector ?? 'Financial Services',
    color: colorFor(id),
    spark: genSpark(hashStr(id), 30, 0.02, changePct / 100 / 6),
    open: prevClose,
    high: e.dayHigh ?? price,
    low: e.dayLow ?? price,
    volume: e.volume ?? 0,
    marketCap: 0,
    peRatio: 0,
    divYield: 0,
    about: e.description ?? `${e.name} is listed on the Nigerian Exchange (NGX).`,
    news: [],
    tvSymbol: '',
  };
}

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

let inited = false;

/**
 * Fetches the live NGX catalogue and patches the app's stock list in place.
 * Safe to call multiple times; fails silently (mock data remains).
 */
export async function initLiveMarket(): Promise<{ live: boolean; count: number }> {
  if (!LIVE_ENABLED || inited) return { live: false, count: 0 };
  inited = true;
  try {
    const out: CatalogueEntry[] = [];
    let cursor: string | undefined;
    for (let page = 0; page < 4; page++) {
      const d = await apiGet<{ stocks: CatalogueEntry[]; nextCursor: string | null; hasMore: boolean }>(
        `/stocks?exchange=NGX&limit=100${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ''}`,
      );
      out.push(...(d.stocks ?? []));
      cursor = d.nextCursor ?? undefined;
      if (!d.hasMore || !cursor) break;
    }
    lastFetch = Date.now();

    const known = new Set(STOCKS.map((s) => s.id));
    const extras: Stock[] = [];

    for (const e of out) {
      if (!e.price || e.price <= 0) continue; // skip unpriced/funds
      const id = symToId(e.symbol);
      const live = entryToStock(e);
      if (known.has(id)) {
        patchStock(id, live);
      } else if (extras.length < 40) {
        extras.push(live); // broaden the Markets list beyond the seeds
      }
    }
    if (extras.length) appendStocks(extras);

    const liveCount = STOCKS.filter((s) => s.market === 'NGX').length;
    console.log(`[liveMarket] NGX live: ${liveCount} stocks @ ${new Date().toLocaleTimeString()}`);
    return { live: true, count: liveCount };
  } catch (e) {
    console.warn('[liveMarket] falling back to demo data:', (e as Error).message);
    return { live: false, count: 0 };
  }
}

/** Re-fetch prices if the cache is stale (call on pull-to-refresh / app resume). */
export async function refreshLivePrices(force = false): Promise<void> {
  if (!LIVE_ENABLED) return;
  if (!force && Date.now() - lastFetch < CATALOGUE_TTL) return;
  try {
    const d = await apiGet<{ stocks: CatalogueEntry[]; hasMore: boolean }>(
      '/stocks?exchange=NGX&limit=100',
    );
    lastFetch = Date.now();
    for (const e of d.stocks ?? []) {
      if (!e.price || e.price <= 0) continue;
      patchStock(symToId(e.symbol), entryToStock(e));
    }
  } catch {
    /* keep current values */
  }
}

/* ------------------------------------------------------------------ */
/* Real historical candles for the stock-detail chart (daily ranges)   */
/* ------------------------------------------------------------------ */

export interface LiveCandle {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

const candleCache = new Map<string, LiveCandle[]>();

export async function fetchHistory(
  symbol: string, // app id e.g. 'mtnn'
  period: '1M' | '3M' | '6M' | '1Y' = '1M',
): Promise<LiveCandle[] | null> {
  const sym = `${symbol.toUpperCase()}.NG`;
  const cacheKey = `${sym}:${period}`;
  const hit = candleCache.get(cacheKey);
  if (hit) return hit;
  try {
    const d = await apiGet<{ candles?: LiveCandle[] }>(
      `/stocks/${encodeURIComponent(sym)}/history?period=${period}`,
    );
    const candles = d.candles ?? null;
    if (candles) candleCache.set(cacheKey, candles);
    return candles;
  } catch {
    return null;
  }
}
