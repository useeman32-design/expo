import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import { Card, ScreenHeader, StockLogo } from '@/components/primitives';
import { getStock } from '@/services/marketData';
import { ORDERS } from '@/services/orders';
import { money, price as fmtPrice } from '@/utils';
import { C, F, R, S } from '@/theme';
import type { Order } from '@/types';

/** Status pill colors across the order lifecycle. */
function statusColor(s: Order['status']): string {
  if (s === 'Settled') return C.green;
  if (s === 'Completed') return '#1F7AE0';
  if (s === 'Open') return '#F6A623';
  return C.muted;
}

/** Which lifecycle milestones are reached for this order. */
function milestones(o: Order): { label: string; sub: string; done: boolean }[] {
  const placed = { label: 'Order placed', sub: o.time, done: true };
  const filled = {
    label: 'Executed',
    sub: o.filledPrice ? `${fmtPrice(o.filledPrice)} per share` : 'Waiting for execution',
    done: o.status !== 'Open',
  };
  const settled = {
    label: 'Settled (T+3)',
    sub: o.settlementDate ? `Shares credited · ${o.settlementDate}` : 'Three business days after execution',
    done: o.status === 'Settled',
  };
  return o.status === 'Cancelled'
    ? [placed, { label: 'Cancelled', sub: 'Order was cancelled before execution', done: true }]
    : [placed, filled, settled];
}

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const o = ORDERS.find((x) => x.id === String(id ?? ''));
  const stock = o ? getStock(o.stockId) : undefined;

  if (!o || !stock) {
    return (
      <View style={styles.screen}>
        <StatusBar style="dark" />
        <ScreenHeader title="Order" showBack />
        <View style={{ padding: S.xl, marginTop: S.xxl, alignItems: 'center' }}>
          <Ionicons name="receipt-outline" size={40} color={C.faint} />
          <Text style={styles.missing}>Order not found</Text>
        </View>
      </View>
    );
  }

  const notional = o.qty * (o.filledPrice ?? o.price);
  const total = o.side === 'Buy' ? notional + (o.fee ?? 0) : notional - (o.fee ?? 0);
  const sc = statusColor(o.status);
  const ms = milestones(o);

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 48 }}>
        <ScreenHeader title="Order detail" subtitle={o.reference ?? o.id} showBack />

        {/* summary card */}
        <View style={{ paddingHorizontal: S.xl, marginTop: S.sm }}>
          <Card pad={S.xl} radius={R.xl}>
            <View style={styles.stockRow}>
              <StockLogo ticker={stock.ticker} color={stock.color} size={46} />
              <View style={{ flex: 1 }}>
                <Text style={styles.ticker}>{stock.ticker}</Text>
                <Text style={styles.name}>{stock.name}</Text>
              </View>
              <View style={[styles.statusPill, { backgroundColor: `${sc}18` }]}>
                <Text style={[styles.statusText, { color: sc }]}>{o.status}</Text>
              </View>
            </View>

            <View style={styles.amountBlock}>
              <Text style={styles.amountLabel}>{o.side === 'Buy' ? 'Total paid' : 'Net proceeds'}</Text>
              <Text style={styles.amount}>{money(total)}</Text>
              <Text style={styles.amountSub}>
                {o.qty.toLocaleString()} shares · {o.type} order
              </Text>
            </View>
          </Card>
        </View>

        {/* lifecycle timeline */}
        <View style={{ paddingHorizontal: S.xl, marginTop: S.lg }}>
          <Text style={styles.sectionLabel}>Lifecycle</Text>
          <Card pad={S.xl} radius={R.xl}>
            {ms.map((m, i) => (
              <View key={m.label} style={styles.timelineRow}>
                <View style={styles.timelineLeft}>
                  <View
                    style={[
                      styles.timelineDot,
                      { backgroundColor: m.done ? C.green : C.canvasAlt },
                    ]}
                  >
                    {m.done ? (
                      <Ionicons name="checkmark" size={12} color={C.white} />
                    ) : (
                      <View style={styles.timelineHollow} />
                    )}
                  </View>
                  {i < ms.length - 1 ? (
                    <View
                      style={[styles.timelineLine, { backgroundColor: m.done ? C.green : C.hairline }]}
                    />
                  ) : null}
                </View>
                <View style={{ flex: 1, paddingBottom: i < ms.length - 1 ? S.lg : 0 }}>
                  <Text style={[styles.timelineTitle, !m.done && { color: C.muted }]}>{m.label}</Text>
                  <Text style={styles.timelineSub}>{m.sub}</Text>
                </View>
              </View>
            ))}
          </Card>
        </View>

        {/* receipt */}
        <View style={{ paddingHorizontal: S.xl, marginTop: S.lg }}>
          <Text style={styles.sectionLabel}>Receipt</Text>
          <Card pad={S.xl} radius={R.xl}>
            <Row label={`${o.side} price`} value={fmtPrice(o.filledPrice ?? o.price)} />
            <Row label="Quantity" value={o.qty.toLocaleString()} />
            <Row label="Trade value" value={money(notional)} />
            <Row label="Fees & charges" value={o.fee != null ? money(o.fee) : '—'} />
            <View style={styles.divider} />
            <Row label={o.side === 'Buy' ? 'Total paid' : 'Net proceeds'} value={money(total)} strong />
            <Row label="Reference" value={o.reference ?? o.id} />
            <Row label="CSCS account" value={o.cscs ?? 'CSCS/0123456789'} />
            <Row label="Placed" value={o.time} />
          </Card>
        </View>

        <View style={{ paddingHorizontal: S.xl, marginTop: S.lg }}>
          <Pressable
            onPress={() => router.push(`/stock/${stock.id}` as never)}
            style={({ pressed }) => [styles.viewStock, pressed && { opacity: 0.85 }]}
          >
            <Ionicons name="stats-chart-outline" size={17} color={C.green} />
            <Text style={styles.viewStockText}>View {stock.ticker} chart</Text>
            <Ionicons name="chevron-forward" size={14} color={C.faint} />
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <View style={styles.receiptRow}>
      <Text style={[styles.receiptLabel, strong && { color: C.ink, fontWeight: '700' }]}>{label}</Text>
      <Text style={[styles.receiptValue, strong && { fontFamily: F.display, fontSize: 15 }]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.canvas },
  missing: { color: C.muted, fontFamily: F.sans, fontSize: 14, marginTop: S.md },
  stockRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  ticker: { color: C.ink, fontFamily: F.display, fontSize: 17, fontWeight: '800' },
  name: { color: C.muted, fontFamily: F.sans, fontSize: 12.5, marginTop: 1 },
  statusPill: { paddingHorizontal: 11, paddingVertical: 6, borderRadius: R.pill },
  statusText: { fontFamily: F.sans, fontSize: 12, fontWeight: '800' },
  amountBlock: { alignItems: 'center', marginTop: S.lg },
  amountLabel: { color: C.muted, fontFamily: F.sans, fontSize: 13 },
  amount: {
    color: C.ink,
    fontFamily: F.display,
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.8,
    marginTop: 4,
  },
  amountSub: { color: C.muted, fontFamily: F.sans, fontSize: 12.5, marginTop: 4 },
  sectionLabel: {
    color: C.muted,
    fontFamily: F.sans,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: S.sm,
    marginLeft: S.xs,
  },
  timelineRow: { flexDirection: 'row' },
  timelineLeft: { alignItems: 'center', marginRight: S.md, width: 22 },
  timelineDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineHollow: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.faint },
  timelineLine: { flex: 1, width: 2, marginVertical: 2 },
  timelineTitle: { color: C.ink, fontFamily: F.sans, fontSize: 14, fontWeight: '700' },
  timelineSub: { color: C.muted, fontFamily: F.sans, fontSize: 12, marginTop: 2 },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 7,
  },
  receiptLabel: { color: C.muted, fontFamily: F.sans, fontSize: 13.5 },
  receiptValue: { color: C.ink, fontFamily: F.mono, fontSize: 13.5, fontWeight: '600' },
  divider: { height: 1, backgroundColor: C.hairline, marginVertical: S.sm },
  viewStock: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 15,
    borderRadius: R.md,
    backgroundColor: C.greenTint,
  },
  viewStockText: { color: C.green, fontFamily: F.sans, fontSize: 14.5, fontWeight: '700' },
});
