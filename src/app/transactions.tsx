import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import { Card, ScreenHeader } from '@/components/primitives';
import { ReceiptModal, KIND_META } from '@/components/ReceiptModal';
import { HiddenStars } from '@/components/HiddenAmount';
import { useStore } from '@/store';
import type { WalletTransaction } from '@/types';
import { C, F, R, S, STATUSBAR, registerStyles } from '@/theme';
import { money } from '@/utils';

/**
 * Dedicated transactions screen (linked from the home hero): month filter,
 * quick ranges, in/out summary and the full ledger. Kept separate from the
 * Wallet screen — no balances here, just the money movement — and it can
 * jump into the statement report generator.
 */

type Range = 'all' | '7d' | '30d' | '90d';

const RANGES: { id: Range; label: string; days: number }[] = [
  { id: 'all', label: 'All time', days: 0 },
  { id: '7d', label: '7 days', days: 7 },
  { id: '30d', label: '30 days', days: 30 },
  { id: '90d', label: '90 days', days: 90 },
];

const monthKey = (ts: number) => {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

const monthLabel = (key: string) => {
  const [y, m] = key.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
};

export default function TransactionsScreen() {
  const router = useRouter();
  const { txHistory } = useStore();
  const [range, setRange] = useState<Range>('all');
  const [month, setMonth] = useState<string>('all'); // 'all' | 'YYYY-MM'
  const [receipt, setReceipt] = useState<WalletTransaction | null>(null);

  const months = useMemo(() => {
    const keys = new Set(txHistory.map((t) => monthKey(t.ts)));
    return Array.from(keys).sort().reverse();
  }, [txHistory]);

  const rows = useMemo(() => {
    const r = RANGES.find((x) => x.id === range)!;
    const cutoff = r.days ? Date.now() - r.days * 86_400_000 : 0;
    return txHistory
      .filter((t) => t.ts >= cutoff)
      .filter((t) => month === 'all' || monthKey(t.ts) === month)
      .sort((a, b) => b.ts - a.ts);
  }, [txHistory, range, month]);

  const moneyIn = rows.filter((t) => t.amount > 0).reduce((a, t) => a + t.amount, 0);
  const moneyOut = rows.filter((t) => t.amount < 0).reduce((a, t) => a + t.amount, 0);

  return (
    <View style={styles.screen}>
      <StatusBar style={STATUSBAR} />
      <ScreenHeader title="Transactions" subtitle="Filter, review & report" showBack />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 48 }}>
        {/* ranges */}
        <View style={styles.rangeRow}>
          {RANGES.map((r) => {
            const active = r.id === range;
            return (
              <Pressable
                key={r.id}
                onPress={() => setRange(r.id)}
                style={({ pressed }) => [styles.chip, active && styles.chipActive, pressed && { opacity: 0.8 }]}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{r.label}</Text>
              </Pressable>
            );
          })}
        </View>

        {/* months */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.monthRow}>
          <Pressable
            onPress={() => setMonth('all')}
            style={({ pressed }) => [styles.chip, month === 'all' && styles.chipActive, pressed && { opacity: 0.8 }]}
          >
            <Text style={[styles.chipText, month === 'all' && styles.chipTextActive]}>All months</Text>
          </Pressable>
          {months.map((k) => {
            const active = month === k;
            return (
              <Pressable
                key={k}
                onPress={() => setMonth(k)}
                style={({ pressed }) => [styles.chip, active && styles.chipActive, pressed && { opacity: 0.8 }]}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{monthLabel(k)}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* in / out summary */}
        <Card pad={S.lg} style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryCol}>
              <Text style={styles.summaryLabel}>Money in</Text>
              <HiddenStars value={moneyIn} style={[styles.summaryValue, { color: C.positive }]} />
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryCol}>
              <Text style={styles.summaryLabel}>Money out</Text>
              <HiddenStars value={moneyOut} style={[styles.summaryValue, { color: C.ink }]} />
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryCol}>
              <Text style={styles.summaryLabel}>Entries</Text>
              <Text style={styles.summaryValue}>{rows.length}</Text>
            </View>
          </View>
        </Card>

        {/* report generator */}
        <Pressable onPress={() => router.push('/report' as never)} style={({ pressed }) => [styles.reportCard, pressed && { opacity: 0.85 }]}>
          <View style={styles.reportIcon}>
            <Ionicons name="document-text-outline" size={20} color={C.green} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.reportTitle}>Generate report</Text>
            <Text style={styles.reportSub}>Statement for any period, saved as an image</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={C.faint} />
        </Pressable>

        {/* ledger */}
        <View style={styles.list}>
          {rows.length === 0 ? (
            <Card pad={S.xxl} radius={R.lg}>
              <Text style={styles.empty}>No transactions in this period</Text>
            </Card>
          ) : (
            rows.map((t) => {
              const meta = KIND_META[t.kind];
              const credit = t.amount >= 0;
              return (
                <Pressable
                  key={t.id}
                  onPress={() => setReceipt(t)}
                  accessibilityLabel={`View receipt for ${t.reference}`}
                  style={({ pressed }) => [pressed && { opacity: 0.7, transform: [{ scale: 0.995 }] }]}
                >
                  <Card pad={S.md} radius={R.md}>
                    <View style={styles.txRow}>
                      <View style={[styles.txIcon, { backgroundColor: `${meta.color}16` }]}>
                        <Ionicons name={meta.icon as never} size={17} color={meta.color} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.txTitle}>
                          {meta.label}
                          {t.ticker ? ` · ${t.ticker}` : ''}
                        </Text>
                        <Text style={styles.txSub} numberOfLines={1}>
                          {t.method} · {t.time}
                        </Text>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={[styles.txAmount, { color: credit ? C.positive : C.ink }]}>
                          {credit ? '+' : '−'}
                          {money(Math.abs(t.amount))}
                        </Text>
                        <Text
                          style={[
                            styles.txStatus,
                            {
                              color:
                                t.status === 'Completed' ? C.green : t.status === 'Pending' ? '#F6A623' : C.negative,
                            },
                          ]}
                        >
                          {t.status}
                        </Text>
                      </View>
                    </View>
                  </Card>
                </Pressable>
              );
            })
          )}
        </View>
      </ScrollView>

      <ReceiptModal tx={receipt} onClose={() => setReceipt(null)} />
    </View>
  );
}

