import type { MarketIndex, Stock } from '@/types';
import { genSpark } from '@/utils';

interface StockSeed {
  id: string;
  ticker: string;
  name: string;
  market: Stock['market'];
  price: number;
  changePct: number;
  changeAbs?: number;
  tvSymbol?: string;
  sector: string;
  color: string;
  marketCap: number;
  peRatio: number;
  divYield: number;
  about: string;
  open?: number;
  high?: number;
  low?: number;
  volume?: number;
  trending?: boolean;
  active?: boolean;
  news?: Stock['news'];
}

function mk(s: StockSeed): Stock {
  const changeAbs =
    s.changeAbs ?? +(s.price - s.price / (1 + s.changePct / 100)).toFixed(2);
  const prevClose = +(s.price - changeAbs).toFixed(2);
  return {
    id: s.id,
    ticker: s.ticker,
    name: s.name,
    market: s.market,
    currency: s.market === 'NGX' ? 'NGN' : 'USD',
    price: s.price,
    prevClose,
    changePct: s.changePct,
    changeAbs,
    sector: s.sector,
    color: s.color,
    spark: genSpark(
      hash(s.id),
      30,
      0.02,
      s.changePct / 100 / 6,
    ),
    open: s.open ?? +(prevClose * 1.001).toFixed(2),
    high: s.high ?? +(s.price * 1.012).toFixed(2),
    low: s.low ?? +(prevClose * 0.985).toFixed(2),
    volume: s.volume ?? Math.round(1e6 + (hash(s.id) % 50) * 1e6),
    marketCap: s.marketCap,
    peRatio: s.peRatio,
    divYield: s.divYield,
    about: s.about,
    news: s.news ?? [],
    trending: s.trending,
    active: s.active,
    tvSymbol: s.tvSymbol ?? TV_SYMBOLS[s.id] ?? 'NASDAQ:AAPL',
  };
}

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

// TradingView symbol per stock (real exchange data in the chart)
const TV_SYMBOLS: Record<string, string> = {
  mtnn: 'NGEX:MTNN',
  gtco: 'NGEX:GTCO',
  zenith: 'NGEX:ZENITHBANK',
  dangcem: 'NGEX:DANGCEM',
  buafoods: 'NGEX:BUAFOODS',
  airtelafri: 'NGEX:AIRTELAFRI',
  seplat: 'NGEX:SEPLAT',
  geregu: 'NGEX:GEREGU',
  buacement: 'NGEX:BUACEMENT',
  jaizbank: 'NGEX:JAAZBANK',
  nestle: 'NGEX:NESTLE',
  access: 'NGEX:ACCESS',
  presco: 'NGEX:PRESCO',
  aapl: 'NASDAQ:AAPL',
  tsla: 'NASDAQ:TSLA',
  msft: 'NASDAQ:MSFT',
  amzn: 'NASDAQ:AMZN',
  nvda: 'NASDAQ:NVDA',
  googl: 'NASDAQ:GOOGL',
};

