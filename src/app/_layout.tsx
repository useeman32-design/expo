import { Stack } from 'expo-router';

import { C } from '@/theme';
import { StoreProvider } from '@/store';
import { Toast } from '@/components/Toast';

export default function RootLayout() {
  return (
    <StoreProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: C.canvas },
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="stock/[id]" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="lesson/[id]" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="orders" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="notifications" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="settings" options={{ animation: 'slide_from_right' }} />
      </Stack>
      <Toast />
    </StoreProvider>
  );
}
