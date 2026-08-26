import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { applyTheme, type ThemeMode } from '@/theme';

/**
 * Light / dark / system appearance with a persisted preference.
 *
 * applyTheme() mutates the live palette + refreshes every registered
 * StyleSheet synchronously during render (idempotent), and the root tree is
 * remounted with a new key (see _layout) so inline colors re-read too.
 */

export type ThemePref = ThemeMode | 'system';

const KEY = '@stocksx/theme';

function resolveSystem(): ThemeMode {
  try {
    return Appearance?.getColorScheme?.() === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

interface AppearanceValue {
  /** what the user picked: 'system' | 'light' | 'dark' */
  pref: ThemePref;
  /** the mode actually in effect right now */
  mode: ThemeMode;
  setPref: (p: ThemePref) => void;
}

const Ctx = createContext<AppearanceValue>({
  pref: 'system',
  mode: 'light',
  setPref: () => undefined,
});

export function AppearanceProvider({ children }: { children: ReactNode }) {
  const [pref, setPrefState] = useState<ThemePref>('system');
  const [mode, setMode] = useState<ThemeMode>(() => resolveSystem());

  // restore the persisted preference once
  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((v) => {
        if (v === 'light' || v === 'dark' || v === 'system') setPrefState(v);
      })
      .catch(() => undefined);
  }, []);

  // resolve pref -> mode (and follow the OS while on 'system')
  useEffect(() => {
    if (pref !== 'system') {
      setMode(pref);
      return;
    }
    setMode(resolveSystem());
    const sub = Appearance.addChangeListener(() => setMode(resolveSystem()));
    return () => sub.remove();
  }, [pref]);

  // apply synchronously during render (idempotent) so the remounted tree
  // below renders with the correct palette immediately
  applyTheme(mode);

  const value = useMemo<AppearanceValue>(
    () => ({
      pref,
      mode,
      setPref: (p: ThemePref) => {
        setPrefState(p);
        AsyncStorage.setItem(KEY, p).catch(() => undefined);
      },
    }),
    [pref, mode],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAppearance(): AppearanceValue {
  return useContext(Ctx);
}
