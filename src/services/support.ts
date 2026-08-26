import type { Dividend, FaqItem } from '@/types';

/** Dividend history (mock). Production: corporate-actions webhook from the broker adapter. */
export const DIVIDENDS: Dividend[] = [
  {
    id: 'd1',
    ticker: 'BUACEMENT',
    name: 'BUA Cement Plc',
    declared: '12 Aug',
    payDate: '23 Aug',
    shares: 7_400,
    perShare: 2.5,
    total: 18_500,
    status: 'Paid',
  },
  {
    id: 'd2',
    ticker: 'ZENITHBANK',
    name: 'Zenith Bank Plc',
    declared: '28 Jul',
    payDate: '15 Aug',
    shares: 3_000,
    perShare: 4.0,
    total: 12_000,
    status: 'Paid',
  },
  {
    id: 'd3',
    ticker: 'DANGCEM',
    name: 'Dangote Cement Plc',
    declared: '20 Jul',
    payDate: '09 Aug',
    shares: 50,
    perShare: 30.0,
    total: 1_500,
    status: 'Paid',
  },
  {
    id: 'd4',
    ticker: 'MTNN',
    name: 'MTN Nigeria Plc',
    declared: '02 Aug',
    payDate: '30 Aug',
    shares: 200,
    perShare: 5.6,
    total: 1_120,
    status: 'Processing',
  },
];

/** FAQ (mock). Production: /api/support/faq so answers update without an app release. */
export const FAQS: FaqItem[] = [
  {
    id: 'f1',
    category: 'Account',
    q: 'Why do I need to verify my identity (KYC)?',
    a: 'Nigerian law requires every investment platform to verify users before trading. Tier 1 (BVN) unlocks funding; Tier 2 (NIN) raises your limits; Tier 3 (valid ID + selfie) unlocks withdrawals. Verification usually completes in minutes.',
  },
  {
    id: 'f2',
    category: 'Payments',
    q: 'How long do deposits take to arrive?',
    a: 'Card deposits are instant. Bank transfers to your dedicated account number are credited after confirmation — usually within 5 minutes during banking hours. USSD is instant.',
  },
  {
    id: 'f3',
    category: 'Payments',
    q: 'How long do withdrawals take?',
    a: 'Withdrawals to a verified bank account are processed same-day on business days, typically within 2–4 hours. Funds appear instantly once your bank posts them.',
  },
  {
    id: 'f4',
    category: 'Trading',
    q: 'When do my shares actually appear in my portfolio?',
    a: 'NGX trades settle on a T+3 cycle (trade date plus three business days). Your order shows as Pending while the broker executes, then Settled once shares are credited to your CSCS account.',
  },
  {
    id: 'f5',
    category: 'Trading',
    q: 'What fees do I pay?',
    a: 'Buy/sell commission is 1.35% (SEC, NGX, CSCS, stamp duty and transfer fees included). Deposits by bank transfer are free; card deposits cost 1.5% + ₦100 (the gateway fee). Withdrawals are free once per month.',
  },
  {
    id: 'f6',
    category: 'Sharia',
    q: 'What does the halal (Sharia-compliant) badge mean?',
    a: 'Stocks with the badge pass AAOIFI Standard 21 screening: debt below 33% of market value, non-halal revenue below 5%, and interest income below 5%. Banks and brewers are screened out. Purification and zakat calculators are coming.',
  },
  {
    id: 'f7',
    category: 'Security',
    q: 'Is my money safe?',
    a: 'Client funds sit in segregated trust accounts with our partner bank, separate from company money. Securities are held in your own CSCS account. We never lend out your shares.',
  },
  {
    id: 'f8',
    category: 'Account',
    q: 'Can I use StocksX outside Nigeria?',
    a: 'Yes — you can view markets and learn anywhere. Trading NGX stocks requires a BVN and a Nigerian bank account. US stocks require Tier 3 verification.',
  },
];
