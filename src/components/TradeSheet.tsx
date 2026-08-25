import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import type { OrderSide, Stock } from '@/types';
import { useStore } from '@/store';
import { getLogo } from '@/services/logos';
import { Sheet, SheetRow, SuccessOverlay } from '@/components/Sheet';
import { Button, Chip, StockLogo } from '@/components/primitives';
import { C, F, R, S } from '@/theme';
import { money, price } from '@/utils';

export function TradeSheet({
  visible,
  onClose,
  stock,
  initialSide = 'Buy',
}: {
  visible: boolean;
  onClose: () => void;
  stock: Stock | null;
  initialSide?: OrderSide;
}) {
  const store = useStore();
  const [side, setSide] = useState<OrderSide>(initialSide);
  const [type, setType] = useState<'Market' | 'Limit'>('Market');
  const [qty, setQty] = useState('1');
  const [limit, setLimit] = useState('');
  const [result, setResult] = useState<{
    open: boolean;
    status: 'success' | 'error';
    title: string;
    sub?: string;
  }>({ open: false, status: 'success', title: '' });

  useEffect(() => {
    if (visible) {
      setSide(initialSide);
      setType('Market');
      setQty('1');
      setLimit(stock ? String(stock.price) : '');
      setResult({ open: false, status: 'success', title: '' });
    }
  }, [visible, initialSide, stock]);

  if (!stock) return null;
  const cur = stock.currency === 'NGN' ? '₦' : '$';
  const execPrice = type === 'Limit' && limit ? Number(limit) || 0 : stock.price;
  const n = parseInt(qty, 10) || 0;
  const total = n * execPrice;
  const holding = store.holdings.find((h) => h.stockId === stock.id);

  const setQtyN = (v: number) => setQty(String(Math.max(0, v)));

  const confirm = () => {
    const res =
      side === 'Buy'
        ? store.buy(stock.id, n, execPrice)
        : store.sell(stock.id, n, execPrice);
    if (res.ok) {
      setResult({
        open: true,
        status: 'success',
        title: side === 'Buy' ? 'Order filled!' : 'Order sold!',
        sub: `${n} ${stock.ticker} · ${money(total, cur)}`,
      });
    } else {
      setResult({ open: true, status: 'error', title: 'Order failed', sub: res.msg });
    }
  };

  const primary = side === 'Buy' ? C.green : C.negative;

  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title={side === 'Buy' ? 'Buy' : 'Sell'}
      overlay={
        <SuccessOverlay
          visible={result.open}
          status={result.status}
          title={result.title}
          subtitle={result.sub}
          onDone={() => {
            setResult({ open: false, status: 'success', title: '' });
            onClose();
          }}
        />
      }
    >
      {/* stock header */}
      <View style={styles.stockHead}>
        <StockLogo ticker={stock.ticker} color={stock.color} size={44} logo={getLogo(stock.id)} />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.ticker}>{stock.ticker}</Text>
          <Text style={styles.name} numberOfLines={1}>
            {stock.name}
          </Text>
        </View>
        <Text style={styles.sPrice}>{price(stock.price, cur)}</Text>
      </View>

      {/* side toggle */}
      <View style={styles.seg}>
        <Pressable
          onPress={() => setSide('Buy')}
          style={[styles.segItem, side === 'Buy' && { backgroundColor: C.green }]}
        >
          <Text style={[styles.segText, side === 'Buy' && { color: C.white }]}>Buy</Text>
        </Pressable>
        <Pressable
          onPress={() => setSide('Sell')}
          style={[styles.segItem, side === 'Sell' && { backgroundColor: C.negative }]}
        >
          <Text style={[styles.segText, side === 'Sell' && { color: C.white }]}>Sell</Text>
        </Pressable>
      </View>

      {/* order type */}
      <View style={styles.field}>
        <Text style={styles.fieldLabel}>Order type</Text>
        <View style={styles.chips}>
          <Chip label="Market" active={type === 'Market'} onPress={() => setType('Market')} />
          <Chip label="Limit" active={type === 'Limit'} onPress={() => setType('Limit')} />
        </View>
      </View>

      {/* quantity */}
      <View style={styles.field}>
        <Text style={styles.fieldLabel}>Quantity</Text>
        <View style={styles.qtyRow}>
          <Pressable onPress={() => setQtyN(n - 1)} style={styles.qtyBtn}>
            <Ionicons name="remove" size={20} color={C.ink} />
          </Pressable>
          <TextInput
            value={qty}
            onChangeText={setQty}
            keyboardType="numeric"
            style={styles.qtyInput}
          />
          <Pressable onPress={() => setQtyN(n + 1)} style={styles.qtyBtn}>
            <Ionicons name="add" size={20} color={C.ink} />
          </Pressable>
        </View>
        <View style={[styles.chips, { marginTop: 8 }]}>
          {[1, 5, 10, 50].map((q) => (
            <Chip key={q} label={`${q}`} active={n === q} onPress={() => setQty(String(q))} />
          ))}
        </View>
      </View>

      {/* limit price */}
      {type === 'Limit' ? (
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Limit price</Text>
          <View style={styles.inputBox}>
            <Text style={styles.cur}>{cur}</Text>
            <TextInput
              value={limit}
              onChangeText={setLimit}
              keyboardType="numeric"
              style={styles.input}
              placeholder="0.00"
              placeholderTextColor={C.faint}
            />
          </View>
        </View>
      ) : null}

      {/* summary */}
      <View style={styles.summary}>
        <SheetRow label="Price per share" value={price(execPrice, cur)} />
        <SheetRow label="Quantity" value={`${n}`} />
        <SheetRow label="Estimated total" value={money(total, cur)} valueColor={primary} />
        <SheetRow
          label={side === 'Buy' ? 'Available cash' : `Your shares (${holding?.shares ?? 0})`}
          value={side === 'Buy' ? money(store.cash, cur) : `${holding?.shares ?? 0}`}
        />
      </View>

      <View style={{ marginTop: S.md }}>
        <Button
          label={`Confirm ${side} · ${money(total, cur)}`}
          variant={side === 'Buy' ? 'primary' : 'danger'}
          block
          onPress={confirm}
          style={{ backgroundColor: primary, borderColor: primary }}
        />
      </View>
      <Text style={styles.demoNote}>Demo trade — no real money is moved.</Text>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  stockHead: { flexDirection: 'row', alignItems: 'center', marginBottom: S.md },
  ticker: { color: C.ink, fontFamily: F.sans, fontSize: 17, fontWeight: '800' },
  name: { color: C.muted, fontFamily: F.sans, fontSize: 12.5 },
  sPrice: { color: C.ink, fontFamily: F.mono, fontSize: 17, fontWeight: '800' },
  seg: {
    flexDirection: 'row',
    backgroundColor: C.canvasAlt,
    borderRadius: R.md,
    padding: 4,
    marginBottom: S.md,
  },
  segItem: { flex: 1, paddingVertical: 11, borderRadius: R.sm, alignItems: 'center' },
  segText: { fontFamily: F.sans, fontSize: 14, fontWeight: '700', color: C.muted },
  field: { marginBottom: S.md },
  fieldLabel: {
    color: C.muted,
    fontFamily: F.sans,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  chips: { flexDirection: 'row' },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  qtyBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: C.canvasAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyInput: {
    flex: 1,
    textAlign: 'center',
    fontFamily: F.mono,
    fontSize: 18,
    fontWeight: '800',
    color: C.ink,
    backgroundColor: C.canvas,
    borderRadius: R.md,
    height: 48,
    borderWidth: 1,
    borderColor: C.hairline,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.canvas,
    borderWidth: 1,
    borderColor: C.hairline,
    borderRadius: R.md,
    paddingHorizontal: 14,
    height: 48,
  },
  cur: { color: C.muted, fontFamily: F.sans, fontSize: 16, fontWeight: '700', marginRight: 6 },
  input: { flex: 1, fontFamily: F.mono, fontSize: 16, color: C.ink },
  summary: {
    backgroundColor: C.canvas,
    borderRadius: R.lg,
    paddingHorizontal: S.lg,
    paddingVertical: 4,
  },
  demoNote: {
    color: C.faint,
    fontFamily: F.sans,
    fontSize: 11,
    textAlign: 'center',
    marginTop: S.md,
  },
  errText: {
    color: C.negative,
    fontFamily: F.sans,
    fontSize: 12.5,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: S.sm,
  },
});
