import { useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';

import { Card, ScreenHeader } from '@/components/primitives';
import { KIND_META } from '@/components/ReceiptModal';
import { useStore } from '@/store';
import type { TxKind } from '@/types';
import { C, F, R, S, STATUSBAR, registerStyles } from '@/theme';
import { money } from '@/utils';
import { shareViewAsJpg } from '@/utils/shareImage';

/**
 * Statement report generator: pick a period (this month, last month, last
 * 3 months, year to date, all time), review the aggregated statement and
 * save/share it as a JPG image.
 */

type Period = 'this_month' | 'last_month' | 'last_3m' | 'ytd' | 'all';

const PERIODS: { id: Period; label: string }[] = [
  { id: 'this_month', label: 'This month' },
  { id: 'last_month', label: 'Last month' },
  { id: 'last_3m', label: 'Last 3 months' },
  { id: 'ytd', label: 'Year to date' },
  { id: 'all', label: 'All time' },
];

function periodWindow(p: Period): { start: number; end: number; label: string } {
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  switch (p) {
    case 'this_month':
      return { start: thisMonthStart, end: Date.now(), label: now.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }) };
    case 'last_month': {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1).getTime();
      return {
        start,
        end: thisMonthStart,
        label: new Date(start).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }),
      };
    }
    case 'last_3m':
      return {
        start: Date.now() - 90 * 86_400_000,
        end: Date.now(),
        label: 'Last 3 months',
      };
    case 'ytd':
      return { start: new Date(now.getFullYear(), 0, 1).getTime(), end: Date.now(), label: String(now.getFullYear()) };
    case 'all':
    default:
      return { start: 0, end: Date.now(), label: 'All time' };
  }
}

