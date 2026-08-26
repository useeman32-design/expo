import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { Card, ScreenHeader } from '@/components/primitives';
import { KIND_META, ReceiptModal } from '@/components/ReceiptModal';
import { BalanceEyeButton, HiddenAmount, HiddenStars } from '@/components/HiddenAmount';
import { useStore } from '@/store';
import { TRANSACTIONS } from '@/services/wallet';
import { money } from '@/utils';
import { C, F, R, S, registerStyles, STATUSBAR } from '@/theme';
import type { TxKind, WalletTransaction } from '@/types';

const FILTERS: { id: 'all' | TxKind; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'deposit', label: 'Deposits' },
  { id: 'withdrawal', label: 'Withdrawals' },
  { id: 'buy', label: 'Trades' },
  { id: 'sell', label: 'Sales' },
  { id: 'dividend', label: 'Dividends' },
  { id: 'fee', label: 'Fees' },
];

export default function WalletScreen() {
  const router = useRouter();
  const { cash } = useStore();
  const [filter, setFilter] = useState<'all' | TxKind>('all');
  const [receipt, setReceipt] = useState<WalletTransaction | null>(null);

  const rows = useMemo<WalletTransaction[]>(() => {
    const merged = [
      ...TRANSACTIONS,
      // include the live (session) cash balance as the headline number
    ];
    return filter === 'all' ? merged : merged.filter((t) => t.kind === filter);
  }, [filter]);

  const monthIn = TRANSACTIONS.filter((t) => t.amount > 0).reduce((a, t) => a + t.amount, 0);
  const monthOut = TRANSACTIONS.filter((t) => t.amount < 0).reduce((a, t) => a + t.amount, 0);

  return (
    <View style={styles.screen}>
      <StatusBar style={STATUSBAR} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 48 }}>
        <ScreenHeader title="Wallet" subtitle="Every naira in and out" showBack />

        {/* balance card */}
        <View style={{ paddingHorizontal: S.xl, marginTop: S.sm }}>
          <Card pad={S.xl} radius={R.xl}>
            <View style={styles.balanceLabelRow}>
              <Text style={styles.balanceLabel}>Available cash</Text>
              <BalanceEyeButton />
            </View>
            <HiddenAmount value={cash} style={styles.balance} />
            <View style={styles.miniStats}>
              <View style={styles.miniStat}>
                <Ionicons name="arrow-down" size={13} color={C.green} />
                <Text style={styles.miniStatLabel}>In</Text>
                <HiddenStars value={monthIn} style={[styles.miniStatValue, { color: C.green }]} />
              </View>
              <View style={styles.miniStat}>
                <Ionicons name="arrow-up" size={13} color={C.negative} />
                <Text style={styles.miniStatLabel}>Out</Text>
                <HiddenStars value={monthOut} style={[styles.miniStatValue, { color: C.negative }]} />
              </View>
            </View>
            <View style={styles.actionRow}>
              <Pressable
                onPress={() => router.push('/(tabs)/' as never)}
                style={({ pressed }) => [styles.actionBtn, pressed && { opacity: 0.85 }]}
              >
                <Ionicons name="add" size={17} color={C.white} />
                <Text style={styles.actionBtnText}>Deposit</Text>
              </Pressable>
              <Pressable
                onPress={() => router.push('/bank-accounts' as never)}
                style={({ pressed }) => [styles.actionBtnGhost, pressed && { opacity: 0.85 }]}
              >
                <Ionicons name="business-outline" size={16} color={C.green} />
                <Text style={styles.actionBtnGhostText}>Bank accounts</Text>
              </Pressable>
            </View>
          </Card>
        </View>

        {/* filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginTop: S.lg }}
          contentContainerStyle={{ paddingHorizontal: S.xl, gap: 8 }}
        >
          {FILTERS.map((f) => (
            <Pressable
              key={f.id}
              onPress={() => setFilter(f.id)}
              style={[styles.chip, filter === f.id && styles.chipActive]}
            >
              <Text style={[styles.chipText, filter === f.id && styles.chipTextActive]}>
                {f.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* ledger */}
        <View style={{ paddingHorizontal: S.xl, marginTop: S.md, gap: S.sm }}>
          {rows.length === 0 ? (
            <Card pad={S.xxl} radius={R.lg}>
              <Text style={styles.empty}>Nothing here yet</Text>
            </Card>
          ) : (
            rows.map((t) => {
              const meta = KIND_META[t.kind];
              const credit = t.amount >= 0;
              return (
                <Pressable
                  key={t.id}
                  onPress={() => setReceipt(t)}
                  style={({ pressed }) => [{}, pressed && { opacity: 0.7, transform: [{ scale: 0.995 }] }]}
                  accessibilityLabel={`View receipt for ${t.reference}`}
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
                        <View style={styles.receiptHint}>
                          <Ionicons name="receipt-outline" size={10} color={C.green} />
                          <Text style={styles.receiptHintText}>View receipt</Text>
                        </View>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text
                          style={[
                            styles.txAmount,
                            { color: credit ? C.positive : C.ink },
                          ]}
                        >
                          {credit ? '+' : '−'}
                          {money(Math.abs(t.amount))}
                        </Text>
                        <Text
                          style={[
                            styles.txStatus,
                            { color: t.status === 'Completed' ? C.green : t.status === 'Pending' ? '#F6A623' : C.negative },
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

        <View style={{ paddingHorizontal: S.xl, marginTop: S.lg }}>
          <Text style={styles.note}>
            Tap any transaction to view and share its receipt. Full PDF statements arrive with the
            live backend.
          </Text>
        </View>
      </ScrollView>

      <ReceiptModal tx={receipt} onClose={() => setReceipt(null)} />
    </View>
  );
}

const makeStyles = () => StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.canvas },
  balanceLabel: { color: C.muted, fontFamily: F.sans, fontSize: 13 },
  balanceLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  balance: {
    color: C.ink,
    fontFamily: F.display,
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -0.9,
    marginTop: 4,
  },
  miniStats: { flexDirection: 'row', gap: S.lg, marginTop: S.md },
  miniStat: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  miniStatLabel: { color: C.muted, fontFamily: F.sans, fontSize: 12.5 },
  miniStatValue: { fontFamily: F.mono, fontSize: 13, fontWeight: '700' },
  actionRow: { flexDirection: 'row', gap: S.md, marginTop: S.lg },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    backgroundColor: C.green,
    paddingVertical: 13,
    borderRadius: R.md,
  },
  actionBtnText: { color: C.white, fontFamily: F.sans, fontSize: 14, fontWeight: '700' },
  actionBtnGhost: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    backgroundColor: C.greenTint,
    paddingVertical: 13,
    borderRadius: R.md,
  },
  actionBtnGhostText: { color: C.green, fontFamily: F.sans, fontSize: 14, fontWeight: '700' },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: R.pill,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.hairline,
  },
  chipActive: { backgroundColor: C.green, borderColor: C.green },
  chipText: { color: C.ink2, fontFamily: F.sans, fontSize: 13, fontWeight: '600' },
  chipTextActive: { color: C.white },
  txRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  txIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txTitle: { color: C.ink, fontFamily: F.sans, fontSize: 14, fontWeight: '700' },
  txSub: { color: C.muted, fontFamily: F.sans, fontSize: 11.5, marginTop: 2 },
  txAmount: { fontFamily: F.mono, fontSize: 14.5, fontWeight: '700' },
  txStatus: { fontFamily: F.sans, fontSize: 10.5, fontWeight: '700', marginTop: 2 },
  receiptHint: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 3 },
  receiptHintText: { color: C.green, fontFamily: F.sans, fontSize: 10, fontWeight: '700' },
  empty: { color: C.muted, fontFamily: F.sans, fontSize: 13.5, textAlign: 'center' },
  note: {
    color: C.faint,
    fontFamily: F.sans,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
});
let styles = makeStyles();
registerStyles(() => { styles = makeStyles(); });
