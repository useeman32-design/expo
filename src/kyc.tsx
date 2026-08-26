import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import type { KycState, KycStep } from '@/types';
import { INITIAL_KYC } from '@/services/kyc';

/**
 * KYC context — mirrors what the backend KYC module will expose.
 * verify(step) simulates the provider round-trip (BVN→NIBSS, NIN→NIMC,
 * doc+liveness→Smile ID/Dojah). In production each call would POST to
 * /api/kyc/{step} and the status would come back via webhook.
 */
interface KycValue {
  ready: boolean;
  kyc: KycState;
  /** true when the full Tier 3 flow is complete */
  verified: boolean;
  /** current step the user should do next */
  nextStep: KycStep | null;
  verify: (step: KycStep, detail?: { phone?: string }) => Promise<boolean>;
  reset: () => Promise<void>;
}

const KEY = '@stocksx/kyc';
const KycContext = createContext<KycValue | null>(null);

export function KycProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [kyc, setKyc] = useState<KycState>(INITIAL_KYC);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(KEY);
        if (raw && mounted) setKyc(JSON.parse(raw) as KycState);
      } catch {
        /* ignore */
      } finally {
        if (mounted) setReady(true);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const persist = (next: KycState) => {
    setKyc(next);
    AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => undefined);
  };

  const verify = async (step: KycStep, detail?: { phone?: string }) => {
    // simulate provider latency
    await new Promise((r) => setTimeout(r, 900));
    const next: KycState = { ...kyc, updatedAt: new Date().toISOString() };
    if (step === 'bvn') {
      next.bvnVerified = true;
      if (detail?.phone) next.phone = detail.phone;
    }
    if (step === 'nin') next.ninVerified = true;
    if (step === 'document') next.documentVerified = true;
    persist(next);
    return true;
  };

  const reset = async () => {
    persist(INITIAL_KYC);
  };

  const nextStep: KycStep | null = !kyc.bvnVerified
    ? 'bvn'
    : !kyc.ninVerified
      ? 'nin'
      : !kyc.documentVerified
        ? 'document'
        : null;

  const value: KycValue = {
    ready,
    kyc,
    verified: kyc.documentVerified && kyc.bvnVerified && kyc.ninVerified,
    nextStep,
    verify,
    reset,
  };

  return <KycContext.Provider value={value}>{children}</KycContext.Provider>;
}

export function useKyc(): KycValue {
  const ctx = useContext(KycContext);
  if (!ctx) throw new Error('useKyc must be used within KycProvider');
  return ctx;
}