export default function ReportScreen() {
  const { txHistory } = useStore();
  const [period, setPeriod] = useState<Period>('this_month');
  const [saved, setSaved] = useState(false);
  const statementRef = useRef<View>(null);

  const win = useMemo(() => periodWindow(period), [period]);

  const rows = useMemo(
    () => txHistory.filter((t) => t.ts >= win.start && t.ts < win.end).sort((a, b) => b.ts - a.ts),
    [txHistory, win],
  );

  const moneyIn = rows.filter((t) => t.amount > 0).reduce((a, t) => a + t.amount, 0);
  const moneyOut = rows.filter((t) => t.amount < 0).reduce((a, t) => a + t.amount, 0);
  const net = moneyIn + moneyOut;

  const breakdown = useMemo(() => {
    const map = new Map<TxKind, { count: number; net: number }>();
    for (const t of rows) {
      const cur = map.get(t.kind) ?? { count: 0, net: 0 };
      cur.count += 1;
      cur.net += t.amount;
      map.set(t.kind, cur);
    }
    return Array.from(map.entries()).sort((a, b) => Math.abs(b[1].net) - Math.abs(a[1].net));
  }, [rows]);

  const maxAbs = Math.max(1, ...breakdown.map(([, v]) => Math.abs(v.net)));

  const save = async () => {
    const res = await shareViewAsJpg(statementRef, `stocksx-statement-${win.label.replace(/\s+/g, '-').toLowerCase()}.jpg`);
    if (res !== 'failed') {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const fmtShort = (ts: number) => new Date(ts).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

  return (
    <View style={styles.screen}>
      <StatusBar style={STATUSBAR} />
      <ScreenHeader title="Report" subtitle="Transaction statement" showBack />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 48 }}>
        {/* period picker */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.periodRow}>
          {PERIODS.map((p) => {
            const active = p.id === period;
            return (
              <Pressable
                key={p.id}
                onPress={() => setPeriod(p.id)}
                style={({ pressed }) => [styles.chip, active && styles.chipActive, pressed && { opacity: 0.8 }]}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{p.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* statement (capture target) */}
        <View style={styles.statementWrap}>
          <View ref={statementRef} collapsable={false} style={styles.statement}>
            {/* letterhead */}
            <View style={styles.head}>
              <Image source={require('@/assets/images/logo-app.png')} style={styles.logo} contentFit="contain" />
              <View style={{ flex: 1 }}>
                <Text style={styles.brand}>StocksX</Text>
                <Text style={styles.brandSub}>Transaction statement</Text>
              </View>
              <View style={styles.periodTag}>
                <Text style={styles.periodTagText}>{win.label}</Text>
              </View>
            </View>

            <View style={styles.dash} />

            <View style={styles.summaryGrid}>
              <View style={styles.summaryCell}>
                <Text style={styles.summaryLabel}>Total in</Text>
                <Text style={[styles.summaryValue, { color: C.positive }]}>{money(moneyIn)}</Text>
              </View>
              <View style={styles.summaryCell}>
                <Text style={styles.summaryLabel}>Total out</Text>
                <Text style={styles.summaryValue}>{money(Math.abs(moneyOut))}</Text>
              </View>
              <View style={styles.summaryCell}>
                <Text style={styles.summaryLabel}>Net change</Text>
                <Text style={[styles.summaryValue, { color: net >= 0 ? C.positive : C.negative }]}>
                  {net >= 0 ? '+' : '−'}
                  {money(Math.abs(net))}
                </Text>
              </View>
              <View style={styles.summaryCell}>
                <Text style={styles.summaryLabel}>Entries</Text>
                <Text style={styles.summaryValue}>{rows.length}</Text>
              </View>
            </View>

            <View style={styles.dash} />

            {/* breakdown */}
            <Text style={styles.sectionLabel}>BREAKDOWN</Text>
            {breakdown.length === 0 ? (
              <Text style={styles.empty}>No transactions in this period</Text>
            ) : (
              breakdown.map(([kind, v]) => {
                const meta = KIND_META[kind];
                return (
                  <View key={kind} style={styles.breakRow}>
                    <View style={[styles.breakIcon, { backgroundColor: `${meta.color}16` }]}>
                      <Ionicons name={meta.icon as never} size={13} color={meta.color} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={styles.breakTop}>
                        <Text style={styles.breakLabel}>{meta.label}</Text>
                        <Text style={[styles.breakNet, { color: v.net >= 0 ? C.positive : C.ink2 }]}>
                          {v.net >= 0 ? '+' : '−'}
                          {money(Math.abs(v.net))}
                        </Text>
                      </View>
                      <View style={styles.breakTrack}>
                        <View
                          style={[
                            styles.breakBar,
                            { width: `${Math.max(6, (Math.abs(v.net) / maxAbs) * 100)}%`, backgroundColor: meta.color },
                          ]}
                        />
                      </View>
                      <Text style={styles.breakCount}>{v.count} transaction{v.count > 1 ? 's' : ''}</Text>
                    </View>
                  </View>
                );
              })
            )}

            <View style={styles.dash} />

            {/* entries */}
            <Text style={styles.sectionLabel}>ENTRIES</Text>
            {rows.slice(0, 30).map((t) => (
              <View key={t.id} style={styles.entryRow}>
                <Text style={styles.entryDate}>{fmtShort(t.ts)}</Text>
                <Text style={styles.entryLabel} numberOfLines={1}>
                  {KIND_META[t.kind].label}
                  {t.ticker ? ` · ${t.ticker}` : ''}
                </Text>
                <Text style={[styles.entryAmount, { color: t.amount >= 0 ? C.positive : C.ink2 }]}>
                  {t.amount >= 0 ? '+' : '−'}
                  {money(Math.abs(t.amount))}
                </Text>
              </View>
            ))}
            {rows.length > 30 ? (
              <Text style={styles.moreNote}>+ {rows.length - 30} earlier entries</Text>
            ) : null}

            <View style={styles.dash} />
            <Text style={styles.footer}>
              Generated {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} · StocksX
            </Text>
          </View>
        </View>

        {/* save / share */}
        <View style={{ paddingHorizontal: S.xl, marginTop: S.lg }}>
          <Pressable onPress={save} style={({ pressed }) => [styles.saveBtn, pressed && { opacity: 0.85 }]}>
            <Ionicons name="download-outline" size={17} color={C.white} />
            <Text style={styles.saveBtnText}>{saved ? 'Saved!' : 'Save as image'}</Text>
          </Pressable>
          <Text style={styles.note}>
            The statement is saved as a JPG — share it, print it or attach it wherever you need.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const makeStyles = () =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: C.canvas },
    periodRow: { paddingHorizontal: S.xl, gap: S.sm, marginTop: S.sm, paddingBottom: 2 },
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
    statementWrap: { paddingHorizontal: S.xl, marginTop: S.lg },
    statement: {
      backgroundColor: C.surface,
      borderRadius: R.xl,
      padding: S.xl,
      borderWidth: 1,
      borderColor: C.hairline,
    },
    head: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    logo: { width: 38, height: 38, borderRadius: 11 },
    brand: { color: C.ink, fontFamily: F.display, fontSize: 17, fontWeight: '800' },
    brandSub: { color: C.muted, fontFamily: F.sans, fontSize: 11.5, marginTop: 1 },
    periodTag: {
      backgroundColor: C.canvasAlt,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: R.pill,
      borderWidth: 1,
      borderColor: C.hairline,
    },
    periodTagText: { color: C.ink2, fontFamily: F.sans, fontSize: 11, fontWeight: '700' },
    dash: { height: 1, backgroundColor: C.hairlineSoft, marginVertical: S.lg },
    summaryGrid: { flexDirection: 'row', flexWrap: 'wrap' },
    summaryCell: { width: '50%', paddingVertical: 7 },
    summaryLabel: { color: C.muted, fontFamily: F.sans, fontSize: 11.5, marginBottom: 3 },
    summaryValue: { color: C.ink, fontFamily: F.display, fontSize: 17, fontWeight: '800' },
    sectionLabel: { color: C.faint, fontFamily: F.sans, fontSize: 10.5, fontWeight: '800', letterSpacing: 1.1, marginBottom: S.md },
    empty: { color: C.muted, fontFamily: F.sans, fontSize: 13 },
    breakRow: { flexDirection: 'row', gap: 11, marginBottom: S.md },
    breakIcon: { width: 30, height: 30, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
    breakTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    breakLabel: { color: C.ink, fontFamily: F.sans, fontSize: 13, fontWeight: '700' },
    breakNet: { fontFamily: F.display, fontSize: 12.5, fontWeight: '800' },
    breakTrack: { height: 5, borderRadius: 3, backgroundColor: C.canvasAlt, marginTop: 6, overflow: 'hidden' },
    breakBar: { height: 5, borderRadius: 3 },
    breakCount: { color: C.faint, fontFamily: F.sans, fontSize: 10.5, marginTop: 3 },
    entryRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, gap: 10 },
    entryDate: { color: C.faint, fontFamily: F.sans, fontSize: 11, width: 44 },
    entryLabel: { color: C.ink2, fontFamily: F.sans, fontSize: 12.5, flex: 1 },
    entryAmount: { fontFamily: F.display, fontSize: 12.5, fontWeight: '800' },
    moreNote: { color: C.faint, fontFamily: F.sans, fontSize: 11, marginTop: 4 },
    footer: { color: C.faint, fontFamily: F.sans, fontSize: 10.5, textAlign: 'center' },
    saveBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: C.green,
      paddingVertical: 15,
      borderRadius: R.md,
    },
    saveBtnText: { color: C.white, fontFamily: F.sans, fontSize: 15, fontWeight: '800' },
    note: { color: C.faint, fontFamily: F.sans, fontSize: 11.5, textAlign: 'center', marginTop: S.md },
  });

let styles = makeStyles();
registerStyles(() => {
  styles = makeStyles();
});
