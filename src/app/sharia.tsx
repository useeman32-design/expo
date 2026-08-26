import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import { Card, ScreenHeader, StockLogo } from '@/components/primitives';
import { getStocks } from '@/services/marketData';
import { C, F, R, S } from '@/theme';

/**
 * Sharia screening methodology + per-stock results.
 * Production: compliance data refreshes from the screening provider nightly;
 * a compliance-change event fires a push notification.
 */

const CRITERIA = [
  {
    icon: 'scale-outline',
    title: 'Debt ratio',
    body: 'Total interest-bearing debt is less than 33% of the company\'s market value (AAOIFI Standard 21).',
  },
  {
    icon: 'cube-outline',
    title: 'Business activity',
    body: 'Less than 5% of revenue comes from alcohol, gambling, pork, adult entertainment, or conventional banking and insurance.',
  },
  {
    icon: 'percent-outline',
    title: 'Interest income',
    body: 'Interest and other non-compliant income is less than 5% of total revenue.',
  },
  {
    icon: 'water-outline',
    title: 'Purification',
    body: 'For any residual non-compliant income a portfolio earns, an equivalent amount is donated — a purification calculator is coming.',
  },
];

// Halal screen results for our NGX universe (mock, AAOIFI-style).
const SCREEN: Record<string, boolean> = {
  dangcem: true, buacement: true, buafoods: true, mtnn: true, airtelafri: true,
  seplat: true, aradel: true, wapco: true, presco: true, nestle: true,
  'dang sugar': true, transcorp: true, oando: true,
  // banks & brewers screened out (riba / non-compliant revenue)
  gtco: false, zenithbank: false, fbnh: false, uba: false, stanbic: false,
  accesscorp: false, wemabank: false, fidelitybk: false, jaizbank: true,
};

export default function ShariaScreen() {
  const stocks = getStocks().filter((s) => s.market === 'NGX');
  const compliant = stocks.filter((s) => SCREEN[s.id] !== false);

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 48 }}>
        <ScreenHeader title="Sharia Screening" subtitle="AAOIFI Standard 21 methodology" />

        {/* intro */}
        <View style={{ paddingHorizontal: S.xl, marginTop: S.sm }}>
          <Card pad={S.xl} radius={R.xl}>
            <View style={styles.introRow}>
              <View style={styles.moonIcon}>
                <Text style={styles.moon}>☾</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.introTitle}>Invest aligned with your values</Text>
                <Text style={styles.introSub}>
                  {compliant.length} of {stocks.length} NGX stocks on StocksX currently pass the
                  screen. Look for the badge across the app.
                </Text>
              </View>
            </View>
          </Card>
        </View>

        {/* criteria */}
        <View style={{ paddingHorizontal: S.xl, marginTop: S.lg }}>
          <Text style={styles.section}>What we check</Text>
          <Card pad={S.xl} radius={R.xl}>
            {CRITERIA.map((c, i) => (
              <View key={c.title} style={[styles.critRow, i < CRITERIA.length - 1 && styles.critGap]}>
                <View style={styles.critIcon}>
                  <Ionicons name={c.icon as never} size={16} color={C.green} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.critTitle}>{c.title}</Text>
                  <Text style={styles.critBody}>{c.body}</Text>
                </View>
              </View>
            ))}
          </Card>
        </View>

        {/* results */}
        <View style={{ paddingHorizontal: S.xl, marginTop: S.lg }}>
          <Text style={styles.section}>Screening results · NGX</Text>
          <View style={{ gap: S.sm, marginTop: S.sm }}>
            {stocks.map((s) => {
              const pass = SCREEN[s.id] !== false;
              return (
                <Card key={s.id} pad={S.md} radius={R.md}>
                  <View style={styles.row}>
                    <StockLogo ticker={s.ticker} color={s.color} size={36} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.ticker}>{s.ticker}</Text>
                      <Text style={styles.name} numberOfLines={1}>
                        {s.name}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.badge,
                        { backgroundColor: pass ? C.positiveSoft : C.negativeSoft },
                      ]}
                    >
                      <Ionicons
                        name={pass ? 'shield-checkmark' : 'shield-outline'}
                        size={12}
                        color={pass ? C.green : C.negative}
                      />
                      <Text style={[styles.badgeText, { color: pass ? C.green : C.negative }]}>
                        {pass ? 'Halal' : 'Screened out'}
                      </Text>
                    </View>
                  </View>
                </Card>
              );
            })}
          </View>
        </View>

        <View style={{ paddingHorizontal: S.xl, marginTop: S.lg }}>
          <Text style={styles.note}>
            A screening badge is an analytical result, not a religious ruling. For personal guidance
            please consult a qualified scholar. Results refresh nightly once the live data feed is
            connected.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.canvas },
  introRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  moonIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: C.greenTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moon: { fontSize: 22, color: C.green },
  introTitle: { color: C.ink, fontFamily: F.display, fontSize: 15.5, fontWeight: '700' },
  introSub: { color: C.muted, fontFamily: F.sans, fontSize: 12.5, lineHeight: 18, marginTop: 3 },
  section: {
    color: C.muted,
    fontFamily: F.sans,
    fontSize: 13,
    fontWeight: '700',
    marginLeft: S.xs,
  },
  critRow: { flexDirection: 'row', gap: 12 },
  critGap: { paddingBottom: S.lg, marginBottom: S.lg, borderBottomWidth: 1, borderBottomColor: C.hairlineSoft },
  critIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: C.greenTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  critTitle: { color: C.ink, fontFamily: F.sans, fontSize: 14, fontWeight: '700' },
  critBody: { color: C.muted, fontFamily: F.sans, fontSize: 12.5, lineHeight: 18, marginTop: 2 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  ticker: { color: C.ink, fontFamily: F.display, fontSize: 13.5, fontWeight: '700' },
  name: { color: C.muted, fontFamily: F.sans, fontSize: 11, marginTop: 1 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: R.pill,
  },
  badgeText: { fontFamily: F.sans, fontSize: 10.5, fontWeight: '700' },
  note: { color: C.faint, fontFamily: F.sans, fontSize: 12, lineHeight: 18, textAlign: 'center' },
});
