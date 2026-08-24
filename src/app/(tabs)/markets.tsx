import { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Background } from '@/components/Background';
import {
  AppHeader,
  Chip,
  GlassCard,
  SectionHeader,
} from '@/components/ui';
import { StockRow } from '@/components/StockRow';
import { SECTORS, STOCKS } from '@/data/stocks';
import { C, FONT, R, S } from '@/theme';

type MarketFilter = 'All' | 'NGX' | 'US';

export default function MarketsScreen() {
  const insets = useSafeAreaInsets();
  const [market, setMarket] = useState<MarketFilter>('All');
  const [halal, setHalal] = useState(false);
  const [sector, setSector] = useState('All');
  const [q, setQ] = useState('');

  const list = useMemo(() => {
    return STOCKS.filter((s) => {
      if (market !== 'All' && s.market !== market) return false;
      if (halal && !s.sharia) return false;
      if (sector !== 'All' && s.sector !== sector) return false;
      if (q) {
        const hay = `${s.ticker} ${s.name}`.toLowerCase();
        if (!hay.includes(q.toLowerCase())) return false;
      }
      return true;
    });
  }, [market, halal, sector, q]);

  const segments: MarketFilter[] = ['All', 'NGX', 'US'];

  return (
    <Background>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 130 }}
      >
        <AppHeader
          title="Markets"
          subtitle="NGX & global stocks"
          showBack
        />

        {/* Search */}
        <View style={{ paddingHorizontal: S.xl }}>
          <View style={styles.search}>
            <Text style={styles.searchIcon}>⌕</Text>
            <TextInput
              value={q}
              onChangeText={setQ}
              placeholder="Search MTN, Dangote, AAPL…"
              placeholderTextColor={C.textFaint}
              style={styles.searchInput}
            />
          </View>
        </View>

        {/* Market segment + Halal toggle */}
        <View style={styles.controls}>
          <View style={styles.segment}>
            {segments.map((m) => (
              <Pressable
                key={m}
                onPress={() => setMarket(m)}
                style={[
                  styles.segmentItem,
                  market === m && styles.segmentItemActive,
                ]}
              >
                <Text
                  style={[
                    styles.segmentText,
                    market === m && styles.segmentTextActive,
                  ]}
                >
                  {m}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <Pressable
          style={styles.halalRow}
          onPress={() => setHalal((v) => !v)}
        >
          <View style={styles.halalLeft}>
            <Text style={styles.halalIcon}>☪</Text>
            <View>
              <Text style={styles.halalTitle}>Halal only</Text>
              <Text style={styles.halalSub}>
                Filter out riba (interest-based) stocks
              </Text>
            </View>
          </View>
          <View style={[styles.toggle, halal && styles.toggleOn]}>
            <View style={[styles.knob, halal && styles.knobOn]} />
          </View>
        </Pressable>

        {/* Sectors */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.sectors}
          contentContainerStyle={{ paddingHorizontal: S.xl }}
        >
          {SECTORS.map((s) => (
            <Chip
              key={s}
              label={s}
              active={sector === s}
              onPress={() => setSector(s)}
            />
          ))}
        </ScrollView>

        {/* List */}
        <View style={{ paddingHorizontal: S.xl, marginTop: S.lg }}>
          <SectionHeader
            title={`${list.length} ${list.length === 1 ? 'stock' : 'stocks'}`}
            ha={halal ? 'Tsabta · Halal kawai' : 'Duk wani'}
          />
          <GlassCard style={styles.listCard}>
            <View style={{ paddingHorizontal: 16 }}>
              {list.map((s, i) => (
                <StockRow
                  key={s.id}
                  stock={s}
                  showHalal
                  last={i === list.length - 1}
                />
              ))}
              {list.length === 0 ? (
                <Text style={styles.empty}>No stocks match your filters.</Text>
              ) : null}
            </View>
          </GlassCard>
          <Text style={styles.disclaimer}>
            Demo data for illustration only — not live quotes or advice.
          </Text>
        </View>
        <View style={{ height: insets.bottom }} />
      </ScrollView>
    </Background>
  );
}

const styles = StyleSheet.create({
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.glass,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: R.md,
    paddingHorizontal: 14,
    height: 50,
  },
  searchIcon: { color: C.textFaint, fontSize: 20, marginRight: 10 },
  searchInput: {
    flex: 1,
    color: C.text,
    fontFamily: FONT.sans,
    fontSize: 15,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: S.xl,
    marginTop: S.md,
  },
  segment: {
    flexDirection: 'row',
    backgroundColor: C.glass,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: R.pill,
    padding: 4,
  },
  segmentItem: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: R.pill,
  },
  segmentItemActive: {
    backgroundColor: C.accent,
  },
  segmentText: {
    color: C.textMuted,
    fontFamily: FONT.sans,
    fontSize: 13,
    fontWeight: '700',
  },
  segmentTextActive: {
    color: '#04140E',
  },
  halalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: S.xl,
    marginTop: S.md,
    backgroundColor: halalCardBg(),
    borderWidth: 1,
    borderColor: C.borderStrong,
    borderRadius: R.md,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  halalLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  halalIcon: { color: C.accent, fontSize: 22 },
  halalTitle: {
    color: C.text,
    fontFamily: FONT.sans,
    fontSize: 15,
    fontWeight: '700',
  },
  halalSub: {
    color: C.textMuted,
    fontFamily: FONT.sans,
    fontSize: 12,
  },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.12)',
    padding: 3,
    justifyContent: 'center',
  },
  toggleOn: { backgroundColor: C.accent },
  knob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignSelf: 'flex-start',
  },
  knobOn: { alignSelf: 'flex-end' },
  sectors: { marginTop: S.lg, flexGrow: 0 },
  listCard: { paddingVertical: 4 },
  empty: {
    color: C.textMuted,
    fontFamily: FONT.sans,
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 30,
  },
  disclaimer: {
    color: C.textFaint,
    fontFamily: FONT.sans,
    fontSize: 11,
    textAlign: 'center',
    marginTop: 12,
  },
});

function halalCardBg() {
  return 'rgba(34,229,154,0.08)';
}
