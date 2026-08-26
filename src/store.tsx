import {
  createContext,
  useEffect,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Holding, Order, PriceAlert, TradeRule } from '@/types';
import { getStock } from '@/services/marketData';
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
  /** watchlist (persisted) */
  watchlist: string[];
  /** hide/show balances (persisted) — frosts money values across the app */
  balanceHidden: boolean;
  toggleBalanceHidden: () => void;
  toggleWatch: (stockId: string) => void;
  /** price alerts (persisted) */
  alerts: PriceAlert[];
  addAlert: (stockId: string, target: number, direction: 'above' | 'below') => ActionResult;
  removeAlert: (id: string) => void;
  toggleAlert: (id: string) => void;
  /** auto-trade rules (persisted) */
  rules: TradeRule[];
  addRule: (r: Omit<TradeRule, 'id' | 'createdAt' | 'active'>) => ActionResult;
  removeRule: (id: string) => void;
  toggleRule: (id: string) => void;
  buy: (stockId: string, qty: number, price: number) => ActionResult;
  sell: (stockId: string, qty: number, price: number) => ActionResult;
  deposit: (amount: number) => ActionResult;
  withdraw: (amount: number) => ActionResult;
  clearToast: () => void;
}

const StoreContext = createContext<StoreValue | null>(null);

let toastId = 0;
const KEY_WATCH = '@stocksx/watchlist';
const KEY_ALERTS = '@stocksx/alerts';
const KEY_RULES = '@stocksx/rules';
const KEY_BALANCE_HIDDEN = '@stocksx/balanceHidden';

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cash, setCash] = useState(PORTFOLIO.cash);
  const [holdings, setHoldings] = useState<Holding[]>(HOLDINGS.map((h) => ({ ...h })));
  const [orders, setOrders] = useState<Order[]>([...ORDERS]);
  const [toast, setToast] = useState<Toast | null>(null);
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [rules, setRules] = useState<TradeRule[]>([]);
  const [balanceHidden, setBalanceHidden] = useState(false);

  // restore + persist watchlist & alerts
  useEffect(() => {
    (async () => {
      try {
        const [w, a, rl, bh] = await Promise.all([
          AsyncStorage.getItem(KEY_WATCH),
          AsyncStorage.getItem(KEY_ALERTS),
          AsyncStorage.getItem(KEY_RULES),
          AsyncStorage.getItem(KEY_BALANCE_HIDDEN),
        ]);
        if (w) setWatchlist(JSON.parse(w) as string[]);
        if (a) setAlerts(JSON.parse(a) as PriceAlert[]);
        if (rl) setRules(JSON.parse(rl) as TradeRule[]);
        if (bh === '1') setBalanceHidden(true);
      } catch {
        /* ignore */
      }
    })();
  }, []);
  const toggleBalanceHidden = useCallback(() => {
    setBalanceHidden((h) => {
      AsyncStorage.setItem(KEY_BALANCE_HIDDEN, h ? '0' : '1').catch(() => undefined);
      return !h;
    });
  }, []);
  const persistWatch = (list: string[]) => {
    setWatchlist(list);
    AsyncStorage.setItem(KEY_WATCH, JSON.stringify(list)).catch(() => undefined);
  };
  const persistAlerts = (list: PriceAlert[]) => {
    setAlerts(list);
    AsyncStorage.setItem(KEY_ALERTS, JSON.stringify(list)).catch(() => undefined);
  };

  const notify = useCallback((text: string, tone: Toast['tone'] = 'success') => {
    const t = { id: ++toastId, text, tone };
    setToast(t);
    setTimeout(() => {
      setToast((cur) => (cur && cur.id === t.id ? null : cur));
    }, 2800);
  }, []);

  const toggleWatch = useCallback(
    (stockId: string) => {
      const has = watchlist.includes(stockId);
      persistWatch(has ? watchlist.filter((x) => x !== stockId) : [...watchlist, stockId]);
      notify(has ? 'Removed from watchlist' : 'Added to watchlist', 'info');
    },
    [watchlist, notify],
  );

  const addAlert = useCallback(
    (stockId: string, target: number, direction: 'above' | 'below'): ActionResult => {
      if (!(target > 0)) return { ok: false, msg: 'Enter a target price' };
      const s = getStock(stockId);
      if (!s) return { ok: false, msg: 'Stock not found' };
      const alert: PriceAlert = {
        id: `al-${Date.now()}`,
        stockId,
        ticker: s.ticker,
        name: s.name,
        targetPrice: target,
        direction,
        currentPrice: s.price,
        active: true,
        createdAt: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
      };
      persistAlerts([alert, ...alerts]);
      notify(`Alert set · ${s.ticker} ${direction === 'above' ? 'above' : 'below'} ₦${target.toLocaleString()}`);
      return { ok: true, msg: 'Alert created' };
    },
    [alerts, notify],
  );

  const persistRules = (list: TradeRule[]) => {
    setRules(list);
    AsyncStorage.setItem(KEY_RULES, JSON.stringify(list)).catch(() => undefined);
  };

  const addRule = useCallback(
    (r: Omit<TradeRule, 'id' | 'createdAt' | 'active'>): ActionResult => {
      if (!(r.qty > 0)) return { ok: false, msg: 'Enter a quantity' };
      if (!(r.price > 0)) return { ok: false, msg: 'Enter a trigger price' };
      if (r.side === 'Buy' && r.qty * r.price > cash)
        return { ok: false, msg: 'Cost exceeds your available cash' };
      const rule: TradeRule = {
        ...r,
        id: `ru-${Date.now()}`,
        active: true,
        createdAt: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
      };
      persistRules([rule, ...rules]);
      notify(
        `Position armed · ${r.side} ${r.qty} ${r.ticker} when ${r.trigger === 'above' ? 'above' : 'below'} ₦${r.price.toLocaleString()}`,
      );
      return { ok: true, msg: 'Rule created' };
    },
    [rules, cash, notify],
  );

  const removeRule = useCallback(
    (id: string) => persistRules(rules.filter((r) => r.id !== id)),
    [rules],
  );

  const toggleRule = useCallback(
    (id: string) =>
      persistRules(rules.map((r) => (r.id === id ? { ...r, active: !r.active } : r))),
    [rules],
  );

  const removeAlert = useCallback(
    (id: string) => persistAlerts(alerts.filter((a) => a.id !== id)),
    [alerts],
  );

  const toggleAlert = useCallback(
    (id: string) =>
      persistAlerts(alerts.map((a) => (a.id === id ? { ...a, active: !a.active } : a))),
    [alerts],
  );

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
    () => ({
      cash, holdings, orders, toast,
      watchlist, toggleWatch,
      balanceHidden, toggleBalanceHidden,
      alerts, addAlert, removeAlert, toggleAlert,
      rules, addRule, removeRule, toggleRule,
      buy, sell, deposit, withdraw, clearToast,
    }),
    [
      cash, holdings, orders, toast,
      watchlist, toggleWatch,
      balanceHidden, toggleBalanceHidden,
      alerts, addAlert, removeAlert, toggleAlert,
      rules, addRule, removeRule, toggleRule,
      buy, sell, deposit, withdraw, clearToast,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
