import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';

import { C, F } from '@/theme';
import { StoreProvider } from '@/store';
import { AuthProvider, useAuth } from '@/auth';
import { Toast } from '@/components/Toast';

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
    } else if (user && (inAuth || inOnboarding)) {
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
      <StoreProvider>
        <RootNavigator />
        <Toast />
      </StoreProvider>
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
