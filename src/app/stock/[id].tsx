import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { compact, pct, price } from '@/utils';
import type { OrderSide } from '@/types';
import { Card, ScreenHeader, SectionTitle, Stat, StockLogo } from '@/components/primitives';
import { TradingViewChart } from '@/components/TradingViewChart';
import { TIMEFRAME_ORDER, type Timeframe } from '@/services/chartData';
import { TradeSheet } from '@/components/TradeSheet';
import { getStock } from '@/services/marketData';
import { getLogo } from '@/services/logos';
import { C, F, R, S } from '@/theme';

export default function StockDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const stock = getStock(String(id));
  const [watch, setWatch] = useState(false);
  const [chartType, setChartType] = useState<'line' | 'candles'>('candles');
  const [timeframe, setTimeframe] = useState<Timeframe>('3M');
  const [trade, setTrade] = useState<{ open: boolean; side: OrderSide }>({
    open: false,
    side: 'Buy',
  });

  if (!stock) {
    return (
      <View style={styles.screen}>
        <ScreenHeader title="Not found" showBack />
        <Text style={{ color: C.muted, padding: S.xl }}>Stock not found.</Text>
      </View>
    );
  }

  const up = stock.changePct >= 0;
  const cur = stock.currency === 'NGN' ? '₦' : '$';

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 96 }}>
        {/* green header */}
        <LinearGradient colors={[C.hero1, C.hero2, C.hero3]} style={styles.header}>
          <View style={styles.headerPad}>
            <View style={[styles.headerNav, { marginTop: insets.top + 8 }]}>
              <Pressable onPress={() => router.back()} style={styles.navBtn}>
                <Ionicons name="chevron-back" size={22} color={C.white} />
              </Pressable>
              <Pressable onPress={() => setWatch((v) => !v)} style={styles.navBtn}>
                <Ionicons name={watch ? 'star' : 'star-outline'} size={20} color={C.white} />
              </Pressable>
            </View>

            <View style={styles.headerTitle}>
              <StockLogo ticker={stock.ticker} color={stock.color} size={44} logo={getLogo(stock.id)} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.ticker}>{stock.ticker}</Text>
                <Text style={styles.name} numberOfLines={1}>{stock.name}</Text>
              </View>
              <View style={styles.marketTag}>
                <Text style={styles.marketTagText}>{stock.market}</Text>
              </View>
            </View>

            <View style={styles.priceRow}>
              <Text style={styles.price}>{price(stock.price, cur)}</Text>
              <Pressable
                onPress={() => router.push(`/rules?stock=${stock.id}` as never)}
                style={({ pressed }) => [styles.posBtn, pressed && { opacity: 0.75 }]}
                accessibilityLabel="Set up a position for this stock"
              >
                <Ionicons name="flash" size={13} color={C.white} />
                <Text style={styles.posBtnText}>POSITION</Text>
              </Pressable>
            </View>
            <View style={styles.changeRow}>
              <View style={[styles.whitePill, !up && styles.whitePillDown]}>
                <Ionicons name={up ? 'caret-up' : 'caret-down'} size={11} color={C.white} />
                <Text style={styles.whitePillText}>{pct(stock.changePct)}</Text>
              </View>
              <Text style={styles.changeText}>
                {up ? '+' : ''}{price(stock.changeAbs, cur)} ({pct(stock.changePct)}) Today
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* content */}
        <View style={styles.content}>
          {/* chart */}
          <Card pad={S.lg} radius={R.xl}>
            <View style={styles.chartTypes}>
              {(['line', 'candles'] as const).map((t) => (
                <Pressable
                  key={t}
                  onPress={() => setChartType(t)}
                  style={[styles.chartType, chartType === t && styles.chartTypeActive]}
                >
                  <Text style={[styles.chartTypeText, chartType === t && styles.chartTypeTextActive]}>
                    {t === 'line' ? 'Line' : 'Candles'}
                  </Text>
                </Pressable>
              ))}
              <View style={{ flex: 1 }} />
              <Text style={styles.liveTag}>● LIVE</Text>
            </View>
            <View style={{ marginTop: S.sm }}>
              <TradingViewChart stock={stock} type={chartType} timeframe={timeframe} height={320} />
            </View>
            <View style={styles.ranges}>
              {TIMEFRAME_ORDER.map((r) => (
                <Pressable
                  key={r}
                  onPress={() => setTimeframe(r)}
                  style={[styles.range, timeframe === r && styles.rangeActive]}
                >
                  <Text style={[styles.rangeText, timeframe === r && styles.rangeTextActive]}>{r}</Text>
                </Pressable>
              ))}
            </View>
          </Card>

          {/* stats */}
          <View style={{ marginTop: S.xxl }}>
            <SectionTitle title="Key statistics" />
            <Card pad={S.lg}>
              <View style={styles.statRow}>
                <Stat label="Open" value={price(stock.open, cur)} />
                <Stat label="High" value={price(stock.high, cur)} />
              </View>
              <View style={styles.statRow}>
                <Stat label="Low" value={price(stock.low, cur)} />
                <Stat label="Prev Close" value={price(stock.prevClose, cur)} />
              </View>
              <View style={styles.statRow}>
                <Stat label="Volume" value={stock.volume.toLocaleString()} />
                <Stat label="Market Cap" value={`${cur}${compact(stock.marketCap)}`} />
              </View>
              <View style={[styles.statRow, { borderBottomWidth: 0 }]}>
                <Stat label="P/E Ratio" value={stock.peRatio.toFixed(1)} />
                <Stat label="Dividend Yield" value={`${stock.divYield.toFixed(2)}%`} />
              </View>
            </Card>
          </View>

          {/* about */}
          <View style={{ marginTop: S.xxl }}>
            <SectionTitle title={`About ${stock.ticker}`} />
            <Card pad={S.lg}>
              <Text style={styles.aboutText}>{stock.about}</Text>
            </Card>
          </View>

          {/* news */}
          {stock.news.length ? (
            <View style={{ marginTop: S.xxl }}>
              <SectionTitle title="News" />
              <View style={{ gap: S.md }}>
                {stock.news.map((n) => (
                  <Card key={n.id} pad={S.lg} radius={R.lg}>
                    <Text style={styles.newsTitle}>{n.title}</Text>
                    <View style={styles.newsMeta}>
                      <Text style={styles.newsSource}>{n.source}</Text>
                      <Text style={styles.newsDot}>·</Text>
                      <Text style={styles.newsTime}>{n.time}</Text>
                    </View>
                  </Card>
                ))}
              </View>
            </View>
          ) : null}
        </View>
      </ScrollView>

      {/* BUY / SELL bar */}
      <View style={styles.actionBar}>
        <BuySellButton label="BUY" tone="green" onPress={() => setTrade({ open: true, side: 'Buy' })} />
        <View style={{ width: 10 }} />
        <BuySellButton label="SELL" tone="red" onPress={() => setTrade({ open: true, side: 'Sell' })} />
      </View>

      <TradeSheet
        visible={trade.open}
        onClose={() => setTrade((t) => ({ ...t, open: false }))}
        stock={stock}
        initialSide={trade.side}
      />
    </View>
  );
}

