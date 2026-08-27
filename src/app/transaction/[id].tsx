import { useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import { Card, ScreenHeader } from '@/components/primitives';
import { Barcode, KIND_META } from '@/components/ReceiptModal';
import { useStore } from '@/store';
import { C, F, R, S, STATUSBAR, registerStyles } from '@/theme';
import { money } from '@/utils';
import { shareViewAsJpg } from '@/utils/shareImage';

/**
 * Dedicated transaction detail screen (opened from the transactions
 * history list, mirroring the order detail pattern): full breakdown,
 * barcode and a JPG share of the whole receipt card.
 */
export default function TransactionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { txHistory } = useStore();
  const [shared, setShared] = useState(false);
  const receiptRef = useRef<View>(null);

  const t = txHistory.find((x) => x.id === String(id ?? ''));

  if (!t) {
    return (
      <View style={styles.screen}>
        <StatusBar style={STATUSBAR} />
        <ScreenHeader title="Transaction" showBack />
        <View style={{ padding: S.xl, marginTop: S.xxl, alignItems: 'center' }}>
          <Ionicons name="receipt-outline" size={40} color={C.faint} />
          <Text style={styles.missing}>Transaction not found</Text>
        </View>
      </View>
    );
  }

  const meta = KIND_META[t.kind];
  const credit = t.amount >= 0;
  const statusColor =
    t.status === 'Completed' ? C.green : t.status === 'Pending' ? '#F6A623' : C.negative;

  const share = async () => {
    const res = await shareViewAsJpg(receiptRef, `stocksx-receipt-${t.reference}.jpg`);
    if (res !== 'failed') {
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  };

  const rows: { label: string; value: string }[] = [
    { label: 'Category', value: meta.label },
    { label: 'Reference', value: t.reference },
    { label: 'Method', value: t.method ?? '—' },
    ...(t.note ? [{ label: 'Details', value: t.note }] : []),
    { label: 'Balance after', value: money(t.balanceAfter) },
    { label: 'Date', value: t.time },
  ];

  return (
    <View style={styles.screen}>
      <StatusBar style={STATUSBAR} />
      <ScreenHeader title="Transaction" subtitle={meta.label} showBack />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 48 }}>
        <View style={{ padding: S.xl }}>
          {/* receipt (capture target) */}
          <View ref={receiptRef} collapsable={false} style={styles.receipt}>
            <View style={styles.amountBlock}>
              <View style={[styles.kindChip, { backgroundColor: `${meta.color}16` }]}>
                <Ionicons name={meta.icon as never} size={14} color={meta.color} />
                <Text style={[styles.kindText, { color: meta.color }]}>
                  {meta.label}
                  {t.ticker ? ` · ${t.ticker}` : ''}
                </Text>
              </View>
              <Text style={[styles.amount, { color: credit ? C.positive : C.ink }]}>
                {credit ? '+' : '−'}
                {money(Math.abs(t.amount))}
              </Text>
              <View style={[styles.statusPill, { backgroundColor: `${statusColor}18` }]}>
                <Text style={[styles.statusText, { color: statusColor }]}>{t.status}</Text>
              </View>
            </View>

            <View style={styles.dash} />
            {rows.map((r) => (
              <View key={r.label} style={styles.row}>
                <Text style={styles.rowLabel}>{r.label}</Text>
                <Text style={styles.rowValue} numberOfLines={2}>
                  {r.value}
                </Text>
              </View>
            ))}
            <View style={styles.dash} />

            <View style={{ alignItems: 'center' }}>
              <Barcode seed={t.reference} />
              <Text style={styles.code}>{t.reference}</Text>
            </View>
          </View>

          {/* share */}
          <Pressable onPress={share} style={({ pressed }) => [styles.shareBtn, pressed && { opacity: 0.85 }]}>
            <Ionicons name="share-social-outline" size={16} color={C.white} />
            <Text style={styles.shareBtnText}>{shared ? 'Shared!' : 'Share as image'}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const makeStyles = () =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: C.canvas },
    missing: { color: C.muted, fontFamily: F.sans, fontSize: 14, marginTop: S.md },
    receipt: {
      backgroundColor: C.surface,
      borderRadius: R.xl,
      borderWidth: 1,
      borderColor: C.hairline,
      padding: S.xl,
    },
    amountBlock: { alignItems: 'center', gap: 8 },
    kindChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: 11,
      paddingVertical: 5,
      borderRadius: R.pill,
    },
    kindText: { fontFamily: F.sans, fontSize: 11.5, fontWeight: '800' },
    amount: { fontFamily: F.display, fontSize: 38, fontWeight: '800', letterSpacing: -1.2 },
    statusPill: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: R.pill },
    statusText: { fontFamily: F.sans, fontSize: 11, fontWeight: '800' },
    dash: { height: 1, backgroundColor: C.hairlineSoft, marginVertical: S.lg },
    row: { flexDirection: 'row', justifyContent: 'space-between', gap: 20, paddingVertical: 7 },
    rowLabel: { color: C.muted, fontFamily: F.sans, fontSize: 13 },
    rowValue: { color: C.ink, fontFamily: F.sans, fontSize: 13, fontWeight: '700', flexShrink: 1, textAlign: 'right' },
    code: { color: C.faint, fontFamily: F.sans, fontSize: 11, marginTop: 6, letterSpacing: 1 },
    shareBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: C.green,
      paddingVertical: 15,
      borderRadius: R.md,
      marginTop: S.lg,
    },
    shareBtnText: { color: C.white, fontFamily: F.sans, fontSize: 15, fontWeight: '800' },
  });

let styles = makeStyles();
registerStyles(() => {
  styles = makeStyles();
});
