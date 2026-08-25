import { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { useStore } from '@/store';
import { Sheet, SheetRow, SuccessOverlay } from '@/components/Sheet';
import { Button, Chip } from '@/components/primitives';
import { C, F, R, S } from '@/theme';
import { money } from '@/utils';

const METHODS = ['Bank Transfer', 'Debit Card', 'USSD'];

export function TransferSheet({
  visible,
  onClose,
  mode = 'deposit',
}: {
  visible: boolean;
  onClose: () => void;
  mode?: 'deposit' | 'withdraw';
}) {
  const store = useStore();
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState(METHODS[0]);
  const [result, setResult] = useState<{
    open: boolean;
    status: 'success' | 'error';
    title: string;
    sub?: string;
  }>({ open: false, status: 'success', title: '' });

  useEffect(() => {
    if (visible) {
      setAmount('');
      setMethod(METHODS[0]);
      setResult({ open: false, status: 'success', title: '' });
    }
  }, [visible]);

  const amt = Number(amount) || 0;
  const isDeposit = mode === 'deposit';
  const primary = isDeposit ? C.green : C.negative;

  const confirm = () => {
    const res = isDeposit ? store.deposit(amt) : store.withdraw(amt);
    if (res.ok) {
      setResult({
        open: true,
        status: 'success',
        title: isDeposit ? 'Deposit complete!' : 'Withdrawal sent!',
        sub: `${money(amt)} · ${method}`,
      });
    } else {
      setResult({ open: true, status: 'error', title: isDeposit ? 'Deposit failed' : 'Withdrawal failed', sub: res.msg });
    }
  };

  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title={isDeposit ? 'Deposit' : 'Withdraw'}
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
      <View style={styles.balanceBox}>
        <Text style={styles.balanceLabel}>Available balance</Text>
        <Text style={styles.balanceValue}>{money(store.cash)}</Text>
      </View>

      <Text style={styles.fieldLabel}>Amount</Text>
      <View style={styles.amountBox}>
        <Text style={styles.naira}>₦</Text>
        <TextInput
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
          placeholder="0"
          placeholderTextColor={C.faint}
          style={styles.amountInput}
        />
      </View>
      <View style={styles.quickRow}>
        {[1000, 5000, 25000, 100000].map((q) => (
          <Chip
            key={q}
            label={`+₦${q.toLocaleString()}`}
            active={amt === q}
            onPress={() => setAmount(String(q))}
          />
        ))}
      </View>

      <Text style={[styles.fieldLabel, { marginTop: S.md }]}>Method</Text>
      <View style={styles.quickRow}>
        {METHODS.map((m) => (
          <Chip key={m} label={m} active={method === m} onPress={() => setMethod(m)} />
        ))}
      </View>

      <View style={styles.summary}>
        <SheetRow label="Method" value={method} />
        <SheetRow
          label={isDeposit ? 'You receive' : 'You send'}
          value={money(amt)}
          valueColor={primary}
        />
      </View>

      <View style={{ marginTop: S.md }}>
        <Button
          label={isDeposit ? 'Deposit funds' : 'Withdraw funds'}
          variant={isDeposit ? 'primary' : 'danger'}
          block
          onPress={confirm}
          style={{ backgroundColor: primary, borderColor: primary }}
        />
      </View>
      <Text style={styles.demoNote}>Demo transaction — no real money is moved.</Text>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  balanceBox: {
    backgroundColor: C.canvas,
    borderRadius: R.lg,
    padding: S.lg,
    alignItems: 'center',
    marginBottom: S.md,
  },
  balanceLabel: {
    color: C.muted,
    fontFamily: F.sans,
    fontSize: 13,
    fontWeight: '600',
  },
  balanceValue: {
    color: C.ink,
    fontFamily: F.mono,
    fontSize: 24,
    fontWeight: '800',
    marginTop: 2,
  },
  fieldLabel: {
    color: C.muted,
    fontFamily: F.sans,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  amountBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.canvas,
    borderWidth: 1,
    borderColor: C.hairline,
    borderRadius: R.lg,
    height: 64,
  },
  naira: { color: C.muted, fontFamily: F.sans, fontSize: 22, fontWeight: '800', marginRight: 8 },
  amountInput: {
    fontFamily: F.mono,
    fontSize: 28,
    fontWeight: '800',
    color: C.ink,
    minWidth: 120,
    textAlign: 'center',
  },
  quickRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 0, marginTop: 8 },
  summary: {
    backgroundColor: C.canvas,
    borderRadius: R.lg,
    paddingHorizontal: S.lg,
    paddingVertical: 4,
    marginTop: S.md,
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
