import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { Background } from '@/components/Background';
import {
  AppHeader,
  ChangePill,
  GlassCard,
  SectionHeader,
  StockLogo,
} from '@/components/ui';
import { HOLDINGS, getPortfolio } from '@/data/stocks';
import { C, FONT, R, S } from '@/theme';
import { money, pct, NGN_PER_USD } from '@/utils';

interface Row {
  id: string;
  ticker: string;
  name: string;
  color: string;
  shares: number;
  value: number;
  pl: number;
  plPct: number;
  portion: number;
}

export default function PortfolioScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const portfolio = useMemo(() => getPortfolio(), []);

  const rows = useMemo<Row[]>(() => {
    const built = HOLDINGS.map((h) => {
      const s = STOCKS_BY_ID[h.stockId]!;
      const fx = s.currency === '$' ? NGN_PER_USD : 1;
      const value = s.price * h.shares * fx;
      const pl = (s.price - h.avgPrice) * h.shares * fx;
      return {
        id: s.id,
        ticker: s.ticker,
        name: s.name,
        color: s.color,
        shares: h.shares,
        value,
        pl,
        plPct: h.avgPrice > 0 ? (s.price / h.avgPrice - 1) * 100 : 0,
        portion: 0,
      };
    });
    const total = built.reduce((a, b) => a + b.value, 0);
    built.forEach((r) => (r.portion = total > 0 ? r.value / total : 0));
    return built.sort((a, b) => b.value - a.value);
  }, []);

  return (
    <Background>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 130 }}
      >
        <AppHeader title="Portfolio" subtitle="Your holdings" />

        {/* Summary */}
        <View style={{ paddingHorizontal: S.xl }}>
          <GlassCard variant="green" style={styles.summary}>
            <Text style={styles.sumLabel}>Total dukiya</Text>
            <Text style={styles.sumValue}>{money(portfolio.value)}</Text>
            <View style={styles.sumChange}>
              <ChangePill value={portfolio.plPct} />
              <Text style={styles.sumChangeText}>
                {money(portfolio.pl)} all-time
              </Text>
            </View>

            {/* Allocation bar */}
            <View style={styles.allocBar}>
              {rows.map((r) => (
                <View
                  key={r.id}
                  style={{
                    flex: r.portion,
                    backgroundColor: r.color,
                    marginHorizontal: 1,
                    borderRadius: 3,
                    height: 8,
                  }}
                />
              ))}
            </View>
            <View style={styles.allocLegend}>
              {rows.slice(0, 3).map((r) => (
                <View key={r.id} style={styles.legendItem}>
                  <View
                    style={[styles.legendDot, { backgroundColor: r.color }]}
                  />
                  <Text style={styles.legendText}>{r.ticker}</Text>
                </View>
              ))}
              <Text style={styles.legendMore}>+{Math.max(0, rows.length - 3)}</Text>
            </View>
          </GlassCard>
        </View>

        {/* Holdings */}
        <View style={{ paddingHorizontal: S.xl, marginTop: S.xxxl }}>
          <SectionHeader title="Holdings" ha="Zuba jari" />
          <GlassCard style={styles.listCard}>
            <View style={{ paddingHorizontal: 16 }}>
              {rows.map((r, i) => {
                const up = r.pl >= 0;
                return (
                  <Pressable
                    key={r.id}
                    onPress={() => router.push(`/stock/${r.id}`)}
                    style={[
                      styles.holding,
                      i < rows.length - 1 && styles.holdingDiv,
                    ]}
                  >
                    <StockLogo ticker={r.ticker} color={r.color} size={40} />
                    <View style={styles.holdingInfo}>
                      <Text style={styles.holdingTicker}>{r.ticker}</Text>
                      <Text style={styles.holdingShares}>
                        {r.shares.toLocaleString()} shares
                      </Text>
                    </View>
                    <View style={styles.holdingRight}>
                      <Text style={styles.holdingValue}>{money(r.value)}</Text>
                      <Text
                        style={[
                          styles.holdingPl,
                          { color: up ? C.positive : C.negative },
                        ]}
                      >
                        {pct(r.plPct)}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </GlassCard>
        </View>

        <View style={{ height: insets.bottom }} />
      </ScrollView>
    </Background>
  );
}

// quick lookup for stocks by id
import { STOCKS } from '@/data/stocks';
const STOCKS_BY_ID = Object.fromEntries(STOCKS.map((s) => [s.id, s]));

const styles = StyleSheet.create({
  summary: { padding: 22, gap: 6 },
  sumLabel: {
    color: C.textMuted,
    fontFamily: FONT.sans,
    fontSize: 13,
    fontWeight: '500',
  },
  sumValue: {
    color: C.text,
    fontFamily: FONT.sans,
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: -1,
  },
  sumChange: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 },
  sumChangeText: {
    color: C.textMuted,
    fontFamily: FONT.sans,
    fontSize: 13,
    fontWeight: '500',
  },
  allocBar: {
    flexDirection: 'row',
    marginTop: 18,
    marginBottom: 10,
  },
  allocLegend: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 9, height: 9, borderRadius: 3 },
  legendText: {
    color: C.textMuted,
    fontFamily: FONT.sans,
    fontSize: 12,
    fontWeight: '600',
  },
  legendMore: {
    color: C.textFaint,
    fontFamily: FONT.sans,
    fontSize: 12,
  },
  listCard: { paddingVertical: 4 },
  holding: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 12,
  },
  holdingDiv: { borderBottomWidth: 1, borderBottomColor: C.border },
  holdingInfo: { flex: 1, gap: 2 },
  holdingTicker: {
    color: C.text,
    fontFamily: FONT.sans,
    fontSize: 15,
    fontWeight: '700',
  },
  holdingShares: {
    color: C.textMuted,
    fontFamily: FONT.sans,
    fontSize: 12,
  },
  holdingRight: { alignItems: 'flex-end', gap: 2 },
  holdingValue: {
    color: C.text,
    fontFamily: FONT.mono,
    fontSize: 15,
    fontWeight: '700',
  },
  holdingPl: {
    fontFamily: FONT.mono,
    fontSize: 12,
    fontWeight: '700',
  },
});
