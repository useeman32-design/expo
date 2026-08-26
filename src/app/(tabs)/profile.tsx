import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import { Avatar, Card, ScreenHeader, SectionTitle } from '@/components/primitives';
import { useAuth } from '@/auth';
import { useKyc } from '@/kyc';
import { getPortfolio } from '@/services/portfolio';
import { C, F, R, S, SH } from '@/theme';
import { money } from '@/utils';

const MENU = [
  { icon: 'receipt-outline', label: 'Orders', color: '#0E8A57', route: '/orders' },
  { icon: 'eye-outline', label: 'Watchlist', color: '#7C5CFF', route: '/watchlist' },
  { icon: 'card-outline', label: 'Wallet & Transactions', color: '#11A06B', route: '/wallet' },
  { icon: 'shield-checkmark-outline', label: 'KYC & Verification', color: '#F6A623', route: '/kyc' },
  { icon: 'cash-outline', label: 'Dividends', color: '#0E9F5E', route: '/dividends' },
  { icon: 'notifications-outline', label: 'Notifications', color: '#3DDC97', route: '/notifications' },
  { icon: 'flash-outline', label: 'Positions', color: '#11A06B', route: '/rules' },
  { icon: 'bell-outline', label: 'Price Alerts', color: '#1F7AE0', route: '/alerts' },
  { icon: 'moon-outline', label: 'Sharia Screening', color: '#0A6B41', route: '/sharia' },
  { icon: 'gift-outline', label: 'Invite Friends', color: '#DD4B3E', route: '/referral' },
  { icon: 'help-circle-outline', label: 'Help & Support', color: '#3DDC97', route: '/support' },
];

