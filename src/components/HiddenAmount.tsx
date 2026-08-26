import { Pressable, StyleSheet, Text, type StyleProp, type TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useStore } from '@/store';
import { C } from '@/theme';
import { money, type Currency } from '@/utils';
import { hapticTap } from '@/utils/haptics';

/**
 * A money value masked with stars when the user hides their balances —
 * `₦****`. Shared by the main balances (hero, wallet, portfolio total)
 * and secondary amounts alike.
 */
export function HiddenAmount({
  value,
  currency = '₦',
  style,
}: {
  value: number;
  currency?: Currency;
  style?: StyleProp<TextStyle>;
}) {
  const { balanceHidden } = useStore();
  return (
    <Text style={style}>{balanceHidden ? `${currency}****` : money(value, currency)}</Text>
  );
}

/**
 * Secondary amounts (buying power, cash in/out, holding values…) — masked
 * with stars exactly like the main balances.
 */
export function HiddenStars({
  value,
  currency = '₦',
  style,
}: {
  value: number;
  currency?: Currency;
  style?: StyleProp<TextStyle>;
}) {
  const { balanceHidden } = useStore();
  return (
    <Text style={style}>{balanceHidden ? `${currency}****` : money(value, currency)}</Text>
  );
}

/** Eye toggle for the hide/show balance state. `light` renders for green hero backgrounds. */
export function BalanceEyeButton({ light = false }: { light?: boolean }) {
  const { balanceHidden, toggleBalanceHidden } = useStore();
  return (
    <Pressable
      onPress={() => {
        hapticTap();
        toggleBalanceHidden();
      }}
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