function BuySellButton({ label, tone, onPress }: { label: string; tone: 'green' | 'red'; onPress?: () => void }) {
  const bg = tone === 'green' ? C.green : C.negative;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.bsBtn, { backgroundColor: bg }, pressed && { opacity: 0.88 }]}
    >
      <Text style={styles.bsText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.canvas },
  header: { borderBottomLeftRadius: 28, borderBottomRightRadius: 28, overflow: 'hidden' },
  headerPad: { paddingHorizontal: S.xl, paddingBottom: S.xl },
  headerNav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  navBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flexDirection: 'row', alignItems: 'center', marginTop: S.lg },
  ticker: { color: C.white, fontFamily: F.display, fontSize: 22, fontWeight: '800', letterSpacing: 0.3 },
  name: { color: 'rgba(255,255,255,0.85)', fontFamily: F.sans, fontSize: 13.5, marginTop: 1 },
  marketTag: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 9, paddingVertical: 4, borderRadius: R.sm },
  marketTagText: { color: C.white, fontFamily: F.sans, fontSize: 11, fontWeight: '800' },
  price: { color: C.white, fontFamily: F.display, fontSize: 40, fontWeight: '800', letterSpacing: -1.3, marginTop: S.md },
  priceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: S.md },
  posBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: R.pill,
  },
  posBtnText: { color: C.white, fontFamily: F.sans, fontSize: 12.5, fontWeight: '800', letterSpacing: 0.6 },
  changeRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 },
  whitePill: { flexDirection: 'row', alignItems: 'center', gap: 2, backgroundColor: 'rgba(255,255,255,0.22)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: R.sm },
  whitePillDown: { backgroundColor: C.negative },
  whitePillText: { color: C.white, fontFamily: F.sans, fontSize: 12, fontWeight: '700' },
  changeText: { color: 'rgba(255,255,255,0.92)', fontFamily: F.sans, fontSize: 13, fontWeight: '600' },
  content: { paddingHorizontal: S.xl, marginTop: S.lg },
  chartTypes: { flexDirection: 'row', gap: 8, marginBottom: S.md },
  chartType: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: R.pill, backgroundColor: C.canvasAlt },
  chartTypeActive: { backgroundColor: C.green },
  chartTypeText: { color: C.muted, fontFamily: F.sans, fontSize: 12.5, fontWeight: '700' },
  chartTypeTextActive: { color: C.white },
  liveTag: { color: C.positive, fontFamily: F.sans, fontSize: 11, fontWeight: '800' },
  ranges: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: C.canvasAlt,
    borderRadius: R.pill,
    padding: 4,
    marginTop: S.md,
  },
  range: { flex: 1, paddingVertical: 8, borderRadius: R.pill, alignItems: 'center' },
  rangeActive: {
    backgroundColor: C.white,
    shadowColor: '#0A3D28',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 1,
  },
  rangeText: { color: C.muted, fontFamily: F.sans, fontSize: 12.5, fontWeight: '700' },
  rangeTextActive: { color: C.greenDark },
  statRow: { flexDirection: 'row', paddingVertical: S.md, borderBottomWidth: 1, borderBottomColor: C.hairlineSoft, gap: 12 },
  aboutText: { color: C.ink2, fontFamily: F.sans, fontSize: 14.5, lineHeight: 22 },
  newsTitle: { color: C.ink, fontFamily: F.sans, fontSize: 14.5, fontWeight: '600', lineHeight: 20 },
  newsMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  newsSource: { color: C.green, fontFamily: F.sans, fontSize: 12, fontWeight: '700' },
  newsDot: { color: C.faint },
  newsTime: { color: C.faint, fontFamily: F.sans, fontSize: 12 },
  actionBar: { position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', paddingHorizontal: S.xl, paddingTop: S.md, paddingBottom: 24, backgroundColor: 'rgba(244,246,245,0.96)' },
  bsBtn: { flex: 1, paddingVertical: 16, borderRadius: R.md, alignItems: 'center' },
  bsText: { color: C.white, fontFamily: F.sans, fontSize: 16, fontWeight: '800', letterSpacing: 0.5 },
});
