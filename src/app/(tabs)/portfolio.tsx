import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import { Button, Card, ChangePill, ScreenHeader, SectionTitle, Stat, StockLogo } from '@/components/primitives';
import { TransferSheet } from '@/components/TransferSheet';
import { useStore } from '@/store';
import { getLogo } from '@/services/logos';
import { getHoldings, getPortfolio } from '@/services/portfolio';
import { C, F, R, S, SH } from '@/theme';
import { money, pct } from '@/utils';

export default function PortfolioScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const store = useStore();
  const p = useMemo(() => getPortfolio(), []);
  const holdings = useMemo(() => getHoldings(store.holdings), [store.holdings]);
  const [transfer, setTransfer] = useState<{ open: boolean; mode: 'deposit' | 'withdraw' }>({
    open: false,
    mode: 'deposit',
  });

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 110 }}>
        <ScreenHeader
          title="Portfolio"
          subtitle="Your investments"
          right={
            <Pressable
              onPress={() => router.push('/orders')}
              style={styles.ordersBtn}
            >
              <Ionicons name="receipt-outline" size={16} color={C.green} />
              <Text style={styles.ordersText}>Orders</Text>
            </Pressable>
          }
        />

        {/* summary */}
        <View style={{ paddingHorizontal: S.xl, marginTop: S.sm }}>
          <Card pad={S.xl} radius={R.xl}>
            <Text style={styles.sumLabel}>Total Portfolio Value</Text>
            <Text style={styles.sumValue}>{money(p.totalValue)}</Text>
            <View style={styles.sumChange}>
              <ChangePill value={p.todayPct} />
              <Text style={styles.sumChangeText}>
                +{money(p.todayPl)} today
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.grid}>
              <Stat label="Total Return" value={`+${money(p.totalReturn)}`} valueColor={C.positive} />
              <View style={styles.gridLine} />
              <View>
                <Text style={styles.miniLabel}>Return %</Text>
                <Text style={[styles.miniValue, { color: C.positive }]}>
                  {pct(p.totalReturnPct)}
                </Text>
              </View>
            </View>
            <View style={[styles.grid, { marginTop: S.lg }]}>
              <Stat label="Cash Balance" value={money(store.cash)} />
              <View style={styles.gridLine} />
              <View>
                <Text style={styles.miniLabel}>Buying Power</Text>
                <Text style={styles.miniValue}>{money(store.cash)}</Text>
              </View>
            </View>
          </Card>

          <View style={styles.actionRow}>
            <Button label="Deposit" icon="add" variant="primary" block onPress={() => setTransfer({ open: true, mode: 'deposit' })} />
            <View style={{ width: 12 }} />
            <Button label="Withdraw" icon="arrow-up" variant="light" block onPress={() => setTransfer({ open: true, mode: 'withdraw' })} />
          </View>
        </View>

        {/* allocation */}
        <View style={{ paddingHorizontal: S.xl, marginTop: S.xxl }}>
          <SectionTitle title="Allocation" />
          <Card pad={S.lg}>
            <View style={styles.allocBar}>
              {holdings.map((h) => (
                <View
                  key={h.stockId}
                  style={{
                    flex: h.portion,
                    backgroundColor: h.color,
                    marginHorizontal: 1,
                    borderRadius: 4,
                    height: 10,
                  }}
                />
              ))}
            </View>
            <View style={styles.allocLegend}>
              {holdings.slice(0, 4).map((h) => (
                <View key={h.stockId} style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: h.color }]} />
                  <Text style={styles.legendText}>{h.ticker}</Text>
                </View>
              ))}
            </View>
          </Card>
        </View>

        {/* holdings */}
        <View style={{ paddingHorizontal: S.xl, marginTop: S.xxl }}>
          <SectionTitle title="Holdings" />
          <Card pad={S.lg} style={{ paddingHorizontal: S.lg }}>
            {holdings.map((h, i) => {
              const up = h.pl >= 0;
              return (
                <Pressable
                  key={h.stockId}
                  onPress={() => router.push(`/stock/${h.stockId}`)}
                  style={[styles.holding, i < holdings.length - 1 && styles.holdingDiv]}
                >
                  <StockLogo ticker={h.ticker} color={h.color} size={40} logo={getLogo(h.stockId)} />
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={styles.hTicker}>{h.ticker}</Text>
                    <Text style={styles.hShares}>
                      {h.shares.toLocaleString()} sh · Avg ₦{h.avgPrice.toFixed(2)}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 2 }}>
                    <Text style={styles.hValue}>{money(h.value)}</Text>
                    <Text style={[styles.hPl, { color: up ? C.positive : C.negative }]}>
                      {pct(h.plPct)}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </Card>
        </View>
        <View style={{ height: insets.bottom }} />
      </ScrollView>
      <TransferSheet
        visible={transfer.open}
        onClose={() => setTransfer((t) => ({ ...t, open: false }))}
        mode={transfer.mode}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.canvas },
  ordersBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: C.greenSoft,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: R.pill,
  },
  ordersText: {
    color: C.green,
    fontFamily: F.sans,
    fontSize: 13,
    fontWeight: '700',
  },
  sumLabel: {
    color: C.muted,
    fontFamily: F.sans,
    fontSize: 13.5,
    fontWeight: '600',
  },
  sumValue: {
    color: C.ink,
    fontFamily: F.display,
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -1,
    marginTop: 2,
  },
  sumChange: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 6 },
  sumChangeText: {
    color: C.muted,
    fontFamily: F.sans,
    fontSize: 13,
    fontWeight: '600',
  },
  divider: { height: 1, backgroundColor: C.hairline, marginVertical: S.lg },
  grid: { flexDirection: 'row', alignItems: 'center' },
  gridLine: { width: 1, height: 30, backgroundColor: C.hairline, marginHorizontal: S.md },
  miniLabel: {
    color: C.faint,
    fontFamily: F.sans,
    fontSize: 12,
    fontWeight: '600',
  },
  miniValue: {
    color: C.ink,
    fontFamily: F.mono,
    fontSize: 15,
    fontWeight: '800',
    marginTop: 2,
  },
  allocBar: { flexDirection: 'row', marginBottom: S.md },
  allocLegend: { flexDirection: 'row', flexWrap: 'wrap', gap: S.md },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 3 },
  legendText: {
    color: C.ink2,
    fontFamily: F.sans,
    fontSize: 12.5,
    fontWeight: '600',
  },
  holding: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: S.md,
    gap: 12,
  },
  holdingDiv: { borderBottomWidth: 1, borderBottomColor: C.hairlineSoft },
  hTicker: {
    color: C.ink,
    fontFamily: F.sans,
    fontSize: 15,
    fontWeight: '700',
  },
  hShares: {
    color: C.muted,
    fontFamily: F.sans,
    fontSize: 12.5,
  },
  hValue: {
    color: C.ink,
    fontFamily: F.mono,
    fontSize: 14.5,
    fontWeight: '700',
  },
  hPl: {
    fontFamily: F.mono,
    fontSize: 12,
    fontWeight: '700',
  },
  actionRow: {
    flexDirection: 'row',
    marginTop: S.md,
  },
});
