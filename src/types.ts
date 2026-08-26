export type Market = 'NGX' | 'US';
export type Currency = 'NGN' | 'USD';

export interface NewsItem {
  id: string;
  source: string;
  title: string;
  time: string;
}

export interface Stock {
  id: string;
  ticker: string;
  name: string;
  market: Market;
  currency: Currency;
  price: number;
  prevClose: number;
  changePct: number;
  changeAbs: number;
  sector: string;
  color: string;
  tvSymbol: string;
  spark: number[];
  // fundamentals
  open: number;
  high: number;
  low: number;
  volume: number;
  marketCap: number;
  peRatio: number;
  divYield: number;
  about: string;
  news: NewsItem[];
  trending?: boolean;
  active?: boolean;
}

export interface MarketIndex {
  id: string;
  name: string;
  short: string;
  value: number;
  changePct: number;
  spark: number[];
}

export interface Holding {
  stockId: string;
  shares: number;
  avgPrice: number;
}

export type OrderSide = 'Buy' | 'Sell';
export type OrderType = 'Market' | 'Limit';
export type OrderStatus = 'Open' | 'Completed' | 'Settled' | 'Cancelled';

export interface Order {
  id: string;
  stockId: string;
  side: OrderSide;
  type: OrderType;
  qty: number;
  price: number;
  status: OrderStatus;
  time: string;
  // lifecycle / receipt details (production: from the broker adapter)
  filledPrice?: number;
  settlementDate?: string; // T+3
  fee?: number;
  reference?: string;
  cscs?: string; // CSCS account number
}

export interface Course {
  id: string;
  title: string;
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  minutes: number;
  readTime?: string;
  progress: number; // 0..100
  color: string;
  icon: string;
  blurb: string;
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  minutes: number;
  body: string[];
  takeaways: string[];
}

export interface GlossaryTerm {
  ha: string;
  en: string;
  meaning: string;
}

export type NotificationKind = 'price' | 'order' | 'news' | 'system';

export interface NotificationItem {
  id: string;
  kind: NotificationKind;
  icon: string;
  color: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
  ticker?: string;
}

/* ================= KYC / Verification ================= */

export type KycTier = 1 | 2 | 3;
export type KycStep = 'bvn' | 'nin' | 'document';

export interface KycState {
  tier: KycTier; // highest completed tier
  bvnVerified: boolean;
  ninVerified: boolean;
  documentVerified: boolean;
  phone: string;
  updatedAt: string | null;
}

/* ================= Wallet ledger ================= */

export type TxKind =
  | 'deposit'
  | 'withdrawal'
  | 'buy'
  | 'sell'
  | 'dividend'
  | 'fee'
  | 'refund';

export interface WalletTransaction {
  id: string;
  kind: TxKind;
  amount: number; // signed: + credit, - debit
  balanceAfter: number;
  method?: string; // Card · Paystack, Bank Transfer, USSD, ...
  reference: string;
  note?: string;
  ticker?: string;
  time: string;
  status: 'Completed' | 'Pending' | 'Failed';
}

/* ================= Bank accounts ================= */

export interface BankAccount {
  id: string;
  bankName: string;
  bankCode: string;
  accountNumber: string;
  accountName: string;
  isDefault: boolean;
}

/* ================= Dividends ================= */

export interface Dividend {
  id: string;
  ticker: string;
  name: string;
  declared: string; // declaration date
  payDate: string;
  shares: number;
  perShare: number; // NGN
  total: number;
  status: 'Paid' | 'Processing';
}

/* ================= Price alerts ================= */

export interface PriceAlert {
  id: string;
  stockId: string;
  ticker: string;
  name: string;
  targetPrice: number;
  direction: 'above' | 'below';
  currentPrice: number;
  active: boolean;
  createdAt: string;
}

/* ================= Support ================= */

export interface FaqItem {
  id: string;
  q: string;
  a: string;
  category: 'Account' | 'Trading' | 'Payments' | 'Security' | 'Sharia';
}

/* ================= Auto-trade rules ================= */

/**
 * A user-defined conditional trade: when the stock price crosses the trigger,
 * the platform places the order automatically (market order at next available
 * price). Buy entries below a price behave like resting limit orders on NGX;
 * sell triggers act as stop-loss / take-profit.
 */
export interface TradeRule {
  id: string;
  stockId: string;
  ticker: string;
  name: string;
  side: OrderSide;
  trigger: 'above' | 'below';
  price: number;
  qty: number;
  active: boolean;
  createdAt: string;
  lastTriggered?: string;
}
