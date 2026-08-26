import { Platform, Pressable, StyleSheet, Text, View, type StyleProp, type TextStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { useAppearance } from '@/appearance';
import { useStore } from '@/store';
import { C } from '@/theme';
import { money, type Currency } from '@/utils';

/**
 * A money value that frosts over when the user hides their balances:
 * a real blur layer plus a centre-weighted gradient scrim, so the digits are
 * unreadable in the middle while the patch *fades out* towards the edges —
 * the polished treatment used by mature fintech apps.
 */
export function HiddenAmount({
  value,
  currency = '₦',
  style,
  intensity = 24,
}: {
  value: number;
  currency?: Currency;
  style?: StyleProp<TextStyle>;
  intensity?: number;
}) {
  const { balanceHidden } = useStore();
  const { mode } = useAppearance();
  const dark = mode === 'dark';
  const scrim = dark ? 'rgba(11,15,13,0.6)' : 'rgba(244,246,245,0.62)';
  return (
    <View style={{ alignSelf: 'flex-start' }} pointerEvents={balanceHidden ? 'none' : 'auto'}>
      <Text style={style}>{money(value, currency)}</Text>
      {balanceHidden ? (
        <View style={styles.frost} pointerEvents="none">
          <BlurView
            intensity={intensity}
            tint={dark ? 'dark' : 'light'}
            experimentalBlurMethod={Platform.OS === 'android' ? 'dimezisBlurView' : undefined}
            style={styles.frost}
          />
          {/* centre-weighted scrim: opaque over the digits, fading to nothing
              at the edges so the frost blends into the card */}
          <LinearGradient
            colors={['rgba(0,0,0,0)', scrim, scrim, 'rgba(0,0,0,0)']}
            locations={[0, 0.22, 0.78, 1]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.frost}
          />
        </View>
      ) : null}
    </View>
  );
}

/**
 * Secondary amounts (buying power, cash in/out, holding values…) — masked
 * with stars instead of a blur, matching the main-balance treatment.
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

/**
 * P/L amounts — when balances are hidden, only the percentage is shown
 * (money amount masked with stars).
 */
export function HiddenPlOrPct({
  amount,
  pctText,
  style,
}: {
  amount: number;
  pctText: string;
  style?: StyleProp<TextStyle>;
}) {
  const { balanceHidden } = useStore();
  return (
    <Text style={style}>{balanceHidden ? pctText : money(amount)}</Text>
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
  frost: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  btn: { padding: 4 },
});
