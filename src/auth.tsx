import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type AuthProvider = 'google' | 'apple' | 'email';

export interface SessionUser {
  name: string;
  email: string;
  provider: AuthProvider;
  guest?: boolean;
}

interface AuthValue {
  ready: boolean;
  onboarded: boolean;
  user: SessionUser | null;
  completeOnboarding: () => Promise<void>;
  resetOnboarding: () => Promise<void>;
  signInWith: (provider: AuthProvider) => Promise<void>;
  signInEmail: (email: string, name?: string) => Promise<void>;
  register: (name: string, email: string) => Promise<void>;
  continueAsGuest: () => Promise<void>;
  signOut: () => Promise<void>;
}

const KEY_ONBOARDED = '@stocksx/onboarded';
const KEY_USER = '@stocksx/user';

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [onboarded, setOnboarded] = useState(false);
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [ob, raw] = await Promise.all([
          AsyncStorage.getItem(KEY_ONBOARDED),
          AsyncStorage.getItem(KEY_USER),
        ]);
        if (!mounted) return;
        setOnboarded(ob === '1');
        if (raw) setUser(JSON.parse(raw) as SessionUser);
      } catch {
        /* ignore storage errors */
      } finally {
        if (mounted) setReady(true);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const persist = async (u: SessionUser) => {
    setUser(u);
    try {
      await AsyncStorage.setItem(KEY_USER, JSON.stringify(u));
    } catch {
      /* ignore */
    }
  };

  const completeOnboarding = async () => {
    setOnboarded(true);
    try {
      await AsyncStorage.setItem(KEY_ONBOARDED, '1');
    } catch {
      /* ignore */
    }
  };

  /**
   * Clears the onboarding flag AND the session so the intro slides play again
   * from the top (fresh-install experience: onboarding -> Get Started -> login).
   */
  const resetOnboarding = async () => {
    setOnboarded(false);
    setUser(null);
    try {
      await Promise.all([AsyncStorage.removeItem(KEY_ONBOARDED), AsyncStorage.removeItem(KEY_USER)]);
    } catch {
      /* ignore */
    }
  };;

  const signInWith = async (provider: AuthProvider) => {
    const u: SessionUser =
      provider === 'google'
        ? { name: 'Aisha Bello', email: 'aisha@gmail.com', provider }
        : { name: 'Aisha Bello', email: 'aisha@icloud.com', provider };
    await persist(u);
  };

  const signInEmail = async (email: string, name?: string) => {
    await persist({
      name: name || email.split('@')[0] || 'Investor',
      email,
      provider: 'email',
    });
  };

  const register = async (name: string, email: string) => {
    await persist({ name, email, provider: 'email' });
  };

  const continueAsGuest = async () => {
    await persist({ name: 'Guest', email: 'guest@stocksx.app', provider: 'email', guest: true });
  };

  const signOut = async () => {
    setUser(null);
    try {
      await AsyncStorage.removeItem(KEY_USER);
    } catch {
      /* ignore */
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ready,
        onboarded,
        user,
        completeOnboarding,
        resetOnboarding,
        signInWith,
        signInEmail,
        register,
        continueAsGuest,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
