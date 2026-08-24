import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { C, F, R, S, SH } from '@/theme';
import { pct } from '@/utils';

/* ---------------- Card ---------------- */
export function Card({
  children,
  style,
  radius = R.lg,
  pad,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
  radius?: number;
  pad?: number;
}) {
  return (
    <View
      style={[
        styles.card,
        { borderRadius: radius, padding: pad },
        style,
      ]}
    >
      {children}
    </View>
  );
}

/* ---------------- SectionTitle ---------------- */
export function SectionTitle({
  title,
  action = 'See all',
  onAction,
  style,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
  style?: ViewStyle;
}) {
  return (
    <View style={[styles.sectionTitle, style]}>
      <Text style={styles.sectionTitleText}>{title}</Text>
      {onAction ? (
        <Pressable style={styles.sectionAction} onPress={onAction}>
          <Text style={styles.sectionActionText}>{action}</Text>
          <Ionicons name="chevron-forward" size={14} color={C.green} />
        </Pressable>
      ) : null}
    </View>
  );
}

/* ---------------- ChangePill ---------------- */
export function ChangePill({
  value,
  variant = 'soft',
  style,
}: {
  value: number;
  variant?: 'soft' | 'solid';
  style?: ViewStyle;
}) {
  const up = value >= 0;
  const color = up ? C.positive : C.negative;
  const bg =
    variant === 'solid'
      ? color
      : up
        ? C.positiveSoft
        : C.negativeSoft;
  const fg = variant === 'solid' ? C.white : color;
  return (
    <View style={[styles.pill, { backgroundColor: bg }, style]}>
      <Ionicons name={up ? 'caret-up' : 'caret-down'} size={11} color={fg} />
      <Text style={[styles.pillText, { color: fg }]}>{pct(value)}</Text>
    </View>
  );
}

/* ---------------- StockLogo ---------------- */
export function StockLogo({
  ticker,
  color,
  size = 40,
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
          borderRadius: size * 0.3,
          backgroundColor: `${color}1A`,
          borderColor: `${color}33`,
        },
      ]}
    >
      <Text style={[styles.logoText, { color, fontSize: size * 0.34 }]}>
        {initials}
      </Text>
    </View>
  );
}

/* ---------------- Chip ---------------- */
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
          ? { backgroundColor: C.green, borderColor: C.green }
          : { backgroundColor: C.white, borderColor: C.hairline },
      ]}
    >
      <Text
        style={[
          styles.chipText,
          { color: active ? C.white : C.ink2 },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

/* ---------------- IconBtn ---------------- */
export function IconBtn({
  name,
  onPress,
  size = 20,
  tint = C.ink,
  bg = 'rgba(255,255,255,0.18)',
  dark = false,
}: {
  name: string;
  onPress?: () => void;
  size?: number;
  tint?: string;
  bg?: string;
  dark?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.iconBtn,
        { backgroundColor: bg },
        dark && { borderWidth: 1, borderColor: C.hairline, ...SH.soft },
      ]}
    >
      <Ionicons name={name as never} size={size} color={tint} />
    </Pressable>
  );
}

/* ---------------- Button ---------------- */
type BtnVariant = 'primary' | 'danger' | 'dark' | 'light';
export function Button({
  label,
  onPress,
  icon,
  variant = 'primary',
  block = false,
  style,
}: {
  label: string;
  onPress?: () => void;
  icon?: string;
  variant?: BtnVariant;
  block?: boolean;
  style?: ViewStyle;
}) {
  const map: Record<BtnVariant, { bg: string; fg: string; bd: string }> = {
    primary: { bg: C.green, fg: C.white, bd: C.green },
    danger: { bg: C.negative, fg: C.white, bd: C.negative },
    dark: { bg: C.dark, fg: C.white, bd: C.dark },
    light: { bg: C.canvasAlt, fg: C.ink, bd: C.hairline },
  };
  const v = map[variant];
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.btn,
        { backgroundColor: v.bg, borderColor: v.bd },
        block && { flex: 1 },
        pressed && { opacity: 0.88 },
        style,
      ]}
    >
      {icon ? (
        <Ionicons name={icon as never} size={18} color={v.fg} style={{ marginRight: 7 }} />
      ) : null}
      <Text style={[styles.btnText, { color: v.fg }]}>{label}</Text>
    </Pressable>
  );
}

