import { Stack } from 'expo-router';

import { C } from '@/theme';

export default function RootLayout() {
  return (
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
    </Stack>
  );
}
