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
export type OrderStatus = 'Open' | 'Completed' | 'Cancelled';

export interface Order {
  id: string;
  stockId: string;
  side: OrderSide;
  type: OrderType;
  qty: number;
  price: number;
  status: OrderStatus;
  time: string;
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
