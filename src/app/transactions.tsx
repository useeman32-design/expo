import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import { Card, ScreenHeader } from '@/components/primitives';
import { KIND_META } from '@/components/ReceiptModal';
import { HiddenStars } from '@/components/HiddenAmount';
import { useStore } from '@/store';
import type { TxKind, WalletTransaction } from '@/types';
import { C, F, R, S, STATUSBAR, registerStyles } from '@/theme';
import { money } from '@/utils';

/**
 * Dedicated transactions screen (linked from the home hero):
 *  - category + status filter chips (dropdown modals)
 *  - a period chip showing the current month that opens a picker modal
 *    (any month & year, last 3 / 6 months, or a custom from–to range)
 *  - balanced in/out/entries summary and the full ledger — each entry
 *    opens its own detail screen (like orders)
 */

type Status = WalletTransaction['status'];

type DateFilter =
  | { mode: 'month'; year: number; month: number }
  | { mode: 'lastN'; months: number }
  | { mode: 'all' }
  | { mode: 'custom'; from: number; to: number };

const KINDS = Object.keys(KIND_META) as TxKind[];
const STATUSES: Status[] = ['Completed', 'Pending', 'Failed'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function filterWindow(f: DateFilter): { start: number; end: number } {
  switch (f.mode) {
    case 'month':
      return {
        start: new Date(f.year, f.month, 1).getTime(),
        end: new Date(f.year, f.month + 1, 1).getTime(),
      };
    case 'lastN':
      return { start: Date.now() - f.months * 30.5 * 86_400_000, end: Date.now() + 86_400_000 };
    case 'custom':
      return { start: f.from, end: f.to };
    case 'all':
    default:
      return { start: 0, end: Number.MAX_SAFE_INTEGER };
  }
}

function dateFilterLabel(f: DateFilter): string {
  switch (f.mode) {
    case 'month':
      return `${MONTHS[f.month]} ${f.year}`;
    case 'lastN':
      return `Last ${f.months} months`;
    case 'custom': {
      const d = (ts: number) => new Date(ts).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
      return `${d(f.from)} – ${d(f.to)}`;
    }
    case 'all':
    default:
      return 'All time';
  }
}

/** parse DD/MM/YYYY (or YYYY-MM-DD) into a timestamp; null when invalid */
function parseDate(s: string): number | null {
  const t = s.trim().replace(/\s+/g, '');
  let d: number, m: number, y: number;
  if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(t)) {
    [y, m, d] = t.split('-').map(Number);
  } else if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(t)) {
    [d, m, y] = t.split('/').map(Number);
  } else {
    return null;
  }
  const dt = new Date(y, m - 1, d);
  if (dt.getFullYear() !== y || dt.getMonth() !== m - 1 || dt.getDate() !== d) return null;
  return dt.getTime();
}

