import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { C } from '@/theme';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: C.bg0 },
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="stock/[id]" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="lesson/[id]" options={{ animation: 'slide_from_right' }} />
      </Stack>
    </>
  );
}
