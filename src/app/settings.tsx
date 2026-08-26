import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Avatar, Card, ScreenHeader } from '@/components/primitives';
import { useAuth } from '@/auth';
import { C, F, R, S } from '@/theme';

type Row =
  | {
      icon: string;
      color: string;
      label: string;
      kind: 'link';
      value?: string;
    }
  | {
      icon: string;
      color: string;
      label: string;
      kind: 'toggle';
      key: ToggleKey;
    };

type ToggleKey = 'alerts' | 'notifications' | 'biometric' | 'confirm';

const SECTIONS: { title: string; rows: Row[] }[] = [
  {
    title: 'Account',
    rows: [
      { icon: 'person', color: '#0E8A57', label: 'Personal details', kind: 'link' },
      { icon: 'card', color: '#1F7AE0', label: 'Linked accounts', kind: 'link' },
      { icon: 'shield-checkmark', color: '#7A52C9', label: 'Security & KYC', kind: 'link' },
      { icon: 'wallet', color: '#11A06B', label: 'Wallet & transactions', kind: 'link' },
    ],
  },
  {
    title: 'Preferences',
    rows: [
      { icon: 'trending-up', color: '#0E9F5E', label: 'Price alerts', kind: 'toggle', key: 'alerts' },
      { icon: 'notifications', color: '#E08A1F', label: 'Push notifications', kind: 'toggle', key: 'notifications' },
      { icon: 'finger-print', color: '#0E8A57', label: 'Biometric login', kind: 'toggle', key: 'biometric' },
      { icon: 'checkmark-circle', color: '#1F7AE0', label: 'Trade confirmations', kind: 'toggle', key: 'confirm' },
      { icon: 'cash', color: '#0A6B41', label: 'Default currency', kind: 'link', value: 'NGN (₦)' },
      { icon: 'language', color: '#7A52C9', label: 'Language', kind: 'link', value: 'English' },
    ],
  },
  {
    title: 'Support',
    rows: [
      { icon: 'help-circle', color: '#1F7AE0', label: 'Help centre', kind: 'link' },
      { icon: 'chatbubble-ellipses', color: '#0E8A57', label: 'Contact us', kind: 'link' },
      { icon: 'warning', color: '#DD4B3E', label: 'Risk disclosure', kind: 'link' },
      { icon: 'receipt', color: '#F6A623', label: 'Fee schedule', kind: 'link' },
      { icon: 'star', color: '#E08A1F', label: 'Rate StocksX', kind: 'link' },
    ],
  },
  {
    title: 'About',
    rows: [
      { icon: 'refresh', color: '#0E8A57', label: 'Replay onboarding', kind: 'link' },
      { icon: 'lock-closed', color: '#6C7771', label: 'Privacy policy', kind: 'link' },
      { icon: 'document-text', color: '#6C7771', label: 'Terms of service', kind: 'link' },
      { icon: 'information-circle', color: '#6C7771', label: 'App version', kind: 'link', value: 'v1.0.0 (demo)' },
    ],
  },
];

