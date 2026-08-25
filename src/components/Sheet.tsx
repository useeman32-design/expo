import { useEffect, useRef } from 'react';
import { Animated, Modal, Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

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
 * Success animation shown inside a Sheet via the `overlay` prop.
 * A green check pops in with a spring, holds ~1.5s, then calls onDone.
 */
export function SuccessOverlay({
  visible,
  title,
  subtitle,
  onDone,
}: {
  visible: boolean;
  title: string;
  subtitle?: string;
  onDone: () => void;
}) {
  const scale = useRef(new Animated.Value(0.3)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;
    scale.setValue(0.3);
    opacity.setValue(0);
    const anim = Animated.parallel([
      Animated.spring(scale, { toValue: 1, tension: 160, friction: 9, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 160, useNativeDriver: true }),
    ]);
    anim.start();
    const t = setTimeout(onDone, 1500);
    return () => {
      anim.stop();
      clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  if (!visible) return null;

  return (
    <View style={succStyles.shade}>
      <Animated.View style={[succStyles.card, { opacity, transform: [{ scale }] }]}>
        <View style={succStyles.ring}>
          <Ionicons name="checkmark" size={46} color={C.white} />
        </View>
        <Text style={succStyles.title}>{title}</Text>
        {subtitle ? <Text style={succStyles.sub}>{subtitle}</Text> : null}
      </Animated.View>
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
    backgroundColor: 'rgba(10,30,22,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
    elevation: 80,
  },
  card: {
    backgroundColor: C.white,
    borderRadius: R.xxl,
    paddingHorizontal: S.xxl,
    paddingVertical: S.xxl,
    alignItems: 'center',
    width: 264,
    shadowColor: '#0A3D28',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 28,
    elevation: 90,
  },
  ring: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: C.green,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: S.md,
  },
  title: {
    color: C.ink,
    fontFamily: F.sans,
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  sub: {
    color: C.muted,
    fontFamily: F.sans,
    fontSize: 13.5,
    fontWeight: '600',
    marginTop: 4,
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
