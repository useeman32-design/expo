import { Currency, NGN_PER_USD, genSpark } from '@/utils';

export type Market = 'NGX' | 'US';

export interface Stock {
  id: string;
  ticker: string;
  name: string;
  market: Market;
  currency: Currency;
  price: number;
  changePct: number;
  sector: string;
  sharia: boolean;
  /** short reason for the sharia verdict */
  shariaNote: string;
  color: string;
  marketCap: number;
  peRatio: number;
  high52: number;
  low52: number;
  dividendYield: number;
  about: string;
  spark: number[];
}

/**
 * Demo market data. Prices/figures are illustrative snapshots — not live quotes.
 * Sharia flags follow general AAOIFI-style screening (conventional banks/riba = not compliant).
 */
export const STOCKS: Stock[] = [
  // ---------------- Nigerian Exchange (NGX) ----------------
  {
    id: 'mtnn',
    ticker: 'MTNN',
    name: 'MTN Nigeria',
    market: 'NGX',
    currency: '₦',
    price: 262.4,
    changePct: 2.31,
    sector: 'Telecoms',
    sharia: true,
    shariaNote: 'Low interest income, no haram business lines.',
    color: '#FFCC00',
    marketCap: 5.51e12,
    peRatio: 18.2,
    high52: 269.0,
    low52: 198.5,
    dividendYield: 4.1,
    about:
      'MTN Nigeria is the largest mobile network operator in Nigeria, providing voice, data, fintech and digital services to tens of millions of subscribers across the country.',
    spark: genSpark(11, 28, 0.02, 0.004),
  },
  {
    id: 'dangcem',
    ticker: 'DANGCEM',
    name: 'Dangote Cement',
    market: 'NGX',
    currency: '₦',
    price: 478.5,
    changePct: 1.12,
    sector: 'Industrials',
    sharia: true,
    shariaNote: 'Manufacturing business, compliant financial ratios.',
    color: '#E8505B',
    marketCap: 8.15e12,
    peRatio: 14.7,
    high52: 540.0,
    low52: 410.2,
    dividendYield: 6.5,
    about:
      'Africa’s largest cement producer, with operations across the continent. A flagship industrial name on the NGX and a core holding for many Nigerian portfolios.',
    spark: genSpark(23, 28, 0.018, 0.002),
  },
  {
    id: 'buacement',
    ticker: 'BUACEMENT',
    name: 'BUA Cement',
    market: 'NGX',
    currency: '₦',
    price: 96.8,
    changePct: 0.85,
    sector: 'Industrials',
    sharia: true,
    shariaNote: 'Cement manufacturing, compliant.',
    color: '#3DDC97',
    marketCap: 1.64e12,
    peRatio: 21.3,
    high52: 114.0,
    low52: 88.4,
    dividendYield: 3.2,
    about:
      'A leading Nigerian cement manufacturer serving the northern and southern markets, backed by the BUA Group.',
    spark: genSpark(31, 28, 0.022, -0.001),
  },
  {
    id: 'airtelafri',
    ticker: 'AIRTELAFRI',
    name: 'Airtel Africa',
    market: 'NGX',
    currency: '₦',
    price: 2410.0,
    changePct: 3.42,
    sector: 'Telecoms',
    sharia: true,
    shariaNote: 'Compliant core business; minor interest purified.',
    color: '#FF3366',
    marketCap: 9.05e12,
    peRatio: 22.9,
    high52: 2650.0,
    low52: 1880.0,
    dividendYield: 2.8,
    about:
      'A pan-African telecommunications and mobile money company dual-listed in Lagos and London, serving markets across 14 African countries.',
    spark: genSpark(41, 28, 0.024, 0.006),
  },
  {
    id: 'jaizbank',
    ticker: 'JAAZBANK',
    name: 'Jaiz Bank',
    market: 'NGX',
    currency: '₦',
    price: 6.45,
    changePct: 4.92,
    sector: 'Banking',
    sharia: true,
    shariaNote: 'Fully non-interest (Islamic) banking — proudly compliant.',
    color: '#22E59A',
    marketCap: 1.92e11,
    peRatio: 12.4,
    high52: 7.1,
    low52: 4.3,
    dividendYield: 5.0,
    about:
      'Nigeria’s first and largest full non-interest (Islamic) bank, offering Sharia-compliant banking built on profit-and-loss sharing rather than interest (riba).',
    spark: genSpark(53, 28, 0.03, 0.009),
  },
  {
    id: 'seplat',
    ticker: 'SEPLAT',
    name: 'Seplat Energy',
    market: 'NGX',
    currency: '₦',
    price: 5640.0,
    changePct: -1.24,
    sector: 'Energy',
    sharia: true,
    shariaNote: 'Upstream energy producer, compliant ratios.',
    color: '#7C5CFF',
    marketCap: 3.31e12,
    peRatio: 9.8,
    high52: 6200.0,
    low52: 4100.0,
    dividendYield: 7.2,
    about:
      'A leading Nigerian independent energy company focused on oil and gas exploration and production, with growing gas-to-power ambitions.',
    spark: genSpark(67, 28, 0.028, -0.004),
  },
  {
    id: 'presco',
    ticker: 'PRESCO',
    name: 'Presco',
    market: 'NGX',
    currency: '₦',
    price: 332.0,
    changePct: 1.78,
    sector: 'Agriculture',
    sharia: true,
    shariaNote: 'Palm-oil agribusiness, compliant.',
    color: '#F6A623',
    marketCap: 3.32e11,
    peRatio: 16.1,
    high52: 360.0,
    low52: 250.0,
    dividendYield: 8.4,
    about:
      'A major palm-oil producer in Nigeria, covering cultivation, milling, refining and distribution of edible oils and fats.',
    spark: genSpark(79, 28, 0.02, 0.003),
  },
  {
    id: 'nestle',
    ticker: 'NESTLE',
    name: 'Nestlé Nigeria',
    market: 'NGX',
    currency: '₦',
    price: 1052.0,
    changePct: -0.62,
    sector: 'Consumer Goods',
    sharia: true,
    shariaNote: 'Food & beverage; minor interest below thresholds.',
    color: '#1E88E5',
    marketCap: 8.36e11,
    peRatio: 27.5,
    high52: 1200.0,
    low52: 910.0,
    dividendYield: 3.0,
    about:
      'The Nigerian arm of Nestlé, manufacturing and marketing popular food, beverage and wellness products such as Milo and Maggi.',
    spark: genSpark(83, 28, 0.015, -0.002),
  },
  {
    id: 'zenith',
    ticker: 'ZENITHBANK',
    name: 'Zenith Bank',
    market: 'NGX',
    currency: '₦',
    price: 48.2,
    changePct: 1.05,
    sector: 'Banking',
    sharia: false,
    shariaNote: 'Conventional bank — earns from interest (riba). Not compliant.',
    color: '#D0021B',
    marketCap: 1.52e12,
    peRatio: 3.2,
    high52: 54.0,
    low52: 34.5,
    dividendYield: 15.2,
    about:
      'One of Nigeria’s largest banks by assets, offering corporate, retail and investment banking services across Africa and Europe.',
    spark: genSpark(97, 28, 0.02, 0.005),
  },
  {
    id: 'gtco',
    ticker: 'GTCO',
    name: 'Guaranty Trust',
    market: 'NGX',
    currency: '₦',
    price: 52.6,
    changePct: 2.14,
    sector: 'Banking',
    sharia: false,
    shariaNote: 'Conventional bank — interest-based. Not compliant.',
    color: '#FFB300',
    marketCap: 1.54e12,
    peRatio: 3.9,
    high52: 60.0,
    low52: 38.0,
    dividendYield: 13.8,
    about:
      'A leading pan-African financial services group (formerly GTBank) known for its digital banking innovation and strong retail franchise.',
    spark: genSpark(101, 28, 0.019, 0.006),
  },
  {
    id: 'access',
    ticker: 'ACCESS',
    name: 'Access Holdings',
    market: 'NGX',
    currency: '₦',
    price: 22.1,
    changePct: -0.9,
    sector: 'Banking',
    sharia: false,
    shariaNote: 'Conventional bank — interest-based. Not compliant.',
    color: '#8E24AA',
    marketCap: 1.18e12,
    peRatio: 2.7,
    high52: 28.5,
    low52: 16.4,
    dividendYield: 11.5,
    about:
      'The parent of Access Bank, one of Africa’s largest banking groups with a presence in multiple countries and the UK.',
    spark: genSpark(113, 28, 0.022, -0.003),
  },

  // ---------------- US Stocks ----------------
  {
    id: 'aapl',
    ticker: 'AAPL',
    name: 'Apple Inc.',
    market: 'US',
    currency: '$',
    price: 232.4,
    changePct: 0.92,
    sector: 'Technology',
    sharia: true,
    shariaNote: 'Screens as compliant; tiny interest purified.',
    color: '#A3AAAE',
    marketCap: 3.52e12,
    peRatio: 34.1,
    high52: 237.0,
    low52: 164.0,
    dividendYield: 0.4,
    about:
      'Designs and sells the iPhone, Mac, iPad and a growing services business (App Store, iCloud, Apple Music). One of the world’s most valuable companies.',
    spark: genSpark(127, 28, 0.018, 0.005),
  },
  {
    id: 'msft',
    ticker: 'MSFT',
    name: 'Microsoft',
    market: 'US',
    currency: '$',
    price: 428.6,
    changePct: 1.45,
    sector: 'Technology',
    sharia: true,
    shariaNote: 'Screens as compliant.',
    color: '#00A4EF',
    marketCap: 3.18e12,
    peRatio: 36.2,
    high52: 450.0,
    low52: 309.0,
    dividendYield: 0.7,
    about:
      'A global technology leader spanning cloud (Azure), productivity (Microsoft 365), Windows, gaming (Xbox) and AI.',
    spark: genSpark(131, 28, 0.017, 0.006),
  },
  {
    id: 'nvda',
    ticker: 'NVDA',
    name: 'NVIDIA',
    market: 'US',
    currency: '$',
    price: 128.2,
    changePct: 3.88,
    sector: 'Technology',
    sharia: true,
    shariaNote: 'Screens as compliant.',
    color: '#76B900',
    marketCap: 3.14e12,
    peRatio: 55.8,
    high52: 135.0,
    low52: 45.0,
    dividendYield: 0.03,
    about:
      'The leading designer of GPUs that power AI, data centres, gaming and autonomous systems — central to the global AI boom.',
    spark: genSpark(137, 28, 0.03, 0.011),
  },
  {
    id: 'googl',
    ticker: 'GOOGL',
    name: 'Alphabet',
    market: 'US',
    currency: '$',
    price: 178.3,
    changePct: -0.74,
    sector: 'Technology',
    sharia: true,
    shariaNote: 'Screens as compliant.',
    color: '#4285F4',
    marketCap: 2.18e12,
    peRatio: 24.6,
    high52: 191.0,
    low52: 130.0,
    dividendYield: 0.0,
    about:
      'The parent of Google — search, YouTube, Android, Cloud and a portfolio of ambitious “other bets” from AI to self-driving.',
    spark: genSpark(149, 28, 0.02, -0.002),
  },
  {
    id: 'ko',
    ticker: 'KO',
    name: 'Coca-Cola',
    market: 'US',
    currency: '$',
    price: 62.7,
    changePct: 0.31,
    sector: 'Consumer Goods',
    sharia: true,
    shariaNote: 'Screens as compliant.',
    color: '#F40009',
    marketCap: 2.7e11,
    peRatio: 26.4,
    high52: 67.0,
    low52: 53.0,
    dividendYield: 2.9,
    about:
      'The world’s largest non-alcoholic beverage company, with a portfolio of iconic brands sold in virtually every country.',
    spark: genSpark(151, 28, 0.012, 0.001),
  },
  {
    id: 'jpm',
    ticker: 'JPM',
    name: 'JPMorgan Chase',
    market: 'US',
    currency: '$',
    price: 221.5,
    changePct: -1.18,
    sector: 'Banking',
    sharia: false,
    shariaNote: 'Conventional bank — earns from interest (riba). Not compliant.',
    color: '#5C2D91',
    marketCap: 6.3e11,
    peRatio: 12.9,
    high52: 230.0,
    low52: 135.0,
    dividendYield: 2.3,
    about:
      'The largest bank in the United States, offering consumer banking, investment banking, asset management and trading globally.',
    spark: genSpark(157, 28, 0.016, -0.002),
  },
];

