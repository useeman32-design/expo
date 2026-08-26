import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import { Card, ScreenHeader, StockLogo } from '@/components/primitives';
import { DIVIDENDS } from '@/services/support';
import { getStock } from '@/services/marketData';
import { money } from '@/utils';
import { C, F, R, S } from '@/theme';

export default function DividendsScreen() {
  const paid = DIVIDENDS.filter((d) => d.status === 'Paid');
  const total = paid.reduce((a, d) => a + d.total, 0);

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 48 }}>
        <ScreenHeader title="Dividends" subtitle="Corporate actions on your holdings" />

        <View style={{ paddingHorizontal: S.xl, marginTop: S.sm }}>
          <Card pad={S.xl} radius={R.xl}>
            <Text style={styles.totalLabel}>Total received</Text>
            <Text style={styles.total}>{money(total)}</Text>
            <Text style={styles.totalSub}>
              {paid.length} payments · withholding tax (10%) already deducted
            </Text>
          </Card>
        </View>

        <View style={{ paddingHorizontal: S.xl, marginTop: S.lg, gap: S.sm }}>
          {DIVIDENDS.map((d) => {
            const stock = getStock(d.ticker.toLowerCase());
            const processing = d.status === 'Processing';
            return (
              <Card key={d.id} pad={S.md} radius={R.md}>
                <View style={styles.row}>
                  <StockLogo
                    ticker={d.ticker}
                    color={stock?.color ?? C.green}
                    size={38}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.ticker}>{d.ticker}</Text>
                    <Text style={styles.sub}>
                      ₦{d.perShare.toFixed(2)} / share · {d.shares.toLocaleString()} shares
                    </Text>
                    <Text style={styles.date}>
                      Declared {d.declared} · Pays {d.payDate}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[styles.amount, processing && { color: C.muted }]}>
                      {money(d.total)}
                    </Text>
                    <View
                      style={[
                        styles.status,
                        { backgroundColor: processing ? '#F6A62318' : C.positiveSoft },
                      ]}
                    >
                      <Ionicons
                        name={processing ? 'time-outline' : 'checkmark'}
                        size={11}
                        color={processing ? '#F6A623' : C.green}
                      />
                      <Text
                        style={[
                          styles.statusText,
                          { color: processing ? '#F6A623' : C.green },
                        ]}
                      >
                        {d.status}
                      </Text>
                    </View>
                  </View>
                </View>
              </Card>
            );
          })}
        </View>

        <View style={{ paddingHorizontal: S.xl, marginTop: S.lg }}>
          <Text style={styles.note}>
            Dividends are credited automatically on payment date — no action needed from you.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.canvas },
  totalLabel: { color: C.muted, fontFamily: F.sans, fontSize: 13 },
  total: {
    color: C.ink,
    fontFamily: F.display,
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.8,
    marginTop: 4,
  },
  totalSub: { color: C.muted, fontFamily: F.sans, fontSize: 12.5, marginTop: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  ticker: { color: C.ink, fontFamily: F.display, fontSize: 14.5, fontWeight: '700' },
  sub: { color: C.ink2, fontFamily: F.sans, fontSize: 12, marginTop: 2 },
  date: { color: C.faint, fontFamily: F.sans, fontSize: 11, marginTop: 1 },
  amount: { fontFamily: F.mono, fontSize: 14.5, fontWeight: '700', color: C.ink },
  status: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: R.pill,
    marginTop: 4,
  },
  statusText: { fontFamily: F.sans, fontSize: 10.5, fontWeight: '700' },
  note: { color: C.faint, fontFamily: F.sans, fontSize: 12, lineHeight: 18, textAlign: 'center' },
});
