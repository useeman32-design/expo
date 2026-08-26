import type { KycState, KycStep, KycTier } from '@/types';

/**
 * KYC domain service (mock).
 * In production each verify call hits the backend, which itself calls the
 * KYC provider (Dojah / Smile ID) — BVN (NIBSS), NIN (NIMC), then document
 * + liveness selfie. Tier gating matches CBN KYC tiers.
 */

export const INITIAL_KYC: KycState = {
  tier: 1,
  bvnVerified: false,
  ninVerified: false,
  documentVerified: false,
  phone: '',
  updatedAt: null,
};

export const KYC_TIERS: {
  tier: KycTier;
  step: KycStep;
  title: string;
  unlocks: string;
  icon: string;
  color: string;
}[] = [
  {
    tier: 1,
    step: 'bvn',
    title: 'Bank Verification Number',
    unlocks: 'Wallet funding up to ₦50,000 and price alerts',
    icon: 'finger-print-outline',
    color: '#0E8A57',
  },
  {
    tier: 2,
    step: 'nin',
    title: 'National Identity Number',
    unlocks: 'Deposits up to ₦500,000 and unlimited buying power',
    icon: 'id-card-outline',
    color: '#F6A623',
  },
  {
    tier: 3,
    step: 'document',
    title: 'Valid ID + selfie',
    unlocks: 'Withdrawals, limit orders and US stocks',
    icon: 'person-circle-outline',
    color: '#7C5CFF',
  },
];

export function tierComplete(kyc: KycState): boolean {
  return kyc.documentVerified;
}

export function maxTier(kyc: KycState): KycTier {
  if (kyc.documentVerified) return 3;
  if (kyc.ninVerified) return 2;
  return 1;
}

export const DEPOSIT_LIMITS: Record<KycTier, number> = {
  1: 50_000,
  2: 500_000,
  3: 100_000_000,
};

/** Simulates a provider check. BVN is 11 digits, NIN is 11 digits. */
export function validateBvn(bvn: string): boolean {
  return /^\d{11}$/.test(bvn.trim());
}

export function validateNin(nin: string): boolean {
  return /^\d{11}$/.test(nin.trim());
}

export function validatePhone(phone: string): boolean {
  return /^0\d{10}$/.test(phone.trim()) || /^\+?234\d{10}$/.test(phone.trim());
}