export default function TransactionsScreen() {
  const router = useRouter();
  const { txHistory } = useStore();

  const now = new Date();
  const [category, setCategory] = useState<'all' | TxKind>('all');
  const [status, setStatus] = useState<'all' | Status>('all');
  const [dateFilter, setDateFilter] = useState<DateFilter>({
    mode: 'month',
    year: now.getFullYear(),
    month: now.getMonth(),
  });

  const [catOpen, setCatOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);

  // month/year selection inside the date modal
  const [pickYear, setPickYear] = useState(now.getFullYear());
  const [pickMonth, setPickMonth] = useState(now.getMonth());
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [customErr, setCustomErr] = useState('');

  const years = useMemo(() => {
    const set = new Set(txHistory.map((t) => new Date(t.ts).getFullYear()));
    set.add(now.getFullYear());
    return Array.from(set).sort((a, b) => b - a);
  }, [txHistory, now]);

  const rows = useMemo(() => {
    const w = filterWindow(dateFilter);
    return txHistory
      .filter((t) => t.ts >= w.start && t.ts < w.end)
      .filter((t) => category === 'all' || t.kind === category)
      .filter((t) => status === 'all' || t.status === status)
      .sort((a, b) => b.ts - a.ts);
  }, [txHistory, dateFilter, category, status]);

  const moneyIn = rows.filter((t) => t.amount > 0).reduce((a, t) => a + t.amount, 0);
  const moneyOut = rows.filter((t) => t.amount < 0).reduce((a, t) => a + t.amount, 0);

  const applyCustom = () => {
    const from = parseDate(customFrom);
    const to = parseDate(customTo);
    if (from === null || to === null) {
      setCustomErr('Enter both dates as DD/MM/YYYY');
      return;
    }
    if (to < from) {
      setCustomErr('"To" must be after "From"');
      return;
    }
    setCustomErr('');
    setDateFilter({ mode: 'custom', from, to: to + 86_399_000 });
    setDateOpen(false);
  };

  const chip = (active: boolean) => [styles.chip, active && styles.chipActive];

  return (
    <View style={styles.screen}>
      <StatusBar style={STATUSBAR} />
      <ScreenHeader title="Transactions" subtitle="Filter, review & report" showBack />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 48 }}>
        {/* category + status */}
        <View style={styles.filterRow}>
          <Pressable style={({ pressed }) => [...chip(false), pressed && { opacity: 0.8 }]} onPress={() => setCatOpen(true)}>
            <Ionicons name="grid-outline" size={13} color={category === 'all' ? C.muted : C.green} />
            <Text style={[styles.chipText, category !== 'all' && { color: C.green }]} numberOfLines={1}>
              {category === 'all' ? 'All Categories' : KIND_META[category].label}
            </Text>
            <Ionicons name="chevron-down" size={13} color={C.faint} />
          </Pressable>
          <Pressable style={({ pressed }) => [...chip(false), pressed && { opacity: 0.8 }]} onPress={() => setStatusOpen(true)}>
            <Ionicons name="checkmark-done-outline" size={13} color={status === 'all' ? C.muted : C.green} />
            <Text style={[styles.chipText, status !== 'all' && { color: C.green }]} numberOfLines={1}>
              {status === 'all' ? 'All Status' : status}
            </Text>
            <Ionicons name="chevron-down" size={13} color={C.faint} />
          </Pressable>
        </View>

        {/* period */}
        <Pressable style={({ pressed }) => [...chip(false), styles.periodChip, pressed && { opacity: 0.8 }]} onPress={() => setDateOpen(true)}>
          <Ionicons name="calendar-outline" size={14} color={C.green} />
          <Text style={[styles.chipText, { color: C.ink, flex: 1 }]}>{dateFilterLabel(dateFilter)}</Text>
          <Ionicons name="chevron-down" size={13} color={C.faint} />
        </Pressable>

        {/* balanced in / out / entries */}
        <View style={styles.statRow}>
          <View style={styles.statCell}>
            <Text style={styles.statLabel}>Money in</Text>
            <HiddenStars value={moneyIn} style={[styles.statValue, { color: C.positive }]} />
          </View>
          <View style={styles.statCell}>
            <Text style={styles.statLabel}>Money out</Text>
            <HiddenStars value={moneyOut} style={[styles.statValue, { color: C.ink }]} />
          </View>
          <View style={styles.statCell}>
            <Text style={styles.statLabel}>Entries</Text>
            <Text style={styles.statValue}>{rows.length}</Text>
          </View>
        </View>

        {/* report generator */}
        <Pressable
          onPress={() => router.push('/report' as never)}
          style={({ pressed }) => [styles.reportCard, pressed && { opacity: 0.85 }]}
        >
          <View style={styles.reportIcon}>
            <Ionicons name="document-text-outline" size={20} color={C.green} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.reportTitle}>Generate report</Text>
            <Text style={styles.reportSub}>Excel or PDF statement for any period</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={C.faint} />
        </Pressable>

        {/* ledger */}
        <View style={styles.list}>
          {rows.length === 0 ? (
            <Card pad={S.xxl} radius={R.lg}>
              <Text style={styles.empty}>No transactions match these filters</Text>
            </Card>
          ) : (
            rows.map((t) => {
              const meta = KIND_META[t.kind];
              const credit = t.amount >= 0;
              return (
                <Pressable
                  key={t.id}
                  onPress={() => router.push(`/transaction/${t.id}` as never)}
                  accessibilityLabel={`View transaction ${t.reference}`}
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

      {/* ---------- category modal ---------- */}
      <Modal visible={catOpen} transparent animationType="fade" onRequestClose={() => setCatOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setCatOpen(false)}>
          <Pressable style={styles.modalCard} onPress={() => undefined}>
            <Text style={styles.modalTitle}>Filter by category</Text>
            {[{ id: 'all' as const, label: 'All Categories' }, ...KINDS.map((k) => ({ id: k, label: KIND_META[k].label }))].map(
              (opt) => {
                const active = category === opt.id;
                const meta = opt.id === 'all' ? null : KIND_META[opt.id];
                return (
                  <Pressable
                    key={opt.id}
                    style={({ pressed }) => [styles.optionRow, pressed && { opacity: 0.7 }]}
                    onPress={() => {
                      setCategory(opt.id);
                      setCatOpen(false);
                    }}
                  >
                    {meta ? (
                      <View style={[styles.txIcon, { backgroundColor: `${meta.color}16` }]}>
                        <Ionicons name={meta.icon as never} size={15} color={meta.color} />
                      </View>
                    ) : (
                      <View style={[styles.txIcon, { backgroundColor: C.canvasAlt }]}>
                        <Ionicons name="grid-outline" size={15} color={C.muted} />
                      </View>
                    )}
                    <Text style={styles.optionLabel}>{opt.label}</Text>
                    {active ? <Ionicons name="checkmark" size={18} color={C.green} /> : null}
                  </Pressable>
                );
              },
            )}
          </Pressable>
        </Pressable>
      </Modal>

      {/* ---------- status modal ---------- */}
      <Modal visible={statusOpen} transparent animationType="fade" onRequestClose={() => setStatusOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setStatusOpen(false)}>
          <Pressable style={styles.modalCard} onPress={() => undefined}>
            <Text style={styles.modalTitle}>Filter by status</Text>
            {(['all', ...STATUSES] as const).map((opt) => {
              const active = status === opt;
              const color = opt === 'Completed' ? C.green : opt === 'Pending' ? '#F6A623' : opt === 'Failed' ? C.negative : C.muted;
              return (
                <Pressable
                  key={opt}
                  style={({ pressed }) => [styles.optionRow, pressed && { opacity: 0.7 }]}
                  onPress={() => {
                    setStatus(opt);
                    setStatusOpen(false);
                  }}
                >
                  <View style={[styles.txIcon, { backgroundColor: `${color}16` }]}>
                    <Ionicons name={opt === 'all' ? 'checkmark-done-outline' : 'ellipse'} size={15} color={color} />
                  </View>
                  <Text style={styles.optionLabel}>{opt === 'all' ? 'All Status' : opt}</Text>
                  {active ? <Ionicons name="checkmark" size={18} color={C.green} /> : null}
                </Pressable>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>

      {/* ---------- date / period modal ---------- */}
      <Modal visible={dateOpen} transparent animationType="fade" onRequestClose={() => setDateOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setDateOpen(false)}>
          <Pressable style={styles.modalCard} onPress={() => undefined}>
            <Text style={styles.modalTitle}>Select period</Text>

            {/* time frames */}
            <Text style={styles.sectionLabel}>TIME FRAME</Text>
            <View style={styles.tfRow}>
              {[
                { label: 'All time', apply: () => setDateFilter({ mode: 'all' }) },
                { label: 'Last 3 months', apply: () => setDateFilter({ mode: 'lastN', months: 3 }) },
                { label: 'Last 6 months', apply: () => setDateFilter({ mode: 'lastN', months: 6 }) },
              ].map((tf) => (
                <Pressable
                  key={tf.label}
                  style={({ pressed }) => [
                    styles.tfChip,
                    dateFilterLabel(dateFilter) === tf.label && styles.tfChipActive,
                    pressed && { opacity: 0.8 },
                  ]}
                  onPress={() => {
                    tf.apply();
                    setDateOpen(false);
                  }}
                >
                  <Text
                    style={[
                      styles.tfChipText,
                      dateFilterLabel(dateFilter) === tf.label && styles.tfChipTextActive,
                    ]}
                  >
                    {tf.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* month & year */}
            <Text style={styles.sectionLabel}>MONTH & YEAR</Text>
            <View style={styles.yearRow}>
              {years.map((y) => (
                <Pressable
                  key={y}
                  onPress={() => setPickYear(y)}
                  style={({ pressed }) => [
                    styles.tfChip,
                    pickYear === y && styles.tfChipActive,
                    pressed && { opacity: 0.8 },
                  ]}
                >
                  <Text style={[styles.tfChipText, pickYear === y && styles.tfChipTextActive]}>{y}</Text>
                </Pressable>
              ))}
            </View>
            <View style={styles.monthGrid}>
              {MONTHS.map((m, i) => (
                <Pressable
                  key={m}
                  onPress={() => {
                    setPickMonth(i);
                    setDateFilter({ mode: 'month', year: pickYear, month: i });
                    setDateOpen(false);
                  }}
                  style={({ pressed }) => [
                    styles.monthChip,
                    pickMonth === i && pickYear === now.getFullYear() && styles.tfChipActive,
                    pressed && { opacity: 0.8 },
                  ]}
                >
                  <Text style={[styles.tfChipText, pickMonth === i && styles.tfChipTextActive]}>{m}</Text>
                </Pressable>
              ))}
            </View>

            {/* custom range */}
            <Text style={styles.sectionLabel}>CUSTOM RANGE</Text>
            <View style={styles.customRow}>
              <View style={styles.customField}>
                <Text style={styles.customLabel}>From</Text>
                <TextInput
                  value={customFrom}
                  onChangeText={(v) => {
                    setCustomFrom(v);
                    setCustomErr('');
                  }}
                  placeholder="DD/MM/YYYY"
                  placeholderTextColor={C.faint}
                  style={styles.customInput}
                  keyboardType="numbers-and-punctuation"
                />
              </View>
              <View style={styles.customField}>
                <Text style={styles.customLabel}>To</Text>
                <TextInput
                  value={customTo}
                  onChangeText={(v) => {
                    setCustomTo(v);
                    setCustomErr('');
                  }}
                  placeholder="DD/MM/YYYY"
                  placeholderTextColor={C.faint}
                  style={styles.customInput}
                  keyboardType="numbers-and-punctuation"
                />
              </View>
            </View>
            {customErr ? <Text style={styles.customErr}>{customErr}</Text> : null}
            <Pressable
              onPress={applyCustom}
              style={({ pressed }) => [styles.applyBtn, pressed && { opacity: 0.85 }]}
            >
              <Text style={styles.applyBtnText}>Apply custom range</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const makeStyles = () =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: C.canvas },
    filterRow: { flexDirection: 'row', paddingHorizontal: S.xl, gap: S.sm, marginTop: S.sm },
    chip: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: R.pill,
      backgroundColor: C.surface,
      borderWidth: 1,
      borderColor: C.hairline,
    },
    periodChip: { flex: 0, marginHorizontal: S.xl, marginTop: S.sm },
    chipText: { color: C.muted, fontFamily: F.sans, fontSize: 12.5, fontWeight: '700' },
    chipActive: { backgroundColor: C.green, borderColor: C.green },
    statRow: { flexDirection: 'row', paddingHorizontal: S.xl, marginTop: S.lg, gap: S.sm },
    statCell: {
      flex: 1,
      backgroundColor: C.surface,
      borderRadius: R.lg,
      borderWidth: 1,
      borderColor: C.hairline,
      paddingVertical: S.md,
      paddingHorizontal: S.sm,
      alignItems: 'center',
    },
    statLabel: { color: C.muted, fontFamily: F.sans, fontSize: 11, marginBottom: 5 },
    statValue: { color: C.ink, fontFamily: F.display, fontSize: 15, fontWeight: '800' },
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
    modalBackdrop: {
      flex: 1,
      backgroundColor: 'rgba(6,10,8,0.6)',
      alignItems: 'center',
      justifyContent: 'center',
      padding: S.lg,
    },
    modalCard: {
      width: '100%',
      maxWidth: 400,
      maxHeight: '86%',
      backgroundColor: C.surface,
      borderRadius: R.xl,
      padding: S.xl,
    },
    modalTitle: { color: C.ink, fontFamily: F.display, fontSize: 17, fontWeight: '800', marginBottom: S.md },
    sectionLabel: {
      color: C.faint,
      fontFamily: F.sans,
      fontSize: 10,
      fontWeight: '800',
      letterSpacing: 1.1,
      marginTop: S.md,
      marginBottom: S.sm,
    },
    optionRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 9 },
    optionLabel: { color: C.ink, fontFamily: F.sans, fontSize: 14, fontWeight: '600', flex: 1 },
    tfRow: { flexDirection: 'row', gap: S.sm, flexWrap: 'wrap' },
    yearRow: { flexDirection: 'row', gap: S.sm, flexWrap: 'wrap' },
    tfChip: {
      paddingHorizontal: 13,
      paddingVertical: 8,
      borderRadius: R.pill,
      backgroundColor: C.canvasAlt,
      borderWidth: 1,
      borderColor: C.hairline,
    },
    tfChipActive: { backgroundColor: C.green, borderColor: C.green },
    tfChipText: { color: C.muted, fontFamily: F.sans, fontSize: 12, fontWeight: '700' },
    tfChipTextActive: { color: C.white },
    monthGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: S.sm },
    monthChip: {
      width: '14%',
      minWidth: 52,
      alignItems: 'center',
      paddingVertical: 8,
      borderRadius: R.pill,
      backgroundColor: C.canvasAlt,
      borderWidth: 1,
      borderColor: C.hairline,
    },
    customRow: { flexDirection: 'row', gap: S.sm },
    customField: { flex: 1 },
    customLabel: { color: C.muted, fontFamily: F.sans, fontSize: 11.5, marginBottom: 5 },
    customInput: {
      backgroundColor: C.canvasAlt,
      borderRadius: R.md,
      paddingHorizontal: 12,
      height: 44,
      color: C.ink,
      fontFamily: F.sans,
      fontSize: 14,
      fontWeight: '600',
    },
    customErr: { color: C.negative, fontFamily: F.sans, fontSize: 11.5, marginTop: 7 },
    applyBtn: {
      backgroundColor: C.green,
      borderRadius: R.md,
      paddingVertical: 13,
      alignItems: 'center',
      marginTop: S.md,
    },
    applyBtnText: { color: C.white, fontFamily: F.sans, fontSize: 14.5, fontWeight: '800' },
  });

let styles = makeStyles();
registerStyles(() => {
  styles = makeStyles();
});