export function getStock(id: string): Stock | undefined {
  return STOCKS.find((s) => s.id === id);
}

export const SECTORS = [
  'All',
  'Telecoms',
  'Industrials',
  'Banking',
  'Energy',
  'Agriculture',
  'Consumer Goods',
  'Technology',
];

// ---------------- Sample portfolio (demo) ----------------
export interface Holding {
  stockId: string;
  shares: number;
  avgPrice: number;
}

export const HOLDINGS: Holding[] = [
  { stockId: 'mtnn', shares: 1200, avgPrice: 240.0 },
  { stockId: 'dangcem', shares: 300, avgPrice: 452.0 },
  { stockId: 'jaizbank', shares: 8500, avgPrice: 5.8 },
  { stockId: 'airtelafri', shares: 40, avgPrice: 2250.0 },
  { stockId: 'aapl', shares: 5, avgPrice: 198.0 },
  { stockId: 'presco', shares: 200, avgPrice: 310.0 },
];

/** Aggregate the demo portfolio, converting USD holdings to Naira. */
export function getPortfolio() {
  let value = 0;
  let cost = 0;
  let todayPct = 0;
  let totalValue = 0;

  for (const h of HOLDINGS) {
    const s = getStock(h.stockId);
    if (!s) continue;
    const fx = s.currency === '$' ? NGN_PER_USD : 1;
    const v = s.price * h.shares * fx;
    value += v;
    cost += h.avgPrice * h.shares * fx;
    totalValue += v;
    todayPct += s.changePct * v;
  }
  const pl = value - cost;
  const plPct = cost > 0 ? (pl / cost) * 100 : 0;
  const today = totalValue > 0 ? todayPct / totalValue : 0;
  return { value, cost, pl, plPct, today };
}

export const CASH = 248500; // available NGN cash (demo)
