import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { C, FONT, R, SHADOW, S } from '@/theme';
import { pct } from '@/utils';

/* ------------------------------------------------------------------ */
/* GlassCard                                                           */
/* ------------------------------------------------------------------ */
type GlassVariant = 'default' | 'strong' | 'green';

export function GlassCard({
  children,
  style,
  intensity = 32,
  variant = 'default',
  radius = R.lg,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: number;
  variant?: GlassVariant;
  radius?: number;
}) {
  const bg =
    variant === 'strong'
      ? C.glassStrong
      : variant === 'green'
        ? C.glassGreen
        : C.glass;
  return (
    <BlurView
      intensity={intensity}
      tint="dark"
      experimentalBlurMethod
      style={[
        styles.glass,
        {
          backgroundColor: bg,
          borderRadius: radius,
          borderColor: variant === 'green' ? C.borderStrong : C.border,
        },
        style,
      ]}
    >
      {children}
    </BlurView>
  );
}

/* ------------------------------------------------------------------ */
/* SectionHeader — the green section header                            */
/* ------------------------------------------------------------------ */
export function SectionHeader({
  title,
  ha,
  action,
  onAction,
}: {
  title: string;
  ha?: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.sectionRow}>
      <View style={styles.sectionLeft}>
        <View style={styles.greenBar} />
        <View>
          <Text style={styles.sectionTitle}>{title}</Text>
          {ha ? <Text style={styles.sectionHa}>{ha}</Text> : null}
        </View>
      </View>
      {action ? (
        <Pressable style={styles.sectionAction} onPress={onAction}>
          <Text style={styles.sectionActionText}>{action}</Text>
          <Ionicons name="chevron-forward" size={14} color={C.accent} />
        </Pressable>
      ) : null}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* ChangePill                                                          */
/* ------------------------------------------------------------------ */
export function ChangePill({
  value,
  style,
  showSign = true,
}: {
  value: number;
  style?: ViewStyle;
  showSign?: boolean;
}) {
  const up = value >= 0;
  return (
    <View
      style={[
        styles.pill,
        {
          backgroundColor: up ? 'rgba(34,229,154,0.16)' : 'rgba(255,107,107,0.16)',
        },
        style,
      ]}
    >
      <Ionicons
        name={up ? 'caret-up' : 'caret-down'}
        size={11}
        color={up ? C.positive : C.negative}
      />
      <Text
        style={[
          styles.pillText,
          { color: up ? C.positive : C.negative },
        ]}
      >
        {showSign ? pct(value) : `${Math.abs(value).toFixed(2)}%`}
      </Text>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* StockLogo                                                           */
/* ------------------------------------------------------------------ */
export function StockLogo({
  ticker,
  color,
  size = 42,
}: {
  ticker: string;
  color: string;
  size?: number;
}) {
  const initials = ticker.replace(/[^A-Za-z0-9]/g, '').slice(0, 2).toUpperCase();
  return (
    <View
      style={[
        styles.logo,
        {
          width: size,
          height: size,
          borderRadius: size * 0.28,
          backgroundColor: `${color}22`,
          borderColor: `${color}66`,
        },
      ]}
    >
      <Text style={[styles.logoText, { color, fontSize: size * 0.34 }]}>
        {initials}
      </Text>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* HalalBadge                                                          */
/* ------------------------------------------------------------------ */
export function HalalBadge({
  compliant = true,
  small = false,
}: {
  compliant?: boolean;
  small?: boolean;
}) {
  const label = compliant ? 'Halal' : 'Not halal';
  const color = compliant ? C.sharia : C.haram;
  return (
    <View
      style={[
        styles.halal,
        {
          backgroundColor: compliant ? 'rgba(34,229,154,0.16)' : 'rgba(255,138,101,0.16)',
          borderColor: `${color}55`,
          paddingHorizontal: small ? 7 : 9,
          paddingVertical: small ? 3 : 4,
        },
      ]}
    >
      <Ionicons
        name={compliant ? 'shield-checkmark' : 'shield-half'}
        size={small ? 11 : 13}
        color={color}
      />
      <Text style={[styles.halalText, { color, fontSize: small ? 9.5 : 11 }]}>
        {label}
      </Text>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Chip (filter pill)                                                  */
/* ------------------------------------------------------------------ */
export function Chip({
  label,
  active = false,
  onPress,
}: {
  label: string;
  active?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        active
          ? { backgroundColor: C.accent, borderColor: C.accent }
          : { backgroundColor: C.glass, borderColor: C.border },
      ]}
    >
      <Text
        style={[
          styles.chipText,
          { color: active ? '#04140E' : C.textMuted },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

/* ------------------------------------------------------------------ */
/* IconButton                                                          */
/* ------------------------------------------------------------------ */
export function IconButton({
  name,
  onPress,
  size = 22,
  badge,
}: {
  name: keyof typeof Ionicons.glyphMap | string;
  onPress?: () => void;
  size?: number;
  badge?: boolean;
}) {
  return (
    <Pressable onPress={onPress} style={styles.iconBtn}>
      <Ionicons name={name as never} size={size} color={C.text} />
      {badge ? <View style={styles.badgeDot} /> : null}
    </Pressable>
  );
}

/* ------------------------------------------------------------------ */
/* AppHeader                                                           */
/* ------------------------------------------------------------------ */
export function AppHeader({
  title,
  subtitle,
  showBack = false,
  right,
}: {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  right?: React.ReactNode;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
      <View style={styles.headerInner}>
        {showBack ? (
          <IconButton name="chevron-back" onPress={() => router.back()} />
        ) : null}
        <View style={{ flex: 1, marginLeft: showBack ? S.xs : 0 }}>
          {subtitle ? (
            <Text style={styles.headerSub} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
          <Text style={styles.headerTitle} numberOfLines={1}>
            {title}
          </Text>
        </View>
        {right}
      </View>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Avatar                                                              */
/* ------------------------------------------------------------------ */
export function Avatar({ initials = 'YI', size = 42 }: { initials?: string; size?: number }) {
  return (
    <View
      style={[
        styles.avatar,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      <Text style={[styles.avatarText, { fontSize: size * 0.36 }]}>
        {initials}
      </Text>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Stat                                                                */
/* ------------------------------------------------------------------ */
export function Stat({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, accent && { color: C.accent }]}>
        {value}
      </Text>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Primary button                                                      */
/* ------------------------------------------------------------------ */
export function PrimaryButton({
  label,
  onPress,
  icon,
  variant = 'solid',
}: {
  label: string;
  onPress?: () => void;
  icon?: string;
  variant?: 'solid' | 'ghost' | 'danger';
}) {
  const bg =
    variant === 'solid'
      ? C.accent
      : variant === 'danger'
        ? 'rgba(255,107,107,0.16)'
        : C.glassStrong;
  const fg = variant === 'solid' ? '#04140E' : variant === 'danger' ? C.negative : C.text;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.btn,
        { backgroundColor: bg, borderColor: variant === 'solid' ? C.accent : C.border },
        pressed && { opacity: 0.85 },
      ]}
    >
      {icon ? (
        <Ionicons name={icon as never} size={18} color={fg} style={{ marginRight: 8 }} />
      ) : null}
      <Text style={[styles.btnText, { color: fg }]}>{label}</Text>
    </Pressable>
  );
}

/* ------------------------------------------------------------------ */
/* styles                                                              */
/* ------------------------------------------------------------------ */
const styles = StyleSheet.create({
  glass: {
    borderWidth: 1,
    overflow: 'hidden',
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: S.md,
  },
  sectionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  greenBar: {
    width: 4,
    height: 22,
    borderRadius: 3,
    backgroundColor: C.accent,
    ...SHADOW.glow,
  },
  sectionTitle: {
    color: C.text,
    fontFamily: FONT.sans,
    fontSize: 19,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  sectionHa: {
    color: C.accent,
    fontFamily: FONT.sans,
    fontSize: 12,
    fontWeight: '500',
    marginTop: 1,
  },
  sectionAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  sectionActionText: {
    color: C.accent,
    fontFamily: FONT.sans,
    fontSize: 13,
    fontWeight: '600',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: R.sm,
  },
  pillText: {
    fontFamily: FONT.mono,
    fontSize: 12,
    fontWeight: '700',
  },
  logo: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  logoText: {
    fontFamily: FONT.sans,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  halal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: R.sm,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  halalText: {
    fontFamily: FONT.sans,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: R.pill,
    borderWidth: 1,
    marginRight: 8,
  },
  chipText: {
    fontFamily: FONT.sans,
    fontSize: 13,
    fontWeight: '600',
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.glass,
    borderWidth: 1,
    borderColor: C.border,
  },
  badgeDot: {
    position: 'absolute',
    top: 9,
    right: 9,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.accent,
    borderWidth: 1.5,
    borderColor: C.bg0,
  },
  header: {
    paddingHorizontal: S.xl,
  },
  headerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: S.sm,
  },
  headerTitle: {
    color: C.text,
    fontFamily: FONT.sans,
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  headerSub: {
    color: C.textMuted,
    fontFamily: FONT.sans,
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 1,
  },
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.glassGreen,
    borderWidth: 1,
    borderColor: C.borderStrong,
  },
  avatarText: {
    color: C.accent,
    fontFamily: FONT.sans,
    fontWeight: '800',
  },
  statBox: {
    flex: 1,
    gap: 4,
  },
  statLabel: {
    color: C.textFaint,
    fontFamily: FONT.sans,
    fontSize: 12,
    fontWeight: '500',
  },
  statValue: {
    color: C.text,
    fontFamily: FONT.sans,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: R.md,
    borderWidth: 1,
  },
  btnText: {
    fontFamily: FONT.sans,
    fontSize: 16,
    fontWeight: '700',
  },
});