const SEEDS: StockSeed[] = [
  {
    id: 'mtnn',
    ticker: 'MTNN',
    name: 'MTN Nigeria Communications',
    market: 'NGX',
    price: 280.5,
    changePct: 4.52,
    changeAbs: 12.1,
    sector: 'Telecommunications',
    color: '#FFCC00',
    marketCap: 5.89e12,
    peRatio: 19.4,
    divYield: 4.1,
    about:
      'MTN Nigeria is the largest mobile network operator in Nigeria, providing voice, data, fintech and digital services to over 80 million subscribers across the country.',
    volume: 18_400_000,
    trending: true,
    active: true,
    news: [
      {
        id: 'n1',
        source: 'BusinessDay',
        title: 'MTN Nigeria adds 2.1m data subscribers as fintech revenue climbs',
        time: '2h ago',
      },
      {
        id: 'n2',
        source: 'NSE',
        title: 'MTNN leads NGX gainers on heavy volume',
        time: '5h ago',
      },
      {
        id: 'n3',
        source: 'Reuters',
        title: 'MTN Group reaffirms guidance amid naira volatility',
        time: '1d ago',
      },
    ],
  },
  {
    id: 'gtco',
    ticker: 'GTCO',
    name: 'Guaranty Trust Holding',
    market: 'NGX',
    price: 52.3,
    changePct: 2.91,
    sector: 'Banking',
    color: '#FF8C00',
    marketCap: 1.53e12,
    peRatio: 3.9,
    divYield: 13.8,
    about:
      'Guaranty Trust Holding (formerly GTBank) is a leading pan-African financial services group known for digital banking innovation and a strong retail franchise.',
    trending: true,
    active: true,
  },
  {
    id: 'zenith',
    ticker: 'ZENITHBANK',
    name: 'Zenith Bank',
    market: 'NGX',
    price: 41.2,
    changePct: 3.18,
    sector: 'Banking',
    color: '#D0021B',
    marketCap: 1.3e12,
    peRatio: 3.2,
    divYield: 15.2,
    about:
      'Zenith Bank is one of Nigeria’s largest banks by assets, offering corporate, retail and investment banking across Africa and Europe.',
    active: true,
  },
  {
    id: 'dangcem',
    ticker: 'DANGCEM',
    name: 'Dangote Cement',
    market: 'NGX',
    price: 340.0,
    changePct: -0.35,
    sector: 'Industrials',
    color: '#B0413E',
    marketCap: 5.8e12,
    peRatio: 14.7,
    divYield: 6.5,
    about:
      'Dangote Cement is Africa’s largest cement producer with operations across the continent — a flagship industrial name on the NGX.',
  },
  {
    id: 'buafoods',
    ticker: 'BUAFOODS',
    name: 'BUA Foods',
    market: 'NGX',
    price: 98.4,
    changePct: 2.05,
    sector: 'Consumer Goods',
    color: '#D7263D',
    marketCap: 1.76e12,
    peRatio: 22.1,
    divYield: 3.0,
    about:
      'BUA Foods produces sugar, flour, pasta and edible oils, serving millions of Nigerian households under the BUA Group.',
    trending: true,
  },
  {
    id: 'airtelafri',
    ticker: 'AIRTELAFRI',
    name: 'Airtel Africa',
    market: 'NGX',
    price: 2410.0,
    changePct: 1.42,
    sector: 'Telecommunications',
    color: '#FF3366',
    marketCap: 9.05e12,
    peRatio: 22.9,
    divYield: 2.8,
    about:
      'Airtel Africa is a pan-African telecommunications and mobile money company dual-listed in Lagos and London, operating across 14 countries.',
    active: true,
  },
  {
    id: 'seplat',
    ticker: 'SEPLAT',
    name: 'Seplat Energy',
    market: 'NGX',
    price: 5640.0,
    changePct: -1.24,
    sector: 'Energy',
    color: '#7C5CFF',
    marketCap: 3.31e12,
    peRatio: 9.8,
    divYield: 7.2,
    about:
      'Seplat Energy is a leading Nigerian independent energy company focused on oil and gas exploration and gas-to-power growth.',
  },
  {
    id: 'geregu',
    ticker: 'GEREGU',
    name: 'Geregu Power',
    market: 'NGX',
    price: 1180.0,
    changePct: 3.66,
    sector: 'Utilities',
    color: '#2A9D8F',
    marketCap: 2.97e11,
    peRatio: 18.5,
    divYield: 5.5,
    about:
      'Geregu Power is a leading electricity generation company in Nigeria, supplying power to the national grid from its Ajaokuta plant.',
    trending: true,
  },
  {
    id: 'buacement',
    ticker: 'BUACEMENT',
    name: 'BUA Cement',
    market: 'NGX',
    price: 96.8,
    changePct: 0.85,
    sector: 'Industrials',
    color: '#3DDC97',
    marketCap: 1.64e12,
    peRatio: 21.3,
    divYield: 3.2,
    about:
      'BUA Cement is a leading Nigerian cement manufacturer serving northern and southern markets under the BUA Group.',
  },
  {
    id: 'jaizbank',
    ticker: 'JAAZBANK',
    name: 'Jaiz Bank',
    market: 'NGX',
    price: 6.45,
    changePct: 4.92,
    sector: 'Banking',
    color: '#0E8A57',
    marketCap: 1.92e11,
    peRatio: 12.4,
    divYield: 5.0,
    about:
      'Jaiz Bank is Nigeria’s first full non-interest (Islamic) bank, built on profit-and-loss sharing rather than interest (riba).',
    trending: true,
  },
  {
    id: 'nestle',
    ticker: 'NESTLE',
    name: 'Nestlé Nigeria',
    market: 'NGX',
    price: 1052.0,
    changePct: -0.62,
    sector: 'Consumer Goods',
    color: '#1E88E5',
    marketCap: 8.36e11,
    peRatio: 27.5,
    divYield: 3.0,
    about:
      'Nestlé Nigeria manufactures popular food, beverage and wellness products such as Milo and Maggi for the Nigerian market.',
  },
  {
    id: 'access',
    ticker: 'ACCESS',
    name: 'Access Holdings',
    market: 'NGX',
    price: 22.1,
    changePct: 1.38,
    sector: 'Banking',
    color: '#8E24AA',
    marketCap: 1.18e12,
    peRatio: 2.7,
    divYield: 11.5,
    about:
      'Access Holdings is the parent of Access Bank, one of Africa’s largest banking groups with operations across many countries.',
    active: true,
  },
  {
    id: 'presco',
    ticker: 'PRESCO',
    name: 'Presco',
    market: 'NGX',
    price: 332.0,
    changePct: 1.78,
    sector: 'Agriculture',
    color: '#F6A623',
    marketCap: 3.32e11,
    peRatio: 16.1,
    divYield: 8.4,
    about:
      'Presco is a major Nigerian palm-oil producer covering cultivation, milling, refining and distribution of edible oils.',
  },

  // ---- International ----
  {
    id: 'aapl',
    ticker: 'AAPL',
    name: 'Apple Inc.',
    market: 'US',
    price: 232.4,
    changePct: 0.92,
    sector: 'Technology',
    color: '#A3AAAE',
    marketCap: 3.52e12,
    peRatio: 34.1,
    divYield: 0.4,
    about:
      'Apple designs and sells the iPhone, Mac and iPad plus a growing services business including the App Store and iCloud.',
    trending: true,
  },
  {
    id: 'tsla',
    ticker: 'TSLA',
    name: 'Tesla, Inc.',
    market: 'US',
    price: 251.6,
    changePct: -2.14,
    sector: 'Automotive',
    color: '#E82127',
    marketCap: 8.0e11,
    peRatio: 62.4,
    divYield: 0,
    about:
      'Tesla designs electric vehicles, energy storage and solar products, and is central to the global EV transition.',
  },
  {
    id: 'msft',
    ticker: 'MSFT',
    name: 'Microsoft Corporation',
    market: 'US',
    price: 428.6,
    changePct: 1.45,
    sector: 'Technology',
    color: '#00A4EF',
    marketCap: 3.18e12,
    peRatio: 36.2,
    divYield: 0.7,
    about:
      'Microsoft spans cloud (Azure), productivity (Microsoft 365), Windows, gaming (Xbox) and AI.',
    active: true,
  },
  {
    id: 'amzn',
    ticker: 'AMZN',
    name: 'Amazon.com, Inc.',
    market: 'US',
    price: 186.3,
    changePct: 1.08,
    sector: 'Consumer Discretionary',
    color: '#FF9900',
    marketCap: 1.95e12,
    peRatio: 41.2,
    divYield: 0,
    about:
      'Amazon is a global leader in e-commerce, cloud computing (AWS), logistics and digital entertainment.',
    trending: true,
  },
  {
    id: 'nvda',
    ticker: 'NVDA',
    name: 'NVIDIA Corporation',
    market: 'US',
    price: 128.2,
    changePct: 3.88,
    sector: 'Technology',
    color: '#76B900',
    marketCap: 3.14e12,
    peRatio: 55.8,
    divYield: 0.03,
    about:
      'NVIDIA designs the GPUs that power AI, data centres and gaming — central to the global AI boom.',
    trending: true,
    active: true,
  },
  {
    id: 'googl',
    ticker: 'GOOGL',
    name: 'Alphabet Inc.',
    market: 'US',
    price: 178.3,
    changePct: -0.74,
    sector: 'Technology',
    color: '#4285F4',
    marketCap: 2.18e12,
    peRatio: 24.6,
    divYield: 0,
    about:
      'Alphabet is the parent of Google — search, YouTube, Android, Cloud and a portfolio of AI-driven bets.',
  },
];

