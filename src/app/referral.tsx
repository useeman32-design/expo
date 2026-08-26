import { Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { Card, ScreenHeader } from '@/components/primitives';
import { C, F, R, S } from '@/theme';

export default function ReferralScreen() {
  const code = 'USMAN-X4K9';

  const share = () =>
    Share.share({
      message:
        `Start investing on StocksX — Nigerian and US stocks from ₦1,000, Sharia screening included. ` +
        `Use my code ${code} and we each get ₦1,000 of free trading credit: https://stocksx.ng/r/${code}`,
    }).catch(() => undefined);

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 48 }}>
        <ScreenHeader title="Invite Friends" subtitle="₦1,000 for you · ₦1,000 for them" />

        {/* hero card */}
        <View style={{ paddingHorizontal: S.xl, marginTop: S.sm }}>
          <Card pad={0} radius={R.xl}>
            <LinearGradient
              colors={[C.hero1, C.hero2]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.hero}
            >
              <View style={styles.heroIcon}>
                <Ionicons name="gift-outline" size={28} color={C.white} />
              </View>
              <Text style={styles.heroTitle}>Give ₦1,000, get ₦1,000</Text>
              <Text style={styles.heroSub}>
                When a friend completes KYC and makes their first trade, you both receive ₦1,000 in
                trading credit.
              </Text>
              <View style={styles.codeBox}>
                <Text style={styles.code}>{code}</Text>
                <View style={styles.codeDivider} />
                <Pressable onPress={share} style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}>
                  <Ionicons name="share-social-outline" size={20} color={C.white} />
                </Pressable>
              </View>
              <Pressable onPress={share} style={({ pressed }) => [styles.heroBtn, pressed && { opacity: 0.9 }]}>
                <Text style={styles.heroBtnText}>Share invite</Text>
                <Ionicons name="arrow-forward" size={16} color={C.greenDeep} />
              </Pressable>
            </LinearGradient>
          </Card>
        </View>

        {/* stats */}
        <View style={{ paddingHorizontal: S.xl, marginTop: S.lg }}>
          <View style={styles.statRow}>
            <Card pad={S.lg} radius={R.lg} style={{ flex: 1 }}>
              <Text style={styles.statValue}>3</Text>
              <Text style={styles.statLabel}>Friends joined</Text>
            </Card>
            <Card pad={S.lg} radius={R.lg} style={{ flex: 1 }}>
              <Text style={styles.statValue}>1</Text>
              <Text style={styles.statLabel}>Completed first trade</Text>
            </Card>
            <Card pad={S.lg} radius={R.lg} style={{ flex: 1 }}>
              <Text style={[styles.statValue, { color: C.green }]}>₦1,000</Text>
              <Text style={styles.statLabel}>Credit earned</Text>
            </Card>
          </View>
        </View>

        {/* how it works */}
        <View style={{ paddingHorizontal: S.xl, marginTop: S.lg }}>
          <Text style={styles.section}>How it works</Text>
          <Card pad={S.xl} radius={R.xl}>
            {[
              { icon: 'share-social-outline', text: 'Share your code with friends and family' },
              { icon: 'person-add-outline', text: 'They sign up and complete KYC verification' },
              { icon: 'stats-chart-outline', text: 'They place their first trade (any amount)' },
              { icon: 'gift-outline', text: 'You both get ₦1,000 trading credit automatically' },
            ].map((s, i) => (
              <View key={i} style={styles.stepRow}>
                <View style={styles.stepIcon}>
                  <Ionicons name={s.icon as never} size={15} color={C.green} />
                </View>
                <Text style={styles.stepText}>{s.text}</Text>
              </View>
            ))}
          </Card>
        </View>

        <View style={{ paddingHorizontal: S.xl, marginTop: S.lg }}>
          <Text style={styles.note}>
            Referral tracking and credit payouts activate with the live backend. Credit cannot be
            withdrawn — it offsets trading fees.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.canvas },
  hero: {
    alignItems: 'center',
    padding: S.xxl,
    borderRadius: R.xl,
  },
  heroIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: {
    color: C.white,
    fontFamily: F.display,
    fontSize: 19,
    fontWeight: '800',
    marginTop: S.md,
  },
  heroSub: {
    color: 'rgba(255,255,255,0.85)',
    fontFamily: F.sans,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    marginTop: S.sm,
  },
  codeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.md,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: R.md,
    paddingHorizontal: S.lg,
    paddingVertical: 12,
    marginTop: S.lg,
    alignSelf: 'stretch',
    justifyContent: 'center',
  },
  code: { color: C.white, fontFamily: F.display, fontSize: 19, fontWeight: '800', letterSpacing: 1.5 },
  codeDivider: { width: 1, height: 18, backgroundColor: 'rgba(255,255,255,0.3)' },
  heroBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: C.white,
    paddingVertical: 13,
    borderRadius: R.md,
    marginTop: S.md,
    alignSelf: 'stretch',
  },
  heroBtnText: { color: C.greenDeep, fontFamily: F.sans, fontSize: 15, fontWeight: '800' },
  statRow: { flexDirection: 'row', gap: S.md },
  statValue: { color: C.ink, fontFamily: F.display, fontSize: 20, fontWeight: '800' },
  statLabel: { color: C.muted, fontFamily: F.sans, fontSize: 11, marginTop: 2 },
  section: {
    color: C.muted,
    fontFamily: F.sans,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: S.sm,
    marginLeft: S.xs,
  },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  stepIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: C.greenTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: { color: C.ink2, fontFamily: F.sans, fontSize: 13.5, flex: 1 },
  note: { color: C.faint, fontFamily: F.sans, fontSize: 12, lineHeight: 18, textAlign: 'center' },
});
