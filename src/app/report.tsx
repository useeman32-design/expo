import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';

import { Card, ScreenHeader } from '@/components/primitives';
import { KIND_META } from '@/components/ReceiptModal';
import { useStore } from '@/store';
import { useAuth } from '@/auth';
import type { TxKind } from '@/types';
import { C, F, R, S, STATUSBAR, registerStyles } from '@/theme';
import { money } from '@/utils';
import { exportExcel, exportPdfHtml } from '@/utils/exportFile';

/**
 * Statement report generator: filter by last month, last 2 months, a custom
 * from–to range, or everything since the account was opened. The statement
 * carries the investor's full name and exports to Excel (.xlsx) or PDF.
 */

type Period = 'last_month' | 'last_2m' | 'custom' | 'all';

const PERIODS: { id: Period; label: string }[] = [
  { id: 'last_month', label: 'Last month' },
  { id: 'last_2m', label: 'Last 2 months' },
  { id: 'custom', label: 'Custom' },
  { id: 'all', label: 'Since account opened' },
];

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

export default function ReportScreen() {
  const { txHistory } = useStore();
  const { user } = useAuth();
  const fullName = user?.name || 'StocksX Investor';

  const [period, setPeriod] = useState<Period>('last_month');
  const [fromStr, setFromStr] = useState('');
  const [toStr, setToStr] = useState('');
  const [rangeErr, setRangeErr] = useState('');
  const [saved, setSaved] = useState('');

  const accountOpened = useMemo(
    () => (txHistory.length ? Math.min(...txHistory.map((t) => t.ts)) : 0),
    [txHistory],
  );

  const win = useMemo((): { start: number; end: number; label: string } => {
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    switch (period) {
      case 'last_month': {
        const start = new Date(now.getFullYear(), now.getMonth() - 1, 1).getTime();
        return {
          start,
          end: thisMonthStart,
          label: new Date(start).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }),
        };
      }
      case 'last_2m':
        return {
          start: Date.now() - 61 * 86_400_000,
          end: Date.now(),
          label: 'Last 2 months',
        };
      case 'custom': {
        const from = parseDate(fromStr);
        const to = parseDate(toStr);
        if (from !== null && to !== null && to >= from) {
          const f = (ts: number) => new Date(ts).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
          return { start: from, end: to + 86_399_000, label: `${f(from)} – ${f(to)}` };
        }
        return { start: 0, end: 0, label: 'Custom range' };
      }
      case 'all':
      default:
        return {
          start: accountOpened,
          end: Date.now(),
          label: `Since ${new Date(accountOpened).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}`,
        };
    }
  }, [period, fromStr, toStr, accountOpened]);

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

  const fmtShort = (ts: number) => new Date(ts).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  const generatedLabel = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const fileBase = `stocksx-statement-${win.label.replace(/[^\w]+/g, '-').toLowerCase()}`;

  const validCustom = period !== 'custom' || (win.start > 0 && win.end > win.start);

  const flash = (msg: string) => {
    setSaved(msg);
    setTimeout(() => setSaved(''), 2200);
  };

  const doExcel = async () => {
    if (!validCustom) return setRangeErr('Enter a valid from–to range first');
    setRangeErr('');
    const sheet: (string | number)[][] = [
      ['StocksX — Transaction Statement'],
      ['Prepared for', fullName],
      ['Period', win.label],
      ['Generated', generatedLabel],
      [],
      ['Date', 'Category', 'Details', 'Method', 'Reference', 'Status', 'Amount (NGN)', 'Balance after'],
      ...rows.map((t) => [
        new Date(t.ts).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
        KIND_META[t.kind].label,
        t.note ?? '',
        t.method ?? '',
        t.reference,
        t.status,
        t.amount,
        t.balanceAfter,
      ]),
      [],
      ['Total in', moneyIn],
      ['Total out', moneyOut],
      ['Net change', net],
      ['Entries', rows.length],
    ];
    const res = await exportExcel(sheet, fileBase, 'Statement');
    flash(res === 'ok' ? 'Excel exported' : 'Export failed — try again');
  };

  const doPdf = async () => {
    if (!validCustom) return setRangeErr('Enter a valid from–to range first');
    setRangeErr('');
    const entryRows = rows
      .map(
        (t) =>
          `<tr><td>${fmtShort(t.ts)}</td><td>${KIND_META[t.kind].label}${t.ticker ? ` · ${t.ticker}` : ''}</td>` +
          `<td class="r">${t.amount >= 0 ? '+' : '−'}${money(Math.abs(t.amount))}</td></tr>`,
      )
      .join('');
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>StocksX Statement</title>
<style>
  *{box-sizing:border-box}
  body{font-family:Arial,Helvetica,sans-serif;color:#15201A;margin:32px}
  .brand{display:flex;align-items:center;gap:12px;margin-bottom:6px}
  .logo{width:44px;height:44px;border-radius:12px;background:#0E8A57;color:#fff;font-weight:800;font-size:19px;display:flex;align-items:center;justify-content:center}
  h1{font-size:20px;margin:0}
  .sub{color:#6C7771;font-size:12px}
  .meta{margin:18px 0;border:1px solid #EAEFEB;border-radius:12px;padding:14px 16px;font-size:13px}
  .meta b{display:inline-block;min-width:130px;color:#6C7771;font-weight:600}
  .grid{display:flex;gap:12px;margin:16px 0}
  .cell{flex:1;border:1px solid #EAEFEB;border-radius:12px;padding:12px 14px}
  .cell .l{font-size:11px;color:#6C7771;margin-bottom:4px}
  .cell .v{font-size:17px;font-weight:800}
  .pos{color:#0E8A57}.neg{color:#DD4B3E}
  table{width:100%;border-collapse:collapse;font-size:12px;margin-top:8px}
  th{text-align:left;background:#F4F6F5;padding:8px;border-bottom:2px solid #EAEFEB}
  td{padding:7px 8px;border-bottom:1px solid #F0F3F1}
  .r{text-align:right;font-weight:700}
  .foot{margin-top:22px;color:#9AA49E;font-size:10.5px;text-align:center}
</style></head><body>
<div class="brand"><div class="logo">SX</div><div><h1>StocksX — Transaction Statement</h1><div class="sub">Prepared for ${fullName}</div></div></div>
<div class="meta"><b>Period</b> ${win.label}<br><b>Generated</b> ${generatedLabel}<br><b>Account</b> ${fullName}<br><b>Entries</b> ${rows.length}</div>
<div class="grid">
  <div class="cell"><div class="l">Total in</div><div class="v pos">+${money(moneyIn)}</div></div>
  <div class="cell"><div class="l">Total out</div><div class="v">−${money(Math.abs(moneyOut))}</div></div>
  <div class="cell"><div class="l">Net change</div><div class="v ${net >= 0 ? 'pos' : 'neg'}">${net >= 0 ? '+' : '−'}${money(Math.abs(net))}</div></div>
</div>
<table><tr><th>Date</th><th>Transaction</th><th style="text-align:right">Amount</th></tr>${entryRows}</table>
<div class="foot">Generated by StocksX · ${generatedLabel}</div>
</body></html>`;
    const res = await exportPdfHtml(html);
    flash(res === 'ok' ? 'Opening print / PDF…' : 'Export failed — try again');
  };

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

        {/* custom range inputs */}
        {period === 'custom' ? (
          <View style={styles.customWrap}>
            <View style={styles.customField}>
              <Text style={styles.customLabel}>From</Text>
              <TextInput
                value={fromStr}
                onChangeText={(v) => {
                  setFromStr(v);
                  setRangeErr('');
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
                value={toStr}
                onChangeText={(v) => {
                  setToStr(v);
                  setRangeErr('');
                }}
                placeholder="DD/MM/YYYY"
                placeholderTextColor={C.faint}
                style={styles.customInput}
                keyboardType="numbers-and-punctuation"
              />
            </View>
          </View>
        ) : null}
        {rangeErr ? <Text style={styles.rangeErr}>{rangeErr}</Text> : null}

        {/* statement */}
        <View style={styles.statementWrap}>
          <View style={styles.statement}>
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

            <View style={styles.preparedRow}>
              <Text style={styles.preparedLabel}>Prepared for</Text>
              <Text style={styles.preparedName}>{fullName}</Text>
            </View>
            <View style={styles.preparedRow}>
              <Text style={styles.preparedLabel}>Generated</Text>
              <Text style={styles.preparedValue}>{generatedLabel}</Text>
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
                      <Text style={styles.breakCount}>
                        {v.count} transaction{v.count > 1 ? 's' : ''}
                      </Text>
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
            {rows.length > 30 ? <Text style={styles.moreNote}>+ {rows.length - 30} earlier entries</Text> : null}

            <View style={styles.dash} />
            <Text style={styles.footer}>
              Generated {generatedLabel} · StocksX · {fullName}
            </Text>
          </View>
        </View>

        {/* exports */}
        <View style={{ paddingHorizontal: S.xl, marginTop: S.lg }}>
          <View style={styles.exportRow}>
            <Pressable onPress={doExcel} style={({ pressed }) => [styles.excelBtn, pressed && { opacity: 0.85 }]}>
              <Ionicons name="grid-outline" size={17} color={C.white} />
              <Text style={styles.exportBtnText}>{saved === 'Excel exported' ? 'Exported!' : 'Export Excel'}</Text>
            </Pressable>
            <View style={{ width: S.sm }} />
            <Pressable onPress={doPdf} style={({ pressed }) => [styles.pdfBtn, pressed && { opacity: 0.85 }]}>
              <Ionicons name="document-text-outline" size={17} color={C.green} />
              <Text style={styles.pdfBtnText}>{saved === 'Opening print / PDF…' ? 'Opening…' : 'Export PDF'}</Text>
            </Pressable>
          </View>
          <Text style={styles.note}>
            Excel saves a .xlsx workbook; PDF opens the print sheet — choose “Save as PDF”. Custom ranges run from your
            account opening date.
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
    customWrap: { flexDirection: 'row', paddingHorizontal: S.xl, gap: S.sm, marginTop: S.md },
    customField: { flex: 1 },
    customLabel: { color: C.muted, fontFamily: F.sans, fontSize: 11.5, marginBottom: 5 },
    customInput: {
      backgroundColor: C.surface,
      borderRadius: R.md,
      borderWidth: 1,
      borderColor: C.hairline,
      paddingHorizontal: 12,
      height: 44,
      color: C.ink,
      fontFamily: F.sans,
      fontSize: 14,
      fontWeight: '600',
    },
    rangeErr: { color: C.negative, fontFamily: F.sans, fontSize: 11.5, marginTop: 7, paddingHorizontal: S.xl },
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
    preparedRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
    preparedLabel: { color: C.muted, fontFamily: F.sans, fontSize: 12.5 },
    preparedName: { color: C.ink, fontFamily: F.sans, fontSize: 12.5, fontWeight: '800' },
    preparedValue: { color: C.ink2, fontFamily: F.sans, fontSize: 12.5, fontWeight: '600' },
    dash: { height: 1, backgroundColor: C.hairlineSoft, marginVertical: S.lg },
    summaryGrid: { flexDirection: 'row', flexWrap: 'wrap' },
    summaryCell: { width: '50%', paddingVertical: 7 },
    summaryLabel: { color: C.muted, fontFamily: F.sans, fontSize: 11.5, marginBottom: 3 },
    summaryValue: { color: C.ink, fontFamily: F.display, fontSize: 17, fontWeight: '800' },
    sectionLabel: {
      color: C.faint,
      fontFamily: F.sans,
      fontSize: 10.5,
      fontWeight: '800',
      letterSpacing: 1.1,
      marginBottom: S.md,
    },
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
    exportRow: { flexDirection: 'row' },
    excelBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: C.green,
      paddingVertical: 15,
      borderRadius: R.md,
    },
    pdfBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: C.surface,
      borderWidth: 1.5,
      borderColor: C.green,
      paddingVertical: 15,
      borderRadius: R.md,
    },
    exportBtnText: { color: C.white, fontFamily: F.sans, fontSize: 14.5, fontWeight: '800' },
    pdfBtnText: { color: C.green, fontFamily: F.sans, fontSize: 14.5, fontWeight: '800' },
    note: { color: C.faint, fontFamily: F.sans, fontSize: 11.5, textAlign: 'center', marginTop: S.md },
  });

let styles = makeStyles();
registerStyles(() => {
  styles = makeStyles();
});
