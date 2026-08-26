import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import { ScreenHeader, Card, Chip } from '@/components/primitives';
import { StockRow } from '@/components/StockRow';
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
import { useStore } from '@/store';
import { C, F, R, S, registerStyles, STATUSBAR } from '@/theme';

const TABS = ['Watchlist', 'Trending', 'Top Gainers', 'Top Losers', 'Most Active'] as const;
type Tab = (typeof TABS)[number];

export default function MarketsScreen() {
  const [tab, setTab] = useState<Tab>('Trending');
  const [q, setQ] = useState('');
  const indices = useMemo(() => getIndices().slice(0, 3), []);
  const { watchlist } = useStore();

  const list = useMemo(() => {
    if (q.trim()) return searchStocks(q);
    switch (tab) {
      case 'Watchlist':
        return watchlist.map((id) => getStock(id)).filter((s) => s !== undefined);
      case 'Trending':
        return getTrending(20);
      case 'Top Gainers':
        return getGainers(20);
      case 'Top Losers':
        return getLosers(20);
      case 'Most Active':
        return getMostActive(20);
      default:
        return getStocks();
    }
  }, [tab, q, watchlist]);

  return (
    <View style={styles.screen}>
      <StatusBar style={STATUSBAR} />
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

        {/* tabs */}
        {!q.trim() ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginTop: S.lg }}
            contentContainerStyle={{ paddingHorizontal: S.xl }}
          >
            {TABS.map((t) => (
              <Chip key={t} label={t} active={tab === t} onPress={() => setTab(t)} />
            ))}
          </ScrollView>
        ) : null}

        {/* list */}
        <View style={{ paddingHorizontal: S.xl, marginTop: S.lg }}>
          <Card pad={S.lg} style={{ paddingHorizontal: S.lg }}>
            {list.length ? (
              list.map((s, i) => (
                <StockRow key={s.id} stock={s} last={i === list.length - 1} />
              ))
            ) : q.trim() ? (
              <Text style={styles.empty}>No stocks found for “{q}”.</Text>
            ) : (
              <View style={styles.emptyWatch}>
                <Text style={styles.empty}>Nothing on your watchlist yet.</Text>
                <Text style={styles.emptyHint}>
                  Tap the ★ on any stock below to track it here.
                </Text>
              </View>
            )}
          </Card>
          <Text style={styles.note}>
            Nigerian Exchange (NGX) prices are live via MyStocks (delayed). US tickers show demo data.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const makeStyles = () => StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.canvas },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surface,
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
let styles = makeStyles();
registerStyles(() => { styles = makeStyles(); });
