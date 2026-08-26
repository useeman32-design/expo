import { useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { Card, ScreenHeader, StockLogo } from '@/components/primitives';
import { useStore } from '@/store';
import { getStocks } from '@/services/marketData';
import { price as fmtPrice, money } from '@/utils';
import { C, F, R, S } from '@/theme';

/**
 * Auto-Trades — user-defined conditional orders.
 * "When MTNN rises above ₦300 → Buy 10 shares automatically."
 * Production: a backend price watcher evaluates rules on every tick and
 * submits the order through the BrokerAdapter (mystocks.africa) when a
 * trigger crosses. Buy-below triggers map naturally to resting limit orders
 * on NGX; sell triggers act as stop-loss / take-profit.
 */
export default function RulesScreen() {
  const router = useRouter();
  const { rules, addRule, removeRule, toggleRule, cash } = useStore();
  const [open, setOpen] = useState(false);
  const [stockId, setStockId] = useState('mtnn');
  const [side, setSide] = useState<'Buy' | 'Sell'>('Buy');
  const [trigger, setTrigger] = useState<'above' | 'below'>('above');
  const [price, setPrice] = useState('');
  const [qty, setQty] = useState('');
  const [err, setErr] = useState<string | null>(null);

  const stocks = useMemo(() => getStocks(), []);
  const selected = stocks.find((s) => s.id === stockId);
  const p = parseFloat(price) || 0;
  const q = parseInt(qty, 10) || 0;
  const est = p * q;

  const create = () => {
    if (!selected) return;
    const res = addRule({
      stockId: selected.id,
      ticker: selected.ticker,
      name: selected.name,
      side,
      trigger,
      price: p,
      qty: q,
    });
    if (res.ok) {
      setOpen(false);
      setPrice('');
      setQty('');
      setErr(null);
    } else setErr(res.msg);
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 48 }}>
        <ScreenHeader title="Auto-Trades" subtitle="Set it, forget it, stay disciplined" />

        {/* how it works */}
        <View style={{ paddingHorizontal: S.xl, marginTop: S.sm }}>
          <Card pad={S.lg} radius={R.lg}>
            <View style={styles.howRow}>
              <View style={styles.bolt}>
                <Ionicons name="flash" size={18} color={C.green} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.howTitle}>Trade while you sleep</Text>
                <Text style={styles.howSub}>
                  Pick a stock, a trigger price and what to do. We watch the market and place the
                  order the moment your price crosses — no need to check charts all day.
                </Text>
              </View>
            </View>
            <View style={styles.exampleRow}>
              <View style={styles.exampleTag}>
                <Text style={styles.exampleTagText}>EXAMPLE</Text>
              </View>
              <Text style={styles.exampleText}>
                “When <Text style={styles.ex}>MTNN</Text> falls below{' '}
                <Text style={styles.ex}>₦250</Text>, <Text style={styles.ex}>Buy 20 shares</Text>.”
                Your cash is reserved and the order fires automatically.
              </Text>
            </View>
          </Card>
        </View>

        {/* rules */}
        <View style={{ paddingHorizontal: S.xl, marginTop: S.lg, gap: S.sm }}>
          {rules.map((r) => (
            <Card key={r.id} pad={S.md} radius={R.md}>
              <View style={styles.ruleRow}>
                <Pressable
                  onPress={() => router.push(`/stock/${r.stockId}` as never)}
                  style={styles.ruleLeft}
                >
                  <StockLogo ticker={r.ticker} color={C.green} size={40} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.ruleTitle}>
                      <Text style={[styles.sideTag, { color: r.side === 'Buy' ? C.green : C.negative }]}>
                        {r.side} {r.qty.toLocaleString()} {r.ticker}
                      </Text>
                    </Text>
                    <Text style={styles.ruleSub}>
                      when it {r.trigger === 'above' ? 'rises above' : 'falls below'}{' '}
                      {fmtPrice(r.price)}
                    </Text>
                    <Text style={styles.ruleMeta}>
                      Armed {r.createdAt} · est. {money(r.qty * r.price)}
                    </Text>
                  </View>
                </Pressable>
                <View style={styles.ruleRight}>
                  <Switch
                    value={r.active}
                    onValueChange={() => toggleRule(r.id)}
                    trackColor={{ false: C.canvasAlt, true: C.green }}
                    thumbColor={C.white}
                  />
                  <Pressable onPress={() => removeRule(r.id)} style={styles.trash}>
                    <Ionicons name="trash-outline" size={16} color={C.negative} />
                  </Pressable>
                </View>
              </View>
            </Card>
          ))}

          <Pressable
            onPress={() => setOpen(true)}
            style={({ pressed }) => [styles.addCard, pressed && { opacity: 0.8 }]}
          >
            <Ionicons name="add-circle-outline" size={22} color={C.green} />
            <Text style={styles.addText}>New auto-trade</Text>
          </Pressable>
        </View>

        {/* disclosure */}
        <View style={{ paddingHorizontal: S.xl, marginTop: S.lg }}>
          <Card pad={S.lg} radius={R.lg} style={styles.riskCard}>
            <View style={styles.riskRow}>
              <Ionicons name="information-circle-outline" size={16} color="#F6A623" />
              <Text style={styles.riskTitle}>Good to know</Text>
            </View>
            <Text style={styles.riskText}>
              Triggered orders execute as market orders at the next available price, which can differ
              from your trigger price — especially at market open or during volatility. Rules pause
              automatically if your cash or share balance becomes insufficient. Auto-trades run
              server-side once live trading is enabled.
            </Text>
          </Card>
        </View>
      </ScrollView>

      {/* create sheet */}
      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <View style={styles.backdrop}>
          <Pressable style={{ flex: 1 }} onPress={() => setOpen(false)} />
          <View style={styles.sheet}>
            <View style={styles.sheetBar} />
            <Text style={styles.sheetTitle}>New auto-trade</Text>

            <Text style={styles.label}>Stock</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {stocks.slice(0, 12).map((s) => (
                <Pressable
                  key={s.id}
                  onPress={() => setStockId(s.id)}
                  style={[styles.stockChip, stockId === s.id && styles.stockChipActive]}
                >
                  <Text style={[styles.stockChipText, stockId === s.id && { color: C.white }]}>
                    {s.ticker}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            <Text style={styles.label}>When the price</Text>
            <View style={styles.trigRow}>
              {(['above', 'below'] as const).map((d) => (
                <Pressable
                  key={d}
                  onPress={() => setTrigger(d)}
                  style={[styles.trigChip, trigger === d && styles.trigChipActive]}
                >
                  <Ionicons
                    name={d === 'above' ? 'trending-up' : 'trending-down'}
                    size={15}
                    color={trigger === d ? C.white : C.ink2}
                  />
                  <Text style={[styles.trigText, trigger === d && { color: C.white }]}>
                    {d === 'above' ? 'Rises above' : 'Falls below'}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.label}>Trigger price (₦)</Text>
            <TextInput
              value={price}
              onChangeText={(t) => setPrice(t.replace(/[^\d.]/g, ''))}
              placeholder={selected ? String(selected.price) : '0.00'}
              keyboardType="decimal-pad"
              placeholderTextColor={C.faint}
              style={styles.input}
            />

            <Text style={styles.label}>Then</Text>
            <View style={styles.trigRow}>
              {(['Buy', 'Sell'] as const).map((sd) => (
                <Pressable
                  key={sd}
                  onPress={() => setSide(sd)}
                  style={[
                    styles.trigChip,
                    side === sd && (sd === 'Buy' ? styles.buyActive : styles.sellActive),
                  ]}
                >
                  <Ionicons
                    name={sd === 'Buy' ? 'add' : 'remove'}
                    size={15}
                    color={side === sd ? C.white : C.ink2}
                  />
                  <Text style={[styles.trigText, side === sd && { color: C.white }]}>{sd}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.label}>Quantity (shares)</Text>
            <TextInput
              value={qty}
              onChangeText={(t) => setQty(t.replace(/\D/g, ''))}
              placeholder="10"
              keyboardType="number-pad"
              placeholderTextColor={C.faint}
              style={styles.input}
            />

            {selected && q > 0 && p > 0 ? (
              <View style={styles.estBox}>
                <Ionicons name="flash" size={14} color={C.green} />
                <Text style={styles.estText}>
                  {side} {q.toLocaleString()} {selected.ticker} ≈{' '}
                  <Text style={styles.estBold}>{money(est)}</Text>
                  {side === 'Buy' ? ` · cash available ${money(cash)}` : ` · est. proceeds`}
                </Text>
              </View>
            ) : null}
            {err ? <Text style={styles.err}>{err}</Text> : null}

            <Pressable onPress={create} style={({ pressed }) => [styles.cta, pressed && { opacity: 0.9 }]}>
              <Ionicons name="flash" size={16} color={C.white} />
              <Text style={styles.ctaText}>Arm auto-trade</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.canvas },
  howRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  bolt: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: C.greenTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  howTitle: { color: C.ink, fontFamily: F.display, fontSize: 15, fontWeight: '700' },
  howSub: { color: C.muted, fontFamily: F.sans, fontSize: 12.5, lineHeight: 18, marginTop: 2 },
  exampleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: S.md,
    paddingTop: S.md,
    borderTopWidth: 1,
    borderTopColor: C.hairlineSoft,
  },
  exampleTag: {
    backgroundColor: C.greenTint,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 5,
  },
  exampleTagText: { color: C.green, fontFamily: F.sans, fontSize: 9, fontWeight: '800' },
  exampleText: { color: C.ink2, fontFamily: F.sans, fontSize: 12.5, lineHeight: 18, flex: 1 },
  ex: { color: C.green, fontWeight: '700' },
  ruleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  ruleLeft: { flexDirection: 'row', alignItems: 'center', gap: 11, flex: 1 },
  ruleTitle: { fontFamily: F.display, fontSize: 14, fontWeight: '700' },
  sideTag: { fontFamily: F.display },
  ruleSub: { color: C.ink2, fontFamily: F.sans, fontSize: 12.5, marginTop: 2, fontWeight: '600' },
  ruleMeta: { color: C.faint, fontFamily: F.sans, fontSize: 11, marginTop: 1 },
  ruleRight: { alignItems: 'center', gap: 8 },
  trash: { padding: 6 },
  addCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    borderWidth: 1.5,
    borderColor: C.hairline,
    borderStyle: 'dashed',
    borderRadius: R.lg,
    paddingVertical: S.lg,
    backgroundColor: C.white,
  },
  addText: { color: C.green, fontFamily: F.sans, fontSize: 14.5, fontWeight: '700' },
  riskCard: { backgroundColor: '#FFF9F0' },
  riskRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  riskTitle: { color: '#B07514', fontFamily: F.sans, fontSize: 13, fontWeight: '700' },
  riskText: { color: '#8A6A2E', fontFamily: F.sans, fontSize: 12, lineHeight: 18, marginTop: 6 },
  backdrop: { flex: 1, backgroundColor: 'rgba(10,25,18,0.45)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: C.white,
    borderTopLeftRadius: R.xxl,
    borderTopRightRadius: R.xxl,
    padding: S.xl,
    maxHeight: '92%',
  },
  sheetBar: {
    alignSelf: 'center',
    width: 42,
    height: 5,
    borderRadius: 3,
    backgroundColor: C.canvasAlt,
    marginBottom: S.lg,
  },
  sheetTitle: { color: C.ink, fontFamily: F.display, fontSize: 18, fontWeight: '700' },
  label: {
    color: C.ink2,
    fontFamily: F.sans,
    fontSize: 13,
    fontWeight: '600',
    marginTop: S.md,
    marginBottom: 6,
  },
  stockChip: {
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: R.pill,
    backgroundColor: C.canvas,
    borderWidth: 1,
    borderColor: C.hairline,
  },
  stockChipActive: { backgroundColor: C.green, borderColor: C.green },
  stockChipText: { color: C.ink2, fontFamily: F.sans, fontSize: 12.5, fontWeight: '600' },
  trigRow: { flexDirection: 'row', gap: 8 },
  trigChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingVertical: 11,
    borderRadius: R.md,
    backgroundColor: C.canvas,
    borderWidth: 1,
    borderColor: C.hairline,
  },
  trigChipActive: { backgroundColor: C.green, borderColor: C.green },
  buyActive: { backgroundColor: C.green, borderColor: C.green },
  sellActive: { backgroundColor: C.negative, borderColor: C.negative },
  trigText: { fontFamily: F.sans, fontSize: 13, fontWeight: '600', color: C.ink2 },
  input: {
    backgroundColor: C.canvas,
    borderWidth: 1,
    borderColor: C.hairline,
    borderRadius: R.sm,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 16,
    fontFamily: F.mono,
    color: C.ink,
  },
  estBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: C.greenTint,
    borderRadius: R.sm,
    paddingHorizontal: S.md,
    paddingVertical: 10,
    marginTop: S.md,
  },
  estText: { color: C.ink2, fontFamily: F.sans, fontSize: 12.5, flex: 1 },
  estBold: { color: C.green, fontFamily: F.mono, fontWeight: '700' },
  err: { color: C.negative, fontFamily: F.sans, fontSize: 13, marginTop: 6 },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: C.green,
    paddingVertical: 15,
    borderRadius: R.md,
    marginTop: S.lg,
  },
  ctaText: { color: C.white, fontFamily: F.sans, fontSize: 15, fontWeight: '800' },
});
