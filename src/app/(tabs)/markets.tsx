import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import { Card, Chip, ChangePill, ScreenHeader } from '@/components/primitives';
import { StockLogo } from '@/components/primitives';
import { IndexCard } from '@/components/IndexCard';
import {
  getGainers,
  getIndices,
  getLosers,
  getMostActive,
  getStock,
  getStocks,
  getTrending,
  searchStocks,
} from '@/services/marketData';
import { getLogo } from '@/services/logos';
import { useStore } from '@/store';
import { C, F, R, S, SH } from '@/theme';
import { price } from '@/utils';
import type { Stock } from '@/types';
import { useRouter } from 'expo-router';

const TABS = ['Watchlist', 'Trending', 'Top Gainers', 'Top Losers', 'Most Active'] as const;
type Tab = (typeof TABS)[number];

/** One tile in the markets grid — real logo, ticker, price and daily change. */
function StockTile({ stock }: { stock: Stock }) {
  const router = useRouter();
  return (
    <Pressable
      onPress={() => router.push(`/stock/${stock.id}`)}
      style={({ pressed }) => [styles.tile, pressed && { opacity: 0.65, transform: [{ scale: 0.98 }] }]}
    >
      <StockLogo ticker={stock.ticker} color={stock.color} size={40} logo={getLogo(stock.id)} />
      <Text style={styles.tileTicker} numberOfLines={1}>
        {stock.ticker}
      </Text>
      <Text style={styles.tilePrice} numberOfLines={1}>
        {price(stock.price, stock.currency === 'NGN' ? '₦' : '$')}
      </Text>
      <ChangePill value={stock.changePct} />
    </Pressable>
  );
}

export default function MarketsScreen() {
  const [tab, setTab] = useState<Tab>('Trending');
  const [q, setQ] = useState('');
  const { width } = useWindowDimensions();
  const indices = useMemo(() => getIndices().slice(0, 3), []);
  const { watchlist } = useStore();

  const cols = width >= 1024 ? 8 : width >= 640 ? 6 : 4;

  const list = useMemo(() => {
    if (q.trim()) return searchStocks(q);
    switch (tab) {
      case 'Watchlist':
        return watchlist.map((id) => getStock(id)).filter((s) => s !== undefined);
      case 'Trending':
        return getTrending(24);
      case 'Top Gainers':
        return getGainers(24);
      case 'Top Losers':
        return getLosers(24);
      case 'Most Active':
        return getMostActive(24);
      default:
        return getStocks();
    }
  }, [tab, q, watchlist]);

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 110 }}>
        <ScreenHeader title="Markets" subtitle="Track Nigerian & global stocks" />

        {/* search */}
        <View style={{ paddingHorizontal: S.xl, marginTop: S.sm }}>
          <View style={styles.search}>
            <Text style={styles.searchIcon}>⌕</Text>
            <TextInput
              value={q}
              onChangeText={setQ}
              placeholder="Search stocks, companies and ETFs"
              placeholderTextColor={C.faint}
              style={styles.searchInput}
            />
          </View>
        </View>

        {/* indices */}
        <View style={{ paddingHorizontal: S.xl, marginTop: S.lg }}>
          <View style={styles.indexRow}>
            {indices.map((ix) => (
              <IndexCard key={ix.id} index={ix} />
            ))}
          </View>
        </View>

        {/* tabs (wrap — nothing slides off-screen) */}
        {!q.trim() ? (
          <View style={styles.tabs}>
            {TABS.map((t) => (
              <Chip key={t} label={t} active={tab === t} onPress={() => setTab(t)} />
            ))}
          </View>
        ) : null}

        {/* grid */}
        <View style={{ paddingHorizontal: S.xl, marginTop: S.lg }}>
          {list.length ? (
            <View style={styles.grid}>
              {list.map((s) => (
                <View key={s.id} style={[styles.gridItem, { width: `${100 / cols}%` }]}>
                  <StockTile stock={s} />
                </View>
              ))}
            </View>
          ) : q.trim() ? (
            <Card pad={S.lg} style={{ paddingHorizontal: S.lg }}>
              <Text style={styles.empty}>No stocks found for “{q}”.</Text>
            </Card>
          ) : (
            <Card pad={S.lg} style={{ paddingHorizontal: S.lg }}>
              <View style={styles.emptyWatch}>
                <Text style={styles.empty}>Nothing on your watchlist yet.</Text>
                <Text style={styles.emptyHint}>
                  Tap the ★ on any stock to track it on your home screen.
                </Text>
              </View>
            </Card>
          )}
          <Text style={styles.note}>
            NGX prices are live via MyStocks Africa (delayed). US tickers show demo data.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.canvas },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.hairline,
    borderRadius: R.md,
    paddingHorizontal: 14,
    height: 50,
  },
  searchIcon: { color: C.faint, fontSize: 20, marginRight: 10 },
  searchInput: {
    flex: 1,
    color: C.ink,
    fontFamily: F.sans,
    fontSize: 15,
  },
  indexRow: { flexDirection: 'row', gap: S.md },
  tabs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 8,
    paddingHorizontal: S.xl,
    marginTop: S.lg,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  gridItem: { padding: 4 },
  tile: {
    flex: 1,
    backgroundColor: C.white,
    borderRadius: R.md,
    borderWidth: 1,
    borderColor: C.hairline,
    alignItems: 'center',
    gap: 5,
    paddingVertical: 13,
    paddingHorizontal: 4,
    ...SH.card,
  },
  tileTicker: {
    color: C.ink,
    fontFamily: F.display,
    fontSize: 12.5,
    fontWeight: '700',
    letterSpacing: 0.2,
    alignSelf: 'stretch',
    textAlign: 'center',
  },
  tilePrice: {
    color: C.ink2,
    fontFamily: F.mono,
    fontSize: 11,
    fontWeight: '700',
  },
  empty: {
    color: C.muted,
    fontFamily: F.sans,
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 30,
  },
  note: {
    color: C.faint,
    fontFamily: F.sans,
    fontSize: 11,
    textAlign: 'center',
    marginTop: S.md,
  },
  emptyWatch: { alignItems: 'center', paddingVertical: 24, gap: 4 },
  emptyHint: { color: C.faint, fontFamily: F.sans, fontSize: 12.5 },
});
