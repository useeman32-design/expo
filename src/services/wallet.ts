import type { BankAccount, WalletTransaction } from '@/types';

/**
 * Wallet domain service (mock).
 * Production: /api/wallet/transactions (double-entry ledger), /api/bank-accounts.
 * Deposits arrive as Paystack/Monnify webhook events; every entry carries the
 * gateway reference for reconciliation.
 */

export const BANKS: { name: string; code: string }[] = [
  { name: 'Access Bank', code: '044' },
  { name: 'Citibank', code: '023' },
  { name: 'Ecobank', code: '050' },
  { name: 'Fidelity Bank', code: '070' },
  { name: 'First Bank', code: '011' },
  { name: 'First City Monument Bank', code: '214' },
  { name: 'Guaranty Trust Bank', code: '058' },
  { name: 'Jaiz Bank', code: '301' },
  { name: 'Kuda Microfinance Bank', code: '502' },
  { name: 'Moniepoint MFB', code: '505' },
  { name: 'OPay Digital Services', code: '999' },
  { name: 'PalmPay', code: '503' },
  { name: 'Providus Bank', code: '101' },
  { name: 'Stanbic IBTC Bank', code: '221' },
  { name: 'Standard Chartered', code: '068' },
  { name: 'Sterling Bank', code: '232' },
  { name: 'Union Bank', code: '032' },
  { name: 'United Bank for Africa', code: '033' },
  { name: 'Unity Bank', code: '215' },
  { name: 'Wema Bank', code: '035' },
  { name: 'Zenith Bank', code: '057' },
];

export const BANK_ACCOUNTS: BankAccount[] = [
  {
    id: 'ba1',
    bankName: 'Guaranty Trust Bank',
    bankCode: '058',
    accountNumber: '0123456789',
    accountName: 'USMAN ABDULLAHI',
    isDefault: true,
  },
];

export const TRANSACTIONS: WalletTransaction[] = [
  {
    id: 'tx1',
    kind: 'deposit',
    amount: 100_000,
    balanceAfter: 482_450.2,
    method: 'Card · Paystack',
    reference: 'PSK-8H2K91XM',
    time: 'Today, 10:42 AM',
    status: 'Completed',
  },
  {
    id: 'tx2',
    kind: 'buy',
    amount: -55_000,
    balanceAfter: 382_450.2,
    method: 'Market order',
    reference: 'SX-ORD-8841',
    note: '200 × MTNN @ ₦275.00',
    ticker: 'MTNN',
    time: 'Today, 11:24 AM',
    status: 'Completed',
  },
  {
    id: 'tx3',
    kind: 'fee',
    amount: -742.5,
    balanceAfter: 381_707.7,
    method: 'Trade commission 1.35%',
    reference: 'SX-FEE-8841',
    note: 'Commission + NGX fees',
    ticker: 'MTNN',
    time: 'Today, 11:24 AM',
    status: 'Completed',
  },
  {
    id: 'tx4',
    kind: 'dividend',
    amount: 18_500,
    balanceAfter: 400_207.7,
    method: 'Corporate action',
    reference: 'NGX-DIV-2291',
    note: '₦2.50 per share · 7,400 shares',
    ticker: 'BUACEMENT',
    time: 'Yesterday, 08:00 AM',
    status: 'Completed',
  },
  {
    id: 'tx5',
    kind: 'withdrawal',
    amount: -25_000,
    balanceAfter: 381_707.7,
    method: 'Bank transfer · GTBank',
    reference: 'TRF-77120B',
    time: '22 Aug, 04:15 PM',
    status: 'Completed',
  },
  {
    id: 'tx6',
    kind: 'sell',
    amount: 63_600,
    balanceAfter: 406_707.7,
    method: 'Market order',
    reference: 'SX-ORD-8799',
    note: '1,200 × GTCO @ ₦53.00',
    ticker: 'GTCO',
    time: '21 Aug, 01:02 PM',
    status: 'Completed',
  },
  {
    id: 'tx7',
    kind: 'deposit',
    amount: 5_000,
    balanceAfter: 343_107.7,
    method: 'USSD · Flutterwave',
    reference: 'FLW-33KD19',
    time: '20 Aug, 09:33 AM',
    status: 'Completed',
  },
  {
    id: 'tx8',
    kind: 'buy',
    amount: -12_800,
    balanceAfter: 338_107.7,
    method: 'Market order',
    reference: 'SX-ORD-8712',
    note: '2,000 × JAIZBANK @ ₦6.40',
    ticker: 'JAIZBANK',
    time: '20 Aug, 11:30 AM',
    status: 'Completed',
  },
  {
    id: 'tx9',
    kind: 'refund',
    amount: 5_000,
    balanceAfter: 351_107.7,
    method: 'Card · Paystack',
    reference: 'PSK-2M88B1',
    note: 'Failed gateway charge reversed',
    time: '18 Aug, 07:21 PM',
    status: 'Completed',
  },
];

/** Deposit channels the production gateways expose. */
export const DEPOSIT_METHODS = [
  {
    id: 'card',
    title: 'Debit card',
    sub: 'Instant · 1.5% + ₦100 fee (Paystack)',
    icon: 'card-outline',
    color: '#0E8A57',
  },
  {
    id: 'transfer',
    title: 'Bank transfer',
    sub: 'Free · dedicated account number (Monnify)',
    icon: 'business-outline',
    color: '#1F7AE0',
  },
  {
    id: 'ussd',
    title: 'USSD',
    sub: 'No internet needed · 0.5% + ₦50 (Flutterwave)',
    icon: 'phone-portrait-outline',
    color: '#F6A623',
  },
] as const;
