import { createElement, useState } from 'react';
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
 * The frost is a rounded glass pill that OVERSHOOTS the digits on every
 * side (so no number peeks out) and is made of a pure backdrop blur —
 * no opaque colour fill — plus a feathered white glass sheen and a
 * hairline rim. It reads as frosted glass floating over the balance,
 * not a coloured rectangle.
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
  const { mode } = useAppearance();
  const dark = mode === 'dark';
  const [size, setSize] = useState({ w: 0, h: 0 });

  // pill geometry — the patch overshoots the digits generously on every
  // side; that padding ring is where the blur + sheen fade to nothing,
  // so every digit sits inside the full-strength core
  const padX = Math.max(18, Math.round(size.w * 0.14));
  const padY = Math.max(6, Math.round(size.h * 0.18));
  const W = size.w + padX * 2;
  const H = size.h + padY * 2;
  const rx = Math.round(Math.min(H / 2, 18));

  // glass sheen strength per theme (feathered, no rim — edges must vanish)
  const sheen = dark ? 0.16 : 0.38;

  // the blur is feathered with a radial mask: fully applied over the text
  // (core ~78%), dissolving to nothing at the patch boundary in every
  // direction — no visible shape edge anywhere
  const featherMask =
    'radial-gradient(ellipse closest-side at 50% 50%, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 78%, rgba(0,0,0,0.55) 90%, rgba(0,0,0,0) 100%)';

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
        <View
          style={{ position: 'absolute', left: -padX, top: -padY, width: W, height: H }}
          pointerEvents="none"
        >
          {/* pure backdrop blur, feathered by a radial mask so the blur
              itself fades out in every direction — tint-free on web
              (expo-blur always paints a colour layer on web, which is
              what made it look like a patch) */}
          {Platform.OS === 'web' ? (
            createElement('div', {
              style: {
                position: 'absolute',
                top: 0,
                left: 0,
                width: W,
                height: H,
                borderRadius: rx, // graceful fallback if masks unsupported
                backdropFilter: 'blur(18px) saturate(160%)',
                WebkitBackdropFilter: 'blur(18px) saturate(160%)',
                maskImage: featherMask,
                WebkitMaskImage: featherMask,
              },
            })
          ) : (
            <BlurView
              intensity={40}
              tint="default"
              experimentalBlurMethod={Platform.OS === 'android' ? 'dimezisBlurView' : undefined}
              style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: rx, overflow: 'hidden' }}
            />
          )}

          {/* feathered glass sheen — soft white glow that dissolves with the blur */}
          <Svg width={W} height={H} style={{ position: 'absolute', top: 0, left: 0 }}>
            <Defs>
              <RadialGradient id="sx-frost-glass" cx="50%" cy="50%" r="50%">
                <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={sheen} />
                <Stop offset="60%" stopColor="#FFFFFF" stopOpacity={sheen} />
                <Stop offset="86%" stopColor="#FFFFFF" stopOpacity={sheen * 0.5} />
                <Stop offset="100%" stopColor="#FFFFFF" stopOpacity={0} />
              </RadialGradient>
            </Defs>
            <Rect x="0" y="0" width={W} height={H} rx={rx} fill="url(#sx-frost-glass)" />
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
  btn: { padding: 4 },
});
