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
import { StockPicker } from '@/components/StockPicker';
import { useStore } from '@/store';
import { getStocks } from '@/services/marketData';
import { getLogo } from '@/services/logos';
import { price as fmtPrice } from '@/utils';
import { C, F, R, S } from '@/theme';

export default function AlertsScreen() {
  const router = useRouter();
  const { alerts, addAlert, removeAlert, toggleAlert } = useStore();
  const [open, setOpen] = useState(false);
  const [stockId, setStockId] = useState('mtnn');
  const [target, setTarget] = useState('');
  const [direction, setDirection] = useState<'above' | 'below'>('above');
  const [err, setErr] = useState<string | null>(null);

  const stocks = useMemo(() => getStocks(), []);
  const selected = stocks.find((s) => s.id === stockId);

  const create = () => {
    const t = parseFloat(target);
    if (!t || t <= 0) return setErr('Enter a valid target price');
    setErr(null);
    const res = addAlert(stockId, t, direction);
    if (res.ok) {
      setOpen(false);
      setTarget('');
    } else setErr(res.msg);
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 48 }}>
        <ScreenHeader title="Price Alerts" subtitle="Get notified at your price" />

        <View style={{ paddingHorizontal: S.xl, marginTop: S.sm, gap: S.sm }}>
          {alerts.length === 0 ? (
            <Card pad={S.xxl} radius={R.lg}>
              <View style={{ alignItems: 'center', gap: S.sm }}>
                <Ionicons name="notifications-off-outline" size={34} color={C.faint} />
                <Text style={styles.emptyTitle}>No alerts yet</Text>
                <Text style={styles.emptySub}>
                  Set an alert and we'll notify you the moment a stock crosses your price.
                </Text>
              </View>
            </Card>
          ) : (
            alerts.map((a) => (
              <Card key={a.id} pad={S.md} radius={R.md}>
                <View style={styles.row}>
                  <Pressable
                    onPress={() => router.push(`/stock/${a.stockId}` as never)}
                    style={styles.left}
                  >
                    <StockLogo ticker={a.ticker} color={C.green} size={38} logo={getLogo(a.stockId)} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.ticker}>{a.ticker}</Text>
                      <Text style={styles.cond}>
                        {a.direction === 'above' ? 'Rises above' : 'Falls below'}{' '}
                        {fmtPrice(a.targetPrice)}
                      </Text>
                      <Text style={styles.now}>
                        Now {fmtPrice(a.currentPrice)} · set {a.createdAt}
                      </Text>
                    </View>
                  </Pressable>
                  <View style={styles.right}>
                    <Switch
                      value={a.active}
                      onValueChange={() => toggleAlert(a.id)}
                      trackColor={{ false: C.canvasAlt, true: C.green }}
                      thumbColor={C.white}
                    />
                    <Pressable onPress={() => removeAlert(a.id)} style={styles.trash}>
                      <Ionicons name="trash-outline" size={16} color={C.negative} />
                    </Pressable>
                  </View>
                </View>
              </Card>
            ))
          )}

          <Pressable
            onPress={() => setOpen(true)}
            style={({ pressed }) => [styles.addCard, pressed && { opacity: 0.8 }]}
          >
            <Ionicons name="add-circle-outline" size={22} color={C.green} />
            <Text style={styles.addText}>Create alert</Text>
          </Pressable>
        </View>

        <View style={{ paddingHorizontal: S.xl, marginTop: S.xl }}>
          <Text style={styles.note}>
            Alerts run server-side once the live backend is connected, so they fire even when the
            app is closed (push notification).
          </Text>
        </View>
      </ScrollView>

      {/* create sheet */}
      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <View style={styles.backdrop}>
          <Pressable style={{ flex: 1 }} onPress={() => setOpen(false)} />
          <View style={styles.sheet}>
            <View style={styles.sheetBar} />
            <Text style={styles.sheetTitle}>New price alert</Text>

            <ScrollView
              bounces={false}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingBottom: S.lg }}
            >
            <Text style={styles.label}>Stock</Text>
            <StockPicker stocks={stocks} selectedId={stockId} onSelect={setStockId} previewCount={16} />

            <Text style={styles.label}>When the price</Text>
            <View style={styles.dirRow}>
              {(['above', 'below'] as const).map((d) => (
                <Pressable
                  key={d}
                  onPress={() => setDirection(d)}
                  style={[styles.dirChip, direction === d && styles.dirChipActive]}
                >
                  <Ionicons
                    name={d === 'above' ? 'trending-up' : 'trending-down'}
                    size={15}
                    color={direction === d ? C.white : C.ink2}
                  />
                  <Text style={[styles.dirText, direction === d && { color: C.white }]}>
                    {d === 'above' ? 'Rises above' : 'Falls below'}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.label}>Target price (₦)</Text>
            <TextInput
              value={target}
              onChangeText={(t) => setTarget(t.replace(/[^\d.]/g, ''))}
              placeholder={selected ? String(selected.price) : '0.00'}
              keyboardType="decimal-pad"
              placeholderTextColor={C.faint}
              style={styles.input}
            />
            {selected ? (
              <Text style={styles.nowHint}>
                {selected.ticker} currently trades at {fmtPrice(selected.price)}
              </Text>
            ) : null}
            {err ? <Text style={styles.err}>{err}</Text> : null}
            </ScrollView>

            <Pressable onPress={create} style={({ pressed }) => [styles.cta, pressed && { opacity: 0.9 }]}>
              <Text style={styles.ctaText}>Create alert</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.canvas },
  row: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  left: { flexDirection: 'row', alignItems: 'center', gap: 11, flex: 1 },
  ticker: { color: C.ink, fontFamily: F.display, fontSize: 14.5, fontWeight: '700' },
  cond: { color: C.ink2, fontFamily: F.sans, fontSize: 12.5, marginTop: 2, fontWeight: '600' },
  now: { color: C.faint, fontFamily: F.sans, fontSize: 11, marginTop: 1 },
  right: { alignItems: 'center', gap: 8 },
  trash: { padding: 6 },
  emptyTitle: { color: C.ink, fontFamily: F.sans, fontSize: 15, fontWeight: '700' },
  emptySub: { color: C.muted, fontFamily: F.sans, fontSize: 13, lineHeight: 19, textAlign: 'center' },
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
  note: { color: C.faint, fontFamily: F.sans, fontSize: 12, lineHeight: 18, textAlign: 'center' },
  backdrop: { flex: 1, backgroundColor: 'rgba(10,25,18,0.45)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: C.white,
    borderTopLeftRadius: R.xxl,
    borderTopRightRadius: R.xxl,
    padding: S.xl,
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
  dirRow: { flexDirection: 'row', gap: 8 },
  dirChip: {
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
  dirChipActive: { backgroundColor: C.green, borderColor: C.green },
  dirText: { fontFamily: F.sans, fontSize: 13, fontWeight: '600', color: C.ink2 },
  input: {
    backgroundColor: C.canvas,
    borderWidth: 1,
    borderColor: C.hairline,
    borderRadius: R.sm,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: F.mono,
    color: C.ink,
  },
  nowHint: { color: C.muted, fontFamily: F.sans, fontSize: 12, marginTop: 6 },
  err: { color: C.negative, fontFamily: F.sans, fontSize: 13, marginTop: 6 },
  cta: {
    alignItems: 'center',
    backgroundColor: C.green,
    paddingVertical: 15,
    borderRadius: R.md,
    marginTop: S.lg,
  },
  ctaText: { color: C.white, fontFamily: F.sans, fontSize: 15, fontWeight: '800' },
});
