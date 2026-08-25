import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import type { Holding, Order } from '@/types';
import { HOLDINGS } from '@/services/portfolio';
import { ORDERS } from '@/services/orders';
import { PORTFOLIO } from '@/services/portfolio';

export interface Toast {
  id: number;
  text: string;
  tone: 'success' | 'error' | 'info';
}
export interface ActionResult {
  ok: boolean;
  msg: string;
}

interface StoreValue {
  cash: number;
  holdings: Holding[];
  orders: Order[];
  toast: Toast | null;
  buy: (stockId: string, qty: number, price: number) => ActionResult;
  sell: (stockId: string, qty: number, price: number) => ActionResult;
  deposit: (amount: number) => ActionResult;
  withdraw: (amount: number) => ActionResult;
  clearToast: () => void;
}

const StoreContext = createContext<StoreValue | null>(null);

let toastId = 0;

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cash, setCash] = useState(PORTFOLIO.cash);
  const [holdings, setHoldings] = useState<Holding[]>(HOLDINGS.map((h) => ({ ...h })));
  const [orders, setOrders] = useState<Order[]>([...ORDERS]);
  const [toast, setToast] = useState<Toast | null>(null);

  const notify = useCallback((text: string, tone: Toast['tone'] = 'success') => {
    const t = { id: ++toastId, text, tone };
    setToast(t);
    setTimeout(() => {
      setToast((cur) => (cur && cur.id === t.id ? null : cur));
    }, 2800);
  }, []);

  const buy = useCallback(
    (stockId: string, qty: number, price: number): ActionResult => {
      if (qty <= 0) return { ok: false, msg: 'Enter a quantity' };
      const cost = qty * price;
      if (cost > cash) return { ok: false, msg: 'Insufficient buying power' };
      setCash((c) => c - cost);
      setHoldings((list) => {
        const existing = list.find((h) => h.stockId === stockId);
        if (existing) {
          const newShares = existing.shares + qty;
          const newAvg =
            (existing.shares * existing.avgPrice + qty * price) / newShares;
          return list.map((h) =>
            h.stockId === stockId ? { ...h, shares: newShares, avgPrice: newAvg } : h,
          );
        }
        return [...list, { stockId, shares: qty, avgPrice: price }];
      });
      const order: Order = {
        id: `o-${Date.now()}`,
        stockId,
        side: 'Buy',
        type: 'Market',
        qty,
        price,
        status: 'Completed',
        time: 'Just now',
      };
      setOrders((o) => [order, ...o]);
      notify(`Bought ${qty} share${qty > 1 ? 's' : ''} · ₦${cost.toLocaleString()}`);
      return { ok: true, msg: 'Order filled' };
    },
    [cash, notify],
  );

  const sell = useCallback(
    (stockId: string, qty: number, price: number): ActionResult => {
      if (qty <= 0) return { ok: false, msg: 'Enter a quantity' };
      const existing = holdings.find((h) => h.stockId === stockId);
      if (!existing || existing.shares < qty)
        return { ok: false, msg: 'Not enough shares to sell' };
      const proceeds = qty * price;
      setCash((c) => c + proceeds);
      setHoldings((list) =>
        list
          .map((h) =>
            h.stockId === stockId ? { ...h, shares: h.shares - qty } : h,
          )
          .filter((h) => h.shares > 0),
      );
      const order: Order = {
        id: `o-${Date.now()}`,
        stockId,
        side: 'Sell',
        type: 'Market',
        qty,
        price,
        status: 'Completed',
        time: 'Just now',
      };
      setOrders((o) => [order, ...o]);
      notify(`Sold ${qty} share${qty > 1 ? 's' : ''} · +₦${proceeds.toLocaleString()}`);
      return { ok: true, msg: 'Order filled' };
    },
    [holdings, notify],
  );

  const deposit = useCallback(
    (amount: number): ActionResult => {
      if (amount <= 0) return { ok: false, msg: 'Enter an amount' };
      setCash((c) => c + amount);
      notify(`Deposit successful · +₦${amount.toLocaleString()}`);
      return { ok: true, msg: 'Deposited' };
    },
    [notify],
  );

  const withdraw = useCallback(
    (amount: number): ActionResult => {
      if (amount <= 0) return { ok: false, msg: 'Enter an amount' };
      if (amount > cash) return { ok: false, msg: 'Amount exceeds cash balance' };
      setCash((c) => c - amount);
      notify(`Withdrawal successful · -₦${amount.toLocaleString()}`, 'info');
      return { ok: true, msg: 'Withdrawn' };
    },
    [cash, notify],
  );

  const clearToast = useCallback(() => setToast(null), []);

  const value = useMemo<StoreValue>(
    () => ({ cash, holdings, orders, toast, buy, sell, deposit, withdraw, clearToast }),
    [cash, holdings, orders, toast, buy, sell, deposit, withdraw, clearToast],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