const MENU2 = [
  { icon: 'business-outline', label: 'Bank Accounts', color: '#1F7AE0', route: '/bank-accounts' },
  { icon: 'lock-closed-outline', label: 'Security', color: '#0E8A57', route: '/security' },
  { icon: 'person-outline', label: 'Personal Info', color: '#F6A623', route: '/personal-info' },
  { icon: 'document-text-outline', label: 'Legal & Policies', color: '#6C7771', route: '/legal' },
];

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const p = getPortfolio();
  const { user, signOut } = useAuth();
  const { kyc, verified } = useKyc();
  const [hausa, setHausa] = useState(false);
  const initial = (user?.name ?? 'U').charAt(0).toUpperCase();

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 110 }}>
        <ScreenHeader title="Profile" subtitle="Account & settings" />

        {/* user card */}
        <View style={{ paddingHorizontal: S.xl, marginTop: S.sm }}>
          <Card pad={S.xl} radius={R.xl}>
            <View style={styles.userRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initial}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.userName}>{user?.name ?? 'Usman Abdullahi'}</Text>
                <Text style={styles.userEmail}>{user?.email ?? 'usman.abdullahi@email.com'}</Text>
                <Pressable onPress={() => router.push('/kyc' as never)} style={styles.verified}>
                  <Ionicons
                    name={verified ? 'shield-checkmark' : 'shield-half-outline'}
                    size={13}
                    color={verified ? C.green : '#F6A623'}
                  />
                  <Text style={[styles.verifiedText, !verified && { color: '#F6A623' }]}>
                    {user?.guest
                      ? 'Guest mode'
                      : verified
                        ? 'KYC Verified'
                        : `Verify account · Tier ${1 + [kyc.bvnVerified, kyc.ninVerified, kyc.documentVerified].filter(Boolean).length} of 3`}
                  </Text>
                </Pressable>
              </View>
            </View>
            <View style={styles.userStats}>
              <View>
                <Text style={styles.statLabel}>Portfolio</Text>
                <Text style={styles.statValue}>{money(p.totalValue)}</Text>
              </View>
              <View style={styles.statLine} />
              <View>
                <Text style={styles.statLabel}>Cash</Text>
                <Text style={styles.statValue}>{money(p.cash)}</Text>
              </View>
            </View>
          </Card>
        </View>

        {/* language */}
        <View style={{ paddingHorizontal: S.xl, marginTop: S.xxl }}>
          <SectionTitle title="Language" />
          <Card pad={S.lg} radius={R.lg}>
            <View style={styles.langRow}>
              <View style={styles.langLeft}>
                <Text style={styles.langIcon}>ع</Text>
                <View>
                  <Text style={styles.langTitle}>Hausa</Text>
                  <Text style={styles.langSub}>Switch the app to Hausa (coming soon)</Text>
                </View>
              </View>
              <Switch
                value={hausa}
                onValueChange={setHausa}
                trackColor={{ false: C.canvasAlt, true: C.green }}
                thumbColor={C.white}
              />
            </View>
          </Card>
        </View>

        {/* menu */}
        <View style={{ paddingHorizontal: S.xl, marginTop: S.xxl }}>
          <SectionTitle title="Account" />
          <Card pad={S.xs} radius={R.xl}>
            {MENU.map((m, i) => (
              <Pressable
                key={m.label}
                onPress={() => m.route && router.push(m.route as never)}
                style={({ pressed }) => [
                  styles.menuRow,
                  i < MENU.length - 1 && styles.menuDiv,
                  pressed && { opacity: 0.6 },
                ]}
              >
                <View style={[styles.menuIcon, { backgroundColor: `${m.color}1F` }]}>
                  <Ionicons name={m.icon as never} size={18} color={m.color} />
                </View>
                <Text style={styles.menuLabel}>{m.label}</Text>
                <Ionicons name="chevron-forward" size={16} color={C.faint} />
              </Pressable>
            ))}
          </Card>
        </View>

        {/* preferences & legal */}
        <View style={{ paddingHorizontal: S.xl, marginTop: S.xxl }}>
          <SectionTitle title="Preferences & Legal" />
          <Card pad={S.xs} radius={R.xl}>
            {MENU2.map((m, i) => (
              <Pressable
                key={m.label}
                onPress={() => router.push(m.route as never)}
                style={({ pressed }) => [
                  styles.menuRow,
                  i < MENU2.length - 1 && styles.menuDiv,
                  pressed && { opacity: 0.6 },
                ]}
              >
                <View style={[styles.menuIcon, { backgroundColor: `${m.color}1F` }]}>
                  <Ionicons name={m.icon as never} size={18} color={m.color} />
                </View>
                <Text style={styles.menuLabel}>{m.label}</Text>
                <Ionicons name="chevron-forward" size={16} color={C.faint} />
              </Pressable>
            ))}
          </Card>
        </View>

        {/* logout */}
        <View style={{ paddingHorizontal: S.xl, marginTop: S.xl }}>
          <Pressable
            onPress={signOut}
            style={({ pressed }) => [styles.logout, pressed && { opacity: 0.85 }]}
          >
            <Ionicons name="log-out-outline" size={18} color={C.negative} />
            <Text style={styles.logoutText}>Log out</Text>
          </Pressable>
        </View>

        <Text style={styles.version}>StocksX · v1.0.0 (demo)</Text>
        <View style={{ height: insets.bottom }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.canvas },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: C.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: C.white,
    fontFamily: F.sans,
    fontSize: 24,
    fontWeight: '800',
  },
  userName: {
    color: C.ink,
    fontFamily: F.sans,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  userEmail: {
    color: C.muted,
    fontFamily: F.sans,
    fontSize: 13,
    marginTop: 1,
  },
  verified: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: C.greenSoft,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: R.sm,
    marginTop: 6,
  },
  verifiedText: {
    color: C.green,
    fontFamily: F.sans,
    fontSize: 11,
    fontWeight: '700',
  },
  userStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: S.lg,
    paddingTop: S.lg,
    borderTopWidth: 1,
    borderTopColor: C.hairline,
  },
  statLabel: {
    color: C.faint,
    fontFamily: F.sans,
    fontSize: 12,
    fontWeight: '600',
  },
  statValue: {
    color: C.ink,
    fontFamily: F.mono,
    fontSize: 16,
    fontWeight: '800',
    marginTop: 2,
  },
  statLine: { width: 1, height: 30, backgroundColor: C.hairline, marginHorizontal: S.lg },
  langRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  langLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  langIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: C.greenSoft,
    color: C.green,
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: 20,
    fontWeight: '800',
    fontFamily: F.sans,
  },
  langTitle: {
    color: C.ink,
    fontFamily: F.sans,
    fontSize: 15,
    fontWeight: '700',
  },
  langSub: {
    color: C.muted,
    fontFamily: F.sans,
    fontSize: 12,
    marginTop: 1,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: S.md,
    paddingHorizontal: S.md,
  },
  menuDiv: { borderBottomWidth: 1, borderBottomColor: C.hairlineSoft },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    flex: 1,
    color: C.ink,
    fontFamily: F.sans,
    fontSize: 15,
    fontWeight: '600',
  },
  logout: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: C.negativeSoft,
    paddingVertical: 15,
    borderRadius: R.md,
  },
  logoutText: {
    color: C.negative,
    fontFamily: F.sans,
    fontSize: 15,
    fontWeight: '700',
  },
  version: {
    color: C.faint,
    fontFamily: F.sans,
    fontSize: 12,
    textAlign: 'center',
    marginTop: S.xl,
  },
});
