import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';

import { Card, Chip, ScreenHeader, StockLogo } from '@/components/primitives';
import { useStore } from '@/store';
import { getLogo } from '@/services/logos';
import { getStock } from '@/services/marketData';
import type { OrderStatus } from '@/types';
import { C, F, R, S, registerStyles, STATUSBAR } from '@/theme';
import { price } from '@/utils';

const FILTERS = ['All', 'Open', 'Completed', 'Settled', 'Cancelled'] as const;

/** status -> accent colour (function so it follows theme switches) */
const statusColor = (s: OrderStatus): string =>
  s === 'Open' ? '#F6A623' : s === 'Completed' ? '#1F7AE0' : s === 'Settled' ? C.positive : C.negative;

export default function OrdersScreen() {
  const router = useRouter();
  const store = useStore();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('All');
  const orders = useMemo(() => {
    const all = store.orders;
    return filter === 'All' ? all : all.filter((o) => o.status === filter);
  }, [filter, store.orders]);

  return (
    <View style={styles.screen}>
      <StatusBar style={STATUSBAR} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <ScreenHeader title="Orders" subtitle="Your trade history" showBack />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginTop: S.sm }}
          contentContainerStyle={{ paddingHorizontal: S.xl }}
        >
          {FILTERS.map((f) => (
            <Chip key={f} label={f} active={filter === f} onPress={() => setFilter(f)} />
          ))}
        </ScrollView>

        <View style={{ paddingHorizontal: S.xl, marginTop: S.lg }}>
          <Card pad={S.lg} radius={R.xl}>
            {orders.length ? (
              orders.map((o, i) => {
                const s = getStock(o.stockId);
                const buy = o.side === 'Buy';
                return (
                  <Pressable
                    key={o.id}
                    onPress={() => router.push(`/orders/${o.id}` as never)}
                    style={({ pressed }) => [
                      styles.row,
                      i < orders.length - 1 && styles.rowDiv,
                      pressed && { opacity: 0.6 },
                    ]}
                  >
                    {s ? <StockLogo ticker={s.ticker} color={s.color} size={38} logo={getLogo(s.id)} /> : null}
                    <View style={{ flex: 1, gap: 3 }}>
                      <View style={styles.rowTop}>
                        <Text style={styles.ticker}>{s?.ticker ?? o.stockId}</Text>
                        <View
                          style={[
                            styles.sideTag,
                            { backgroundColor: buy ? C.positiveSoft : C.negativeSoft },
                          ]}
                        >
                          <Text style={[styles.sideText, { color: buy ? C.positive : C.negative }]}>
                            {o.side} {o.type}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.sub}>
                        {o.qty} shares · {price(o.price, '₦')} · {o.time}
                      </Text>
                    </View>
                    <View style={[styles.status, { backgroundColor: `${statusColor(o.status)}1F` }]}>
                      <Text style={[styles.statusText, { color: statusColor(o.status) }]}>
                        {o.status}
                      </Text>
                    </View>
                  </Pressable>
                );
              })
            ) : (
              <Text style={styles.empty}>No {filter.toLowerCase()} orders.</Text>
            )}
          </Card>
        </View>
      </ScrollView>
    </View>
  );
}

const makeStyles = () => StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.canvas },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: S.md,
  },
  rowDiv: { borderBottomWidth: 1, borderBottomColor: C.hairlineSoft },
  rowTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  ticker: {
    color: C.ink,
    fontFamily: F.sans,
    fontSize: 15,
    fontWeight: '700',
  },
  sideTag: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: R.xs },
  sideText: {
    fontFamily: F.sans,
    fontSize: 11,
    fontWeight: '700',
  },
  sub: {
    color: C.muted,
    fontFamily: F.sans,
    fontSize: 12.5,
  },
  status: { paddingHorizontal: 9, paddingVertical: 5, borderRadius: R.sm },
  statusText: {
    fontFamily: F.sans,
    fontSize: 11.5,
    fontWeight: '700',
  },
  empty: {
    color: C.muted,
    fontFamily: F.sans,
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 30,
  },
});
let styles = makeStyles();
registerStyles(() => { styles = makeStyles(); });