export const STOCKS: Stock[] = SEEDS.map(mk);

/* ---------------- live-data hooks (see liveMarket.ts) ---------------- */

/**
 * Patch an existing stock in place with live values (keeps object identity so
 * screens holding references re-render with fresh numbers).
 */
export function patchStock(id: string, live: Stock): void {
  const idx = STOCKS.findIndex((s) => s.id === id);
  if (idx === -1) return;
  const cur = STOCKS[idx]!;
  STOCKS[idx] = {
    ...cur,
    price: live.price,
    prevClose: live.prevClose,
    changePct: live.changePct,
    changeAbs: live.changeAbs,
    open: live.open,
    high: live.high,
    low: live.low,
    volume: live.volume,
    sector: live.sector,
    name: live.name,
    spark: live.spark,
  };
}

/** Append newly discovered stocks (mutates so getStocks() sees them). */
export function appendStocks(extra: Stock[]): void {
  const known = new Set(STOCKS.map((s) => s.id));
  for (const s of extra) {
    if (!known.has(s.id)) STOCKS.push(s);
  }
}

export const INDICES: MarketIndex[] = [
  {
    id: 'asi',
    name: 'NGX All-Share Index',
    short: 'NGX ASI',
    value: 102345.67,
    changePct: 1.23,
    spark: genSpark(201, 24, 0.012, 0.004),
  },
  {
    id: 'ngx30',
    name: 'NGX 30',
    short: 'NGX 30',
    value: 3765.18,
    changePct: 1.18,
    spark: genSpark(202, 24, 0.012, 0.004),
  },
  {
    id: 'banking',
    name: 'NGX Banking Index',
    short: 'Banking',
    value: 892.45,
    changePct: -0.45,
    spark: genSpark(203, 24, 0.014, -0.003),
  },
  {
    id: 'insurance',
    name: 'NGX Insurance Index',
    short: 'Insurance',
    value: 214.8,
    changePct: 0.62,
    spark: genSpark(204, 24, 0.013, 0.002),
  },
];

