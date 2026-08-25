import { useEffect, useRef } from 'react';
import { Animated, Easing, Modal, Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Svg, Circle, Path } from 'react-native-svg';

import { C, F, R, S, SH } from '@/theme';

export function Sheet({
  visible,
  onClose,
  title,
  children,
  overlay,
}: {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  overlay?: React.ReactNode;
}) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.handle} />
        {title ? (
          <View style={styles.head}>
            <Text style={styles.title}>{title}</Text>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={C.muted} />
            </Pressable>
          </View>
        ) : null}
        {children}
      </View>
      {overlay}
    </Modal>
  );
}

export function SheetRow({
  label,
  value,
  valueColor,
  style,
}: {
  label: string;
  value: string;
  valueColor?: string;
  style?: ViewStyle;
}) {
  return (
    <View style={[styles.row, style]}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, valueColor ? { color: valueColor } : null]}>{value}</Text>
    </View>
  );
}

/**
 * Result animation shown inside a Sheet via the `overlay` prop.
 * A ring rolls (rotates) while it draws, then transforms into a filled badge
 * and a check (success) or an X (failure) is drawn — then calls onDone.
 */
const ACircle = Animated.createAnimatedComponent(Circle);
const APath = Animated.createAnimatedComponent(Path) as any;
const RING_R = 44;
const RING_CIRC = 2 * Math.PI * RING_R;
const CHECK_PATH = 'M30 52 L44 65 L72 36';
const CROSS_PATH = 'M36 37 L64 63 M64 37 L36 63';

export function SuccessOverlay({
  visible,
  status = 'success',
  title,
  subtitle,
  onDone,
}: {
  visible: boolean;
  status?: 'success' | 'error';
  title: string;
  subtitle?: string;
  onDone: () => void;
}) {
  const rotate = useRef(new Animated.Value(0)).current;
  const ringDraw = useRef(new Animated.Value(0)).current;
  const badgeFill = useRef(new Animated.Value(0)).current;
  const markDraw = useRef(new Animated.Value(0)).current;
  const shake = useRef(new Animated.Value(0)).current;
  const bg = useRef(new Animated.Value(0)).current;

  const isError = status === 'error';
  const color = isError ? C.negative : C.positive;

  useEffect(() => {
    if (!visible) return;
    rotate.setValue(0);
    ringDraw.setValue(0);
    badgeFill.setValue(0);
    markDraw.setValue(0);
    shake.setValue(0);
    bg.setValue(0);

    const native: Animated.CompositeAnimation[] = [
      Animated.timing(bg, { toValue: 1, duration: 160, useNativeDriver: true }),
      Animated.timing(rotate, {
        toValue: 720,
        duration: 950,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    ];
    if (isError) {
      native.push(
        Animated.sequence([
          Animated.timing(shake, { toValue: 7, duration: 45, delay: 820, useNativeDriver: true }),
          Animated.timing(shake, { toValue: -7, duration: 45, useNativeDriver: true }),
          Animated.timing(shake, { toValue: 5, duration: 45, useNativeDriver: true }),
          Animated.timing(shake, { toValue: -3, duration: 45, useNativeDriver: true }),
          Animated.timing(shake, { toValue: 0, duration: 45, useNativeDriver: true }),
        ]),
      );
    }

    const js: Animated.CompositeAnimation[] = [
      Animated.timing(ringDraw, {
        toValue: 1,
        duration: 950,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }),
      // badge fill completes…
      Animated.timing(badgeFill, { toValue: 1, duration: 340, delay: 820, useNativeDriver: false }),
      // …and the check/X fades in gradually WHILE the fill is completing
      Animated.timing(markDraw, { toValue: 1, duration: 380, delay: 920, useNativeDriver: false }),
    ];

    Animated.parallel(native).start();
    Animated.parallel(js).start();
    const t = setTimeout(onDone, 2150);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  if (!visible) return null;

  const rotStr = rotate.interpolate({ inputRange: [0, 720], outputRange: ['0deg', '720deg'] });
  const ringOffset = ringDraw.interpolate({ inputRange: [0, 1], outputRange: [RING_CIRC, 0] });

  return (
    <View style={succStyles.shade}>
      <Animated.View style={{ opacity: bg, transform: [{ translateX: shake }, { rotate: rotStr }] }}>
        <Svg width={104} height={104} viewBox="0 0 100 100">
          <ACircle
            cx={50}
            cy={50}
            r={RING_R}
            fill="none"
            stroke={color}
            strokeWidth={5}
            strokeLinecap="round"
            strokeDasharray={RING_CIRC}
            strokeDashoffset={ringOffset}
          />
          <ACircle cx={50} cy={50} r={38} fill={color} fillOpacity={badgeFill} />
          <APath
            d={isError ? CROSS_PATH : CHECK_PATH}
            stroke="#ffffff"
            strokeWidth={7}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            opacity={markDraw}
          />
        </Svg>
      </Animated.View>
      <Text style={succStyles.title}>{title}</Text>
      {subtitle ? <Text style={succStyles.sub}>{subtitle}</Text> : null}
    </View>
  );
}

const succStyles = StyleSheet.create({
  shade: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(10,30,22,0.62)',
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
    elevation: 80,
  },
  title: {
    color: C.white,
    fontFamily: F.sans,
    fontSize: 21,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginTop: S.lg,
  },
  sub: {
    color: 'rgba(255,255,255,0.82)',
    fontFamily: F.sans,
    fontSize: 13.5,
    fontWeight: '600',
    marginTop: 5,
    textAlign: 'center',
  },
});

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(10,30,22,0.45)',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: C.white,
    borderTopLeftRadius: R.xxl,
    borderTopRightRadius: R.xxl,
    paddingHorizontal: S.xl,
    paddingTop: 10,
    ...SH.float,
  },
  handle: {
    width: 42,
    height: 5,
    borderRadius: 3,
    backgroundColor: C.hairline,
    alignSelf: 'center',
    marginBottom: 12,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: S.md,
  },
  title: {
    color: C.ink,
    fontFamily: F.sans,
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: C.canvasAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  rowLabel: {
    color: C.muted,
    fontFamily: F.sans,
    fontSize: 14,
    fontWeight: '500',
  },
  rowValue: {
    color: C.ink,
    fontFamily: F.mono,
    fontSize: 14,
    fontWeight: '700',
  },
});
