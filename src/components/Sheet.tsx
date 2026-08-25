import { Modal, Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { C, F, R, S, SH } from '@/theme';

export function Sheet({
  visible,
  onClose,
  title,
  children,
}: {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
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
      <Text style={[styles.rowValue, valueColor ? { color: valueColor } : null]}>
        {value}
      </Text>
    </View>
  );
}

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