/* ---------------- accessors ---------------- */

export function getStocks(): Stock[] {
  return STOCKS;
}
export function getStock(id: string): Stock | undefined {
  return STOCKS.find((s) => s.id === id);
}
export function getIndices(): MarketIndex[] {
  return INDICES;
}
export function getGainers(limit = 5): Stock[] {
  return [...STOCKS].sort((a, b) => b.changePct - a.changePct).slice(0, limit);
}
export function getLosers(limit = 5): Stock[] {
  return [...STOCKS].sort((a, b) => a.changePct - b.changePct).slice(0, limit);
}
export function getMostActive(limit = 6): Stock[] {
  return [...STOCKS]
    .sort((a, b) => (b.active ? 1 : 0) - (a.active ? 1 : 0) || b.volume - a.volume)
    .slice(0, limit);
}
export function getTrending(limit = 5): Stock[] {
  return STOCKS.filter((s) => s.trending).slice(0, limit);
}
export function getByMarket(market: Stock['market']): Stock[] {
  return STOCKS.filter((s) => s.market === market);
}
export function searchStocks(q: string): Stock[] {
  const t = q.trim().toLowerCase();
  if (!t) return STOCKS;
  return STOCKS.filter((s) =>
    `${s.ticker} ${s.name}`.toLowerCase().includes(t),
  );
}