/* ---------------- Stat ---------------- */
export function Stat({
  label,
  value,
  valueColor,
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <View style={{ gap: 3 }}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, valueColor ? { color: valueColor } : null]}>
        {value}
      </Text>
    </View>
  );
}

/* ---------------- Avatar ---------------- */
export function Avatar({
  initials = 'U',
  size = 44,
  ring = false,
}: {
  initials?: string;
  size?: number;
  ring?: boolean;
}) {
  return (
    <View
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderColor: ring ? 'rgba(255,255,255,0.5)' : 'transparent',
        },
      ]}
    >
      <Text style={[styles.avatarText, { fontSize: size * 0.4 }]}>{initials}</Text>
    </View>
  );
}

/* ---------------- LiveDot ---------------- */
export function LiveDot({ color = C.positive }: { color?: string }) {
  return (
    <View style={styles.liveDotWrap}>
      <View style={[styles.liveDot, { backgroundColor: color }]} />
    </View>
  );
}

/* ---------------- ScreenHeader ---------------- */
export function ScreenHeader({
  title,
  subtitle,
  showBack = false,
  right,
  light = false,
}: {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  right?: React.ReactNode;
  light?: boolean;
}) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const ink = light ? C.white : C.ink;
  const sub = light ? 'rgba(255,255,255,0.8)' : C.muted;
  return (
    <View style={[styles.screenHeader, { paddingTop: insets.top + 8 }]}>
      <View style={styles.screenHeaderRow}>
        {showBack ? (
          <IconBtn
            name="chevron-back"
            onPress={() => router.back()}
            size={22}
            tint={light ? C.white : C.ink}
            dark={!light}
          />
        ) : null}
        <View style={{ flex: 1, marginLeft: showBack ? S.xs : 0 }}>
          {subtitle ? (
            <Text style={[styles.screenSub, { color: sub }]} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
          <Text style={[styles.screenTitle, { color: ink }]} numberOfLines={1}>
            {title}
          </Text>
        </View>
        {right}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: C.card,
    ...SH.card,
  },
  sectionTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: S.md,
  },
  sectionTitleText: {
    color: C.ink,
    fontFamily: F.sans,
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  sectionAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 1,
  },
  sectionActionText: {
    color: C.green,
    fontFamily: F.sans,
    fontSize: 13.5,
    fontWeight: '700',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: R.sm,
    alignSelf: 'flex-start',
  },
  pillText: {
    fontFamily: F.mono,
    fontSize: 12,
    fontWeight: '700',
  },
  logo: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  logoText: {
    fontFamily: F.sans,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  chip: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: R.pill,
    borderWidth: 1,
    marginRight: 8,
  },
  chipText: {
    fontFamily: F.sans,
    fontSize: 13,
    fontWeight: '600',
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: R.md,
    borderWidth: 1,
  },
  btnText: {
    fontFamily: F.sans,
    fontSize: 15.5,
    fontWeight: '700',
  },
  statLabel: {
    color: C.faint,
    fontFamily: F.sans,
    fontSize: 12,
    fontWeight: '600',
  },
  statValue: {
    color: C.ink,
    fontFamily: F.sans,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderWidth: 1.5,
  },
  avatarText: {
    color: C.white,
    fontFamily: F.sans,
    fontWeight: '800',
  },
  liveDotWrap: { paddingRight: 4 },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  screenHeader: {
    paddingHorizontal: S.xl,
  },
  screenHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: S.sm,
  },
  screenTitle: {
    fontFamily: F.sans,
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  screenSub: {
    fontFamily: F.sans,
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 1,
  },
});
