import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View, type StyleProp, type TextStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { Svg, Defs, RadialGradient, Stop, Rect } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';

import { useAppearance } from '@/appearance';
import { useStore } from '@/store';
import { C } from '@/theme';
import { money, type Currency } from '@/utils';

/**
 * A money value that frosts over when the user hides their balances.
 *
 * The frost is a rounded blur patch inset over the digits, veiled by an
 * elliptical radial gradient that is fully opaque at the centre and fades to
 * nothing in every direction — so the patch has no visible shape or edge,
 * it simply dissolves into the card (the mature fintech treatment).
 */
export function HiddenAmount({
  value,
  currency = '₦',
  style,
  intensity = 18,
}: {
  value: number;
  currency?: Currency;
  style?: StyleProp<TextStyle>;
  intensity?: number;
}) {
  const { balanceHidden } = useStore();
  const { mode } = useAppearance();
  const dark = mode === 'dark';
  const [size, setSize] = useState({ w: 0, h: 0 });
  const scrim = dark ? '#0B0F0D' : '#F4F6F5';

  return (
    <View
      style={{ alignSelf: 'flex-start' }}
      pointerEvents={balanceHidden ? 'none' : 'auto'}
      onLayout={(e) => {
        const { width: w, height: h } = e.nativeEvent.layout;
        setSize((s) => (s.w === w && s.h === h ? s : { w, h }));
      }}
    >
      <Text style={style}>{money(value, currency)}</Text>
      {balanceHidden && size.w > 0 ? (
        <View style={frostStyles.layer} pointerEvents="none">
          {/* soft blur, inset and rounded — its edges sit under the dense
              part of the radial veil so no hard boundary shows */}
          <BlurView
            intensity={intensity}
            tint={dark ? 'dark' : 'light'}
            experimentalBlurMethod={Platform.OS === 'android' ? 'dimezisBlurView' : undefined}
            style={[
              frostStyles.blur,
              {
                marginHorizontal: Math.max(4, size.w * 0.07),
                marginVertical: Math.max(1, size.h * 0.06),
                borderRadius: Math.min(14, size.h / 2),
              },
            ]}
          />
          {/* elliptical veil: opaque centre → transparent at every edge */}
          <Svg width={size.w} height={size.h} style={frostStyles.svg}>
            <Defs>
              <RadialGradient id="sx-frost-veil" cx="50%" cy="50%" r="50%">
                <Stop offset="0%" stopColor={scrim} stopOpacity={0.98} />
                <Stop offset="45%" stopColor={scrim} stopOpacity={0.95} />
                <Stop offset="72%" stopColor={scrim} stopOpacity={0.75} />
                <Stop offset="100%" stopColor={scrim} stopOpacity={0} />
              </RadialGradient>
            </Defs>
            <Rect
              x="0"
              y="0"
              width={size.w}
              height={size.h}
              rx={Math.min(16, size.h / 2)}
              fill="url(#sx-frost-veil)"
            />
          </Svg>
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

/** Eye toggle for the hide/show balance state. `light` renders for green hero backgrounds. */
export function BalanceEyeButton({ light = false }: { light?: boolean }) {
  const { balanceHidden, toggleBalanceHidden } = useStore();
  return (
    <Pressable
      onPress={toggleBalanceHidden}
      hitSlop={10}
      accessibilityLabel={balanceHidden ? 'Show balances' : 'Hide balances'}
      accessibilityRole="button"
      style={({ pressed }) => [frostStyles.btn, pressed && { opacity: 0.6 }]}
    >
      <Ionicons
        name={balanceHidden ? 'eye-off-outline' : 'eye-outline'}
        size={17}
        color={light ? 'rgba(255,255,255,0.9)' : C.muted}
      />
    </Pressable>
  );
}

const frostStyles = StyleSheet.create({
  layer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  blur: {
    flex: 1,
    overflow: 'hidden',
  },
  svg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  btn: { padding: 4 },
});
