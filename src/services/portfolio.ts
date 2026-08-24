import type { Holding } from '@/types';
import { getStock } from './marketData';

export interface PortfolioSummary {
  totalValue: number;
  todayPl: number;
  todayPct: number;
  totalReturn: number;
  totalReturnPct: number;
  cash: number; // = buying power
}

/**
 * Demo portfolio headline (matches the product spec).
 * In production this would come from /api/portfolio.
 */
export const PORTFOLIO: PortfolioSummary = {
  totalValue: 2_350_820.45,
  todayPl: 156_340.2,
  todayPct: 7.12,
  totalReturn: 450_820.45,
  totalReturnPct: 23.71,
  cash: 425_800.0,
};

export function getPortfolio(): PortfolioSummary {
  return PORTFOLIO;
}

export const HOLDINGS: Holding[] = [
  { stockId: 'mtnn', shares: 100, avgPrice: 243.0 },
  { stockId: 'gtco', shares: 200, avgPrice: 39.9 },
  { stockId: 'dangcem', shares: 50, avgPrice: 310.0 },
  { stockId: 'airtelafri', shares: 30, avgPrice: 2250.0 },
  { stockId: 'jaizbank', shares: 8000, avgPrice: 5.8 },
];

export interface HoldingView extends Holding {
  ticker: string;
  name: string;
  color: string;
  currency: Holding extends never ? never : 'NGN' | 'USD';
  current: number;
  value: number;
  pl: number;
  plPct: number;
  portion: number;
}

export function getHoldings(): HoldingView[] {
  const rows = HOLDINGS.map((h) => {
    const s = getStock(h.stockId)!;
    const value = s.price * h.shares;
    const cost = h.avgPrice * h.shares;
    return {
      ...h,
      ticker: s.ticker,
      name: s.name,
      color: s.color,
      currency: s.currency,
      current: s.price,
      value,
      pl: value - cost,
      plPct: cost > 0 ? ((value - cost) / cost) * 100 : 0,
      portion: 0,
    };
  });
  const total = rows.reduce((a, b) => a + b.value, 0);
  rows.forEach((r) => (r.portion = total > 0 ? r.value / total : 0));
  return rows.sort((a, b) => b.value - a.value);
}