const makeStyles = () =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: C.canvas },
    rangeRow: { flexDirection: 'row', paddingHorizontal: S.xl, gap: S.sm, marginTop: S.sm },
    monthRow: { paddingHorizontal: S.xl, gap: S.sm, marginTop: S.md, paddingBottom: 2 },
    chip: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: R.pill,
      backgroundColor: C.canvasAlt,
      borderWidth: 1,
      borderColor: C.hairline,
    },
    chipActive: { backgroundColor: C.green, borderColor: C.green },
    chipText: { color: C.muted, fontFamily: F.sans, fontSize: 12.5, fontWeight: '700' },
    chipTextActive: { color: C.white },
    summaryCard: { marginHorizontal: S.xl, marginTop: S.lg },
    summaryRow: { flexDirection: 'row', alignItems: 'center' },
    summaryCol: { flex: 1, alignItems: 'center' },
    summaryLabel: { color: C.muted, fontFamily: F.sans, fontSize: 11.5, marginBottom: 5 },
    summaryValue: { color: C.ink, fontFamily: F.display, fontSize: 16.5, fontWeight: '800' },
    summaryDivider: { width: 1, height: 34, backgroundColor: C.hairlineSoft },
    reportCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginHorizontal: S.xl,
      marginTop: S.md,
      backgroundColor: C.surface,
      borderRadius: R.lg,
      borderWidth: 1,
      borderColor: C.hairline,
      padding: S.lg,
    },
    reportIcon: {
      width: 42,
      height: 42,
      borderRadius: 13,
      backgroundColor: C.canvasAlt,
      alignItems: 'center',
      justifyContent: 'center',
    },
    reportTitle: { color: C.ink, fontFamily: F.sans, fontSize: 14.5, fontWeight: '700' },
    reportSub: { color: C.muted, fontFamily: F.sans, fontSize: 11.5, marginTop: 1 },
    list: { paddingHorizontal: S.xl, marginTop: S.lg, gap: S.sm },
    empty: { color: C.muted, fontFamily: F.sans, fontSize: 13.5, textAlign: 'center' },
    txRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    txIcon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    txTitle: { color: C.ink, fontFamily: F.sans, fontSize: 13.5, fontWeight: '700' },
    txSub: { color: C.faint, fontFamily: F.sans, fontSize: 11.5, marginTop: 1 },
    txAmount: { fontFamily: F.display, fontSize: 13.5, fontWeight: '800' },
    txStatus: { fontFamily: F.sans, fontSize: 10.5, marginTop: 2, fontWeight: '600' },
  });

let styles = makeStyles();
registerStyles(() => {
  styles = makeStyles();
});
