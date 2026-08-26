import { createElement, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View, type StyleProp, type TextStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';

import { useAppearance } from '@/appearance';
import { useStore } from '@/store';
import { C } from '@/theme';
import { money, type Currency } from '@/utils';

/**
 * A money value that frosts over when the user hides their balances.
 *
 * The frost is rebuilt around the digits themselves:
 *  - the patch is exactly the width of the number plus a slim margin,
 *    so its length always follows the balance;
 *  - a backdrop blur covers the WHOLE text box — every digit is inside
 *    the full-strength region, nothing peeks out;
 *  - the blur is feathered with a mask built from two linear gradients
 *    (horizontal + vertical, intersected), so the edges dissolve away in
 *    all directions and the corners fall off twice as fast — a soft,
 *    rounded fog with no visible shape boundary;
 *  - a faint white sheen rides on the same mask for the glass read.
 *    No opaque colour fill anywhere.
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

  // patch geometry: digits + a slim margin on each side
  const padX = Math.max(14, Math.round(size.w * 0.06));
  const padY = Math.max(7, Math.round(size.h * 0.18));
  const W = size.w + padX * 2;
  const H = size.h + padY * 2;
  const rx = Math.round(Math.min(H / 2, 16));

  // feather widths — strictly inside the padding, so the digits always
  // sit in the opaque core of the mask (full-strength blur)
  const fx = Math.max(6, padX - 4);
  const fy = Math.max(4, padY - 3);
  const sheen = dark ? 0.14 : 0.35;

  // two edge-fades intersected => soft rounded rectangle: sides fade over
  // fx/fy px, corners (where both fades apply) fall off faster still
  const feather = [
    `linear-gradient(to right, transparent 0px, #000 ${fx}px, #000 calc(100% - ${fx}px), transparent 100%)`,
    `linear-gradient(to bottom, transparent 0px, #000 ${fy}px, #000 calc(100% - ${fy}px), transparent 100%)`,
  ].join(', ');

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
          {Platform.OS === 'web' ? (
            <>
              {/* the blur — pure backdrop-filter, no colour fill, feathered by the mask */}
              {createElement('div', {
                style: {
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: W,
                  height: H,
                  borderRadius: rx, // graceful fallback if masks unsupported
                  backdropFilter: 'blur(16px) saturate(150%)',
                  WebkitBackdropFilter: 'blur(16px) saturate(150%)',
                  maskImage: feather,
                  WebkitMaskImage: feather,
                  maskComposite: 'intersect',
                  WebkitMaskComposite: 'source-in',
                },
              })}
              {/* the glass sheen — same mask, so it dissolves with the blur */}
              {createElement('div', {
                style: {
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: W,
                  height: H,
                  borderRadius: rx,
                  backgroundColor: `rgba(255,255,255,${sheen})`,
                  maskImage: feather,
                  WebkitMaskImage: feather,
                  maskComposite: 'intersect',
                  WebkitMaskComposite: 'source-in',
                },
              })}
            </>
          ) : (
            <>
              <BlurView
                intensity={40}
                tint="default"
                experimentalBlurMethod={Platform.OS === 'android' ? 'dimezisBlurView' : undefined}
                style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: rx, overflow: 'hidden' }}
              />
              <View
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  borderRadius: rx,
                  backgroundColor: `rgba(255,255,255,${sheen})`,
                }}
              />
            </>
          )}
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