export default function SettingsScreen() {
  const [toggles, setToggles] = useState<Record<ToggleKey, boolean>>({
    alerts: true,
    notifications: true,
    biometric: false,
    confirm: true,
  });

  const { user, signOut, resetOnboarding } = useAuth();
  const router = useRouter();

  const LINK_ROUTES: Record<string, string> = {
    'Personal details': '/personal-info',
    'Linked accounts': '/bank-accounts',
    'Security & KYC': '/security',
    'Wallet & transactions': '/wallet',
    'Help centre': '/support',
    'Contact us': '/support',
    'Risk disclosure': '/legal/risk',
    'Fee schedule': '/legal/fees',
    'Privacy policy': '/legal/privacy',
    'Terms of service': '/legal/terms',
  };

  const handleLink = (label: string) => {
    if (label === 'Replay onboarding') {
      // Guard sees onboarded=false and routes back to the intro slides
      resetOnboarding();
      return;
    }
    const route = LINK_ROUTES[label];
    if (route) router.push(route as never);
  };

  const flip = (k: ToggleKey) => setToggles((t) => ({ ...t, [k]: !t[k] }));

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />
      <ScreenHeader title="Settings" showBack />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: S.xl, paddingTop: S.sm, paddingBottom: 40 }}
      >
        {/* profile card */}
        <Card pad={S.lg} radius={R.xl} style={{ marginBottom: S.xxl }}>
          <View style={styles.profile}>
            <Avatar initials="U" size={54} />
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={styles.profileName}>{user?.name ?? 'Usman Musa'}</Text>
              <Text style={styles.profileEmail}>{user?.email ?? 'usman.musa@stocksx.app'}</Text>
              <Text style={styles.profileTag}>
                {user?.guest ? 'Guest mode' : `Signed in with ${user?.provider ?? 'email'} · Verified`}
              </Text>
            </View>
            <Pressable style={styles.editBtn}>
              <Text style={styles.editText}>Edit</Text>
            </Pressable>
          </View>
        </Card>

        {SECTIONS.map((section) => (
          <View key={section.title} style={{ marginBottom: S.xxl }}>
            <Text style={styles.sectionLabel}>{section.title.toUpperCase()}</Text>
            <Card pad={S.lg} radius={R.lg} style={{ paddingVertical: 6 }}>
              {section.rows.map((row, i) => (
                <SettingsRow
                  key={row.label}
                  row={row}
                  last={i === section.rows.length - 1}
                  value={row.kind === 'toggle' ? toggles[row.key] : undefined}
                  onToggle={row.kind === 'toggle' ? () => flip(row.key) : undefined}
                  onLink={handleLink}
                />
              ))}
            </Card>
          </View>
        ))}

        <Pressable
          onPress={signOut}
          style={({ pressed }) => [styles.logoutBtn, pressed && { opacity: 0.9 }]}
        >
          <Ionicons name="log-out-outline" size={19} color={C.negative} />
          <Text style={styles.logoutText}>Log out</Text>
        </Pressable>

        <Text style={styles.footNote}>StocksX · v1.0.0 (demo)</Text>
        <Text style={styles.footSub}>Built for Nigerian traders. Made with care.</Text>
      </ScrollView>
    </View>
  );
}

function SettingsRow({
  row,
  last,
  value,
  onToggle,
  onLink,
}: {
  row: Row;
  last: boolean;
  value?: boolean;
  onToggle?: () => void;
  onLink?: (label: string) => void;
}) {
  const isLink = row.kind === 'link';
  return (
    <Pressable
      onPress={isLink && onLink ? () => onLink(row.label) : undefined}
      style={({ pressed }) => [styles.row, !last && styles.rowBorder, pressed && { opacity: 0.6 }]}
    >
      <View style={[styles.rowIcon, { backgroundColor: `${row.color}1F` }]}>
        <Ionicons name={row.icon as never} size={18} color={row.color} />
      </View>
      <Text style={styles.rowLabel}>{row.label}</Text>

      {row.kind === 'link' && row.value ? (
        <Text style={styles.rowValue}>{row.value}</Text>
      ) : null}

      {row.kind === 'toggle' ? (
        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={{ false: C.canvasAlt, true: C.green }}
          thumbColor={C.white}
        />
      ) : (
        <Ionicons name="chevron-forward" size={17} color={C.faint} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.canvas },
  profile: { flexDirection: 'row', alignItems: 'center' },
  profileName: { color: C.ink, fontFamily: F.sans, fontSize: 17, fontWeight: '800', letterSpacing: -0.2 },
  profileEmail: { color: C.muted, fontFamily: F.sans, fontSize: 13.5, fontWeight: '500', marginTop: 1 },
  profileTag: {
    color: C.greenDark,
    fontFamily: F.sans,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 6,
  },
  editBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: R.pill,
    backgroundColor: C.greenSoft,
  },
  editText: { color: C.greenDark, fontFamily: F.sans, fontSize: 13, fontWeight: '700' },
  sectionLabel: {
    color: C.faint,
    fontFamily: F.sans,
    fontSize: 11.5,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: S.sm,
    marginLeft: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 4,
  },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: C.hairlineSoft },
  rowIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },
  rowLabel: { color: C.ink, fontFamily: F.sans, fontSize: 15, fontWeight: '600', flex: 1 },
  rowValue: { color: C.muted, fontFamily: F.sans, fontSize: 13.5, fontWeight: '600', marginRight: 6 },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: R.md,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.hairline,
  },
  logoutText: { color: C.negative, fontFamily: F.sans, fontSize: 15.5, fontWeight: '700' },
  footNote: {
    color: C.faint,
    fontFamily: F.sans,
    fontSize: 12.5,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: S.xxl,
  },
  footSub: {
    color: C.faint,
    fontFamily: F.sans,
    fontSize: 11.5,
    textAlign: 'center',
    marginTop: 3,
  },
});
