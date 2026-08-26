import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { C, F, R, S, registerStyles } from '@/theme';

type Tone = 'green' | 'red' | 'dark' | 'light' | 'airtime' | 'data' | 'electricity' | 'tv';

export function QuickAction({
  label,
  icon,
  tone = 'dark',
  onPress,
}: {
  label: string;
  icon: string;
  tone?: Tone;
  onPress?: () => void;
}) {
  const map: Record<Tone, { bg: string; fg: string }> = {
    green: { bg: C.green, fg: C.white },
    red: { bg: C.negative, fg: C.white },
    dark: { bg: C.dark, fg: C.white },
    light: { bg: C.canvasAlt, fg: C.ink },
    airtime: { bg: 'rgba(31,122,224,0.14)', fg: '#3E8DEF' },
    data: { bg: 'rgba(124,92,255,0.15)', fg: '#8F76FF' },
    electricity: { bg: 'rgba(246,166,35,0.16)', fg: '#EFA528' },
    tv: { bg: 'rgba(224,72,62,0.14)', fg: '#E4685E' },
  };
  const t = map[tone];
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.wrap, pressed && { opacity: 0.85 }]}
    >
      <View style={[styles.circle, { backgroundColor: t.bg }]}>
        <Ionicons name={icon as never} size={20} color={t.fg} />
      </View>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const makeStyles = () => StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', gap: 7 },
  circle: {
    width: 50,
    height: 50,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    color: C.ink2,
    fontFamily: F.sans,
    fontSize: 12.5,
    fontWeight: '600',
  },
});
let styles = makeStyles();
registerStyles(() => { styles = makeStyles(); });
