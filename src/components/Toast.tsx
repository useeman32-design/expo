import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useStore } from '@/store';
import { C, F, R, SH, registerStyles } from '@/theme';

export function Toast() {
  const { toast } = useStore();
  const insets = useSafeAreaInsets();
  if (!toast) return null;
  const tone = toast.tone;
  const bg =
    tone === 'error' ? C.negative : tone === 'info' ? C.dark : C.green;
  const icon =
    tone === 'error' ? 'close-circle' : tone === 'info' ? 'information-circle' : 'checkmark-circle';
  return (
    <View style={[styles.wrap, { top: insets.top + 8 }]} pointerEvents="none">
      <View style={[styles.pill, { backgroundColor: bg }]}>
        <Ionicons name={icon as never} size={18} color={C.white} />
        <Text style={styles.text}>{toast.text}</Text>
      </View>
    </View>
  );
}

const makeStyles = () => StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 50,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: R.pill,
    ...SH.float,
  },
  text: {
    color: C.white,
    fontFamily: F.sans,
    fontSize: 13.5,
    fontWeight: '700',
  },
});
let styles = makeStyles();
registerStyles(() => { styles = makeStyles(); });
