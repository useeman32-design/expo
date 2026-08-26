import { Platform, Pressable, StyleSheet, Text, View, type StyleProp, type TextStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';

import { useStore } from '@/store';
import { C } from '@/theme';
import { money, type Currency } from '@/utils';

/**
 * A money value that frosts over (real blur, WhatsApp-style) when the user
 * hides their balances. The blur layer sits directly on top of the text inside
 * the same view hierarchy, so it blurs the digits themselves.
 */
export function HiddenAmount({
  value,
  currency = '₦',
  style,
  intensity = 16,
}: {
  value: number;
  currency?: Currency;
  style?: StyleProp<TextStyle>;
  intensity?: number;
}) {
  const { balanceHidden } = useStore();
  return (
    <View style={{ alignSelf: 'flex-start' }} pointerEvents={balanceHidden ? 'none' : 'auto'}>
      <Text style={style}>{money(value, currency)}</Text>
      {balanceHidden ? (
        <>
          <BlurView
            intensity={intensity}
            tint="default"
            experimentalBlurMethod={Platform.OS === 'android' ? 'dimezisBlurView' : undefined}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />
          {/* subtle scrim so the digits stay unreadable even where the blur
              layer falls back to a no-op */}
          <View
            style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(127,140,133,0.10)' }]}
            pointerEvents="none"
          />
        </>
      ) : null}
    </View>
  );
}

/** Eye toggle for the hide/show balance state. `light` renders for green hero backgrounds. */
export function BalanceEyeButton({ light = false }: { light?: boolean }) {
  const { balanceHidden, toggleBalanceHidden } = useStore();
  return (
    <Pressable
      onPress={toggleBalanceHidden}
      hitSlop={10}
      accessibilityLabel={balanceHidden ? 'Show balances' : 'Hide balances'}
      accessibilityRole="button"
      style={({ pressed }) => [styles.btn, pressed && { opacity: 0.6 }]}
    >
      <Ionicons
        name={balanceHidden ? 'eye-off-outline' : 'eye-outline'}
        size={17}
        color={light ? 'rgba(255,255,255,0.9)' : C.muted}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: { padding: 4 },
});
