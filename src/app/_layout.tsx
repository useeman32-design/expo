import { useEffect } from 'react';
import { ActivityIndicator, Platform, StyleSheet, Text, View } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';

import { C, F } from '@/theme';
import { StoreProvider } from '@/store';
import { AuthProvider, useAuth } from '@/auth';
import { KycProvider } from '@/kyc';
import { Toast } from '@/components/Toast';

// Web typography: self-hosted variable fonts (public/fonts), matching the
// StocksX web reference — Inter for text, Space Grotesk for display/numerals.
// One 48KB file covers every Inter weight (variable font); font-display:swap
// keeps text visible while they load. No CDN dependency — works offline.
if (Platform.OS === 'web' && typeof document !== 'undefined' && !document.getElementById('sx-webfonts')) {
  const base = (typeof process !== 'undefined' && process.env && process.env.EXPO_BASE_URL) || '';
  const style = document.createElement('style');
  style.id = 'sx-webfonts';
  style.textContent =
    `@font-face{font-family:'Inter';font-style:normal;font-display:swap;font-weight:100 900;` +
    `src:url('${base}/fonts/inter-var.woff2') format('woff2')}` +
    `@font-face{font-family:'Space Grotesk';font-style:normal;font-display:swap;font-weight:300 700;` +
    `src:url('${base}/fonts/space-grotesk-var.woff2') format('woff2')}`;
  document.head.appendChild(style);
}

/**
 * Guards the app based on auth state:
 *  - not onboarded  -> onboarding
 *  - onboarded, no user -> login
 *  - has user, but on an auth/onboarding screen -> tabs
 */
function useProtectedRoute(ready: boolean, onboarded: boolean, user: unknown) {
  const segments = useSegments();
  const router = useRouter();
  const root = segments[0] as string;

  useEffect(() => {
    if (!ready) return;
    const inOnboarding = root === 'onboarding';
    const inAuth = root === 'login' || root === 'register';
    if (!onboarded && !inOnboarding) {
      router.replace('/onboarding');
    } else if (onboarded && !user && !inAuth && !inOnboarding) {
      router.replace('/login');
    } else if (onboarded && user && (inAuth || inOnboarding)) {
      // only bounce out of auth screens when onboarding is done — otherwise
      // "replay onboarding" (onboarded=false + logged in) would ping-pong forever
      router.replace('/(tabs)');
    }
  }, [ready, onboarded, user, root, router]);
}

function Splash() {
  return (
    <View style={splash.wrap}>
      <View style={splash.dot}>
        <Text style={splash.letter}>S</Text>
      </View>
      <Text style={splash.name}>StocksX</Text>
      <ActivityIndicator color={C.green} style={{ marginTop: 18 }} />
    </View>
  );
}

function RootNavigator() {
  const { ready, onboarded, user } = useAuth();
  useProtectedRoute(ready, onboarded, user);

  if (!ready) return <Splash />;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: C.canvas },
      }}
    >
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
      <Stack.Screen name="login" options={{ animation: 'fade' }} />
      <Stack.Screen name="register" options={{ animation: 'fade' }} />
      <Stack.Screen name="stock/[id]" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="lesson/[id]" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="orders" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="notifications" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="settings" options={{ animation: 'slide_from_right' }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <KycProvider>
        <StoreProvider>
          <RootNavigator />
          <Toast />
        </StoreProvider>
      </KycProvider>
    </AuthProvider>
  );
}

const splash = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: C.canvas, alignItems: 'center', justifyContent: 'center' },
  dot: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: C.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  letter: { color: C.white, fontFamily: F.sans, fontSize: 30, fontWeight: '900' },
  name: {
    color: C.ink,
    fontFamily: F.sans,
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.3,
    marginTop: 16,
  },
});
