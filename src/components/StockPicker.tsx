import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';

import { StockLogo } from '@/components/primitives';
import { getLogo } from '@/services/logos';
import type { Stock } from '@/types';
import { price as fmtPrice } from '@/utils';
import { C, F, R, S, registerStyles } from '@/theme';

/**
 * Stock selection grid used wherever the user picks a stock to activate
 * something (auto-trade position, price alert, …). Shows the real company
 * logo on every tile and folds in a search box so the full NGX catalogue
 * is reachable.
 */
export function StockPicker({
  stocks,
  selectedId,
  onSelect,
  previewCount = 20,
}: {
  stocks: Stock[];
  selectedId: string;
  onSelect: (id: string) => void;
  /** how many to show before the user searches */
  previewCount?: number;
}) {
  const { width } = useWindowDimensions();
  const [q, setQ] = useState('');
  const cols = width >= 1024 ? 8 : width >= 640 ? 6 : 4;

  const list = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return stocks.slice(0, previewCount);
    // always keep the selected stock visible while searching
    const hits = stocks.filter(
      (s) =>
        s.ticker.toLowerCase().includes(query) || s.name.toLowerCase().includes(query),
    );
    return hits.slice(0, 60);
  }, [stocks, q, previewCount]);

  return (
    <View>
      <View style={styles.search}>
        <Text style={styles.searchIcon}>⌕</Text>
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="Search stock or company"
          placeholderTextColor={C.faint}
          style={styles.searchInput}
          autoCorrect={false}
        />
      </View>
      <View style={styles.wrap}>
        {list.map((s) => {
          const active = s.id === selectedId;
          return (
            <Pressable
              key={s.id}
              onPress={() => onSelect(s.id)}
              style={[
                styles.tile,
                { width: `${100 / cols}%` },
                active && styles.tileActive,
              ]}
            >
              <StockLogo ticker={s.ticker} color={s.color} size={34} logo={getLogo(s.id)} />
              <Text style={[styles.ticker, active && styles.tickerActive]} numberOfLines={1}>
                {s.ticker}
              </Text>
              <Text style={[styles.tilePrice, active && styles.tilePriceActive]} numberOfLines={1}>
                {fmtPrice(s.price, s.currency === 'NGN' ? '₦' : '$')}
              </Text>
            </Pressable>
          );
        })}
        {list.length === 0 ? (
          <Text style={styles.empty}>No stock matches “{q}”.</Text>
        ) : null}
      </View>
      {!q.trim() && stocks.length > previewCount ? (
        <Text style={styles.hint}>Search to see all {stocks.length} stocks</Text>
      ) : null}
    </View>
  );
}

const makeStyles = () => StyleSheet.create({
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.canvas,
    borderWidth: 1,
    borderColor: C.hairline,
    borderRadius: R.sm,
    paddingHorizontal: 12,
    height: 40,
    marginBottom: S.sm,
  },
  searchIcon: { color: C.faint, fontSize: 18, marginRight: 8 },
  searchInput: { flex: 1, color: C.ink, fontFamily: F.sans, fontSize: 14 },
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -3,
  },
  tile: {
    alignItems: 'center',
    gap: 5,
    paddingVertical: 9,
    paddingHorizontal: 3,
    borderRadius: R.md,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  tileActive: {
    backgroundColor: C.greenTint,
    borderColor: C.green,
  },
  ticker: {
    color: C.ink2,
    fontFamily: F.sans,
    fontSize: 10.5,
    fontWeight: '700',
    alignSelf: 'stretch',
    textAlign: 'center',
  },
  tickerActive: { color: C.greenDark },
  tilePrice: {
    color: C.faint,
    fontFamily: F.mono,
    fontSize: 9.5,
    fontWeight: '600',
    alignSelf: 'stretch',
    textAlign: 'center',
  },
  tilePriceActive: { color: C.green },
  empty: {
    color: C.muted,
    fontFamily: F.sans,
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 16,
  },
  hint: {
    color: C.faint,
    fontFamily: F.sans,
    fontSize: 11,
    textAlign: 'center',
    marginTop: 4,
  },
});
let styles = makeStyles();
registerStyles(() => { styles = makeStyles(); });
