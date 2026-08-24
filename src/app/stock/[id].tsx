import { useMemo, useState } from 'react';
import { Dimensions, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import { Background } from '@/components/Background';
import {
  AppHeader,
  ChangePill,
  GlassCard,
  HalalBadge,
  PrimaryButton,
  SectionHeader,
  Stat,
  StockLogo,
} from '@/components/ui';
import { Sparkline } from '@/components/Sparkline';
import { getStock } from '@/data/stocks';
import { C, FONT, R, S } from '@/theme';
import { compact, genSpark, price } from '@/utils';

const RANGES = ['1D', '1W', '1M', '1Y', 'All'] as const;
type Range = (typeof RANGES)[number];

export default function StockDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const stock = getStock(String(id));
  const [range, setRange] = useState<Range>('1M');

  const chartW = Dimensions.get('window').width - S.xl * 2;

  const chart = useMemo(() => {
    if (!stock) return [];
    const idx = RANGES.indexOf(range);
    return genSpark(
      hash(stock.id) + idx * 7,
      36,
      0.015 + idx * 0.004,
      stock.changePct / 100 / 4,
    );
  }, [stock, range]);

  if (!stock) {
    return (
      <Background>
        <AppHeader title="Not found" showBack />
        <Text style={{ color: C.textMuted, padding: S.xl }}>
          This stock could not be found.
        </Text>
      </Background>
    );
  }

  const up = stock.changePct >= 0;
  const changeAbs = (stock.price * stock.changePct) / 100;

  return (
    <Background>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <AppHeader title={stock.ticker} subtitle={stock.name} showBack />

        {/* Price */}
        <View style={{ paddingHorizontal: S.xl }}>
          <View style={styles.priceHead}>
            <StockLogo ticker={stock.ticker} color={stock.color} size={48} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.priceBig}>{price(stock.price, stock.currency)}</Text>
              <View style={styles.priceChange}>
                <ChangePill value={stock.changePct} />
                <Text style={styles.priceChangeText}>
                  {up ? '+' : ''}
                  {price(changeAbs, stock.currency)} today
                </Text>
              </View>
            </View>
          </View>

          {/* Chart */}
          <View style={styles.chartBox}>
            <Sparkline
              data={chart}
              positive={up}
              width={chartW}
              height={150}
              strokeWidth={2.5}
            />
          </View>

          <View style={styles.ranges}>
            {RANGES.map((r) => (
              <Pressable
                key={r}
                onPress={() => setRange(r)}
                style={[styles.range, range === r && styles.rangeActive]}
              >
                <Text
                  style={[
                    styles.rangeText,
                    range === r && styles.rangeTextActive,
                  ]}
                >
                  {r}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Halal status */}
        <View style={{ paddingHorizontal: S.xl, marginTop: S.xl }}>
          <GlassCard
            variant={stock.sharia ? 'green' : 'default'}
            style={styles.halalCard}
          >
            <View style={styles.halalRow}>
              <HalalBadge compliant={stock.sharia} />
              <Text style={styles.halalMarket}>{stock.market} · {stock.sector}</Text>
            </View>
            <Text style={styles.halalNote}>{stock.shariaNote}</Text>
          </GlassCard>
        </View>

        {/* Key stats */}
        <View style={{ paddingHorizontal: S.xl, marginTop: S.xl }}>
          <SectionHeader title="Key statistics" ha="Bayanai" />
          <GlassCard style={styles.statsCard}>
            <View style={styles.statsGrid}>
              <View style={styles.statLine}>
                <Stat label="Market cap" value={`${stock.currency}${compact(stock.marketCap)}`} />
                <Stat label="P/E ratio" value={stock.peRatio.toFixed(1)} />
              </View>
              <View style={styles.statLine}>
                <Stat label="52w high" value={price(stock.high52, stock.currency)} />
                <Stat label="52w low" value={price(stock.low52, stock.currency)} />
              </View>
              <View style={styles.statLine}>
                <Stat label="Dividend yield" value={`${stock.dividendYield.toFixed(2)}%`} />
                <Stat label="Exchange" value={stock.market === 'NGX' ? 'NGX' : 'NASDAQ'} />
              </View>
            </View>
          </GlassCard>
        </View>

        {/* About */}
        <View style={{ paddingHorizontal: S.xl, marginTop: S.xl }}>
          <SectionHeader title="About" ha="Game da" />
          <GlassCard style={styles.aboutCard}>
            <Text style={styles.aboutText}>{stock.about}</Text>
          </GlassCard>
        </View>

        {/* Trade buttons */}
        <View style={styles.tradeRow}>
          <PrimaryButton label="Buy" icon="add" variant="solid" />
          <View style={{ width: 12 }} />
          <PrimaryButton label="Sell" icon="remove" variant="ghost" />
        </View>
      </ScrollView>
    </Background>
  );
}

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

const styles = StyleSheet.create({
  priceHead: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  priceBig: {
    color: C.text,
    fontFamily: FONT.sans,
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -1,
  },
  priceChange: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 },
  priceChangeText: {
    color: C.textMuted,
    fontFamily: FONT.sans,
    fontSize: 13,
    fontWeight: '500',
  },
  chartBox: {
    height: 160,
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginVertical: 8,
  },
  ranges: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: C.glass,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: R.pill,
    padding: 4,
    marginTop: 8,
  },
  range: { flex: 1, paddingVertical: 8, borderRadius: R.pill, alignItems: 'center' },
  rangeActive: { backgroundColor: C.accent },
  rangeText: {
    color: C.textMuted,
    fontFamily: FONT.sans,
    fontSize: 13,
    fontWeight: '700',
  },
  rangeTextActive: { color: '#04140E' },
  halalCard: { padding: 16, gap: 10 },
  halalRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  halalMarket: {
    color: C.textMuted,
    fontFamily: FONT.sans,
    fontSize: 12,
    fontWeight: '600',
  },
  halalNote: {
    color: C.text,
    fontFamily: FONT.sans,
    fontSize: 14,
    lineHeight: 21,
  },
  statsCard: { padding: 18 },
  statsGrid: { gap: 20 },
  statLine: { flexDirection: 'row', gap: 16 },
  aboutCard: { padding: 18 },
  aboutText: {
    color: C.text,
    fontFamily: FONT.sans,
    fontSize: 14.5,
    lineHeight: 22,
  },
  tradeRow: {
    flexDirection: 'row',
    paddingHorizontal: S.xl,
    marginTop: S.xl,
  },
});
