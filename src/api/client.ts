/**
 * API client placeholder.
 *
 * Today the app reads from realistic MOCK data (see ../services/*).
 * This file is where a real backend integration would plug in — e.g.
 * live NGX/US prices, auth, KYC, orders, deposits and withdrawals.
 *
 * The service layer (../services) is the ONLY place that should talk to
 * data, so swapping mock -> real only touches these services.
 */

import type { Stock, MarketIndex } from '@/types';

// Example of where real endpoints would live. Left intentionally unused
// for now; the services return mock data instead.
export const ENDPOINTS = {
  stocks: '/api/stocks',
  indices: '/api/indices',
  quote: (id: string) => `/api/stocks/${id}/quote`,
  auth: {
    login: '/api/auth/login',
    kyc: '/api/kyc',
  },
  orders: '/api/orders',
  portfolio: '/api/portfolio',
} as const;

/**
 * Generic JSON fetch helper for future real-API calls.
 * Disabled until a base URL + auth are configured.
 */
export async function apiGet<T>(_path: string): Promise<T> {
  throw new Error(
    'apiGet: live API not configured. The app is running on mock data.',
  );
}

/** Future: subscribe to real-time price ticks. */
export function subscribeQuotes(
  _ids: string[],
  _onTick: (q: Partial<Stock> & { id: string }) => void,
): () => void {
  return () => {};
}

export type { Stock, MarketIndex };
