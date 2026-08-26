import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useStore } from '@/store';
import { Sheet, SheetRow, SuccessOverlay } from '@/components/Sheet';
import { Button, Chip } from '@/components/primitives';
import { BANK_ACCOUNTS, DEPOSIT_METHODS } from '@/services/wallet';
import { DEPOSIT_LIMITS } from '@/services/kyc';
import { useKyc } from '@/kyc';
import { C, F, R, S } from '@/theme';
import { money } from '@/utils';

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
  const { kyc, verified } = useKyc();
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<string>(DEPOSIT_METHODS[0].title);
  const [account, setAccount] = useState(BANK_ACCOUNTS[0]?.id ?? '');
  const [result, setResult] = useState<{
    open: boolean;
    status: 'success' | 'error';
    title: string;
    sub?: string;
  }>({ open: false, status: 'success', title: '' });

  useEffect(() => {
    if (visible) {
      setAmount('');
      setMethod(mode === 'deposit' ? DEPOSIT_METHODS[0].title : 'Bank transfer');
      setAccount(BANK_ACCOUNTS[0]?.id ?? '');
      setResult({ open: false, status: 'success', title: '' });
    }
  }, [visible, mode]);

  const amt = Number(amount) || 0;
  const isDeposit = mode === 'deposit';
  const primary = isDeposit ? C.green : C.negative;

  // deposit fee preview (gateway pricing)
  const fee =
    method === 'Debit card' && amt > 0
      ? Math.min(amt * 0.015 + (amt < 2500 ? 0 : 100), 2000)
      : method === 'USSD' && amt > 0
        ? amt * 0.005 + 50
        : 0;

  const limit = DEPOSIT_LIMITS[verified ? 3 : kyc.bvnVerified ? 2 : 1];
  const selected = BANK_ACCOUNTS.find((a) => a.id === account);

  const confirm = () => {
    if (!isDeposit && !selected) {
      setResult({
        open: true,
        status: 'error',
        title: 'No bank account',
        sub: 'Add a bank account first',
      });
      return;
    }
    const res = isDeposit ? store.deposit(amt) : store.withdraw(amt);
    if (res.ok) {
      setResult({
        open: true,
        status: 'success',
        title: isDeposit ? 'Deposit complete!' : 'Withdrawal sent!',
        sub: isDeposit
          ? `${money(amt)} · ${method}`
          : `${money(amt)} · ${selected?.bankName ?? ''} ···${selected?.accountNumber.slice(-4)}`,
      });
    } else {
      setResult({
        open: true,
        status: 'error',
        title: isDeposit ? 'Deposit failed' : 'Withdrawal failed',
        sub: res.msg,
      });
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
        {isDeposit && !verified ? (
          <View style={styles.limitRow}>
            <Ionicons name="information-circle-outline" size={13} color="#F6A623" />
            <Text style={styles.limitText}>
              Deposit limit {money(limit)} — complete KYC to raise it
            </Text>
          </View>
        ) : null}
      </View>

      <Text style={styles.fieldLabel}>Amount</Text>
      <View style={styles.amountBox}>
        <Text style={styles.naira}>₦</Text>
        <TextInput
          value={amount}
          onChangeText={(t) => setAmount(t.replace(/[^\d.]/g, ''))}
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

      {isDeposit ? (
        <>
          <Text style={[styles.fieldLabel, { marginTop: S.md }]}>Method</Text>
          <View style={{ gap: 8, marginTop: 4 }}>
            {DEPOSIT_METHODS.map((m) => {
              const active = method === m.title;
              return (
                <Pressable
                  key={m.id}
                  onPress={() => setMethod(m.title)}
                  style={[styles.methodCard, active && styles.methodCardActive]}
                >
                  <View style={[styles.methodIcon, { backgroundColor: `${m.color}16` }]}>
                    <Ionicons name={m.icon as never} size={17} color={m.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.methodTitle}>{m.title}</Text>
                    <Text style={styles.methodSub}>{m.sub}</Text>
                  </View>
                  <View style={[styles.radio, active && styles.radioActive]}>
                    {active ? <View style={styles.radioDot} /> : null}
                  </View>
                </Pressable>
              );
            })}
          </View>
        </>
      ) : (
        <>
          <Text style={[styles.fieldLabel, { marginTop: S.md }]}>To bank account</Text>
          <View style={{ gap: 8, marginTop: 4 }}>
            {BANK_ACCOUNTS.map((a) => {
              const active = account === a.id;
              return (
                <Pressable
                  key={a.id}
                  onPress={() => setAccount(a.id)}
                  style={[styles.methodCard, active && styles.methodCardActive]}
                >
                  <View style={[styles.methodIcon, { backgroundColor: C.greenTint }]}>
                    <Ionicons name="business" size={16} color={C.green} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.methodTitle}>{a.bankName}</Text>
                    <Text style={styles.methodSub}>
                      {a.accountNumber} · {a.accountName}
                    </Text>
                  </View>
                  <View style={[styles.radio, active && styles.radioActive]}>
                    {active ? <View style={styles.radioDot} /> : null}
                  </View>
                </Pressable>
              );
            })}
          </View>
        </>
      )}

      <View style={styles.summary}>
        <SheetRow
          label={isDeposit ? 'Method' : 'Destination'}
          value={isDeposit ? method : selected ? `${selected.bankName} ····${selected.accountNumber.slice(-4)}` : '—'}
        />
        {isDeposit && fee > 0 ? <SheetRow label="Gateway fee" value={money(fee)} /> : null}
        {isDeposit ? (
          <SheetRow
            label="Total charged"
            value={money(amt + fee)}
            valueColor={primary}
          />
        ) : (
          <SheetRow label="You send" value={money(amt)} valueColor={primary} />
        )}
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
      <Text style={styles.demoNote}>
        Demo transaction — no real money is moved. Fees shown match live gateway pricing.
      </Text>
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
  limitRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 8 },
  limitText: { color: '#F6A623', fontFamily: F.sans, fontSize: 11.5, fontWeight: '600' },
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
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    borderWidth: 1,
    borderColor: C.hairline,
    borderRadius: R.md,
    padding: S.md,
    backgroundColor: C.white,
  },
  methodCardActive: { borderColor: C.green, backgroundColor: C.greenTint },
  methodIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodTitle: { color: C.ink, fontFamily: F.sans, fontSize: 13.5, fontWeight: '700' },
  methodSub: { color: C.muted, fontFamily: F.sans, fontSize: 11, marginTop: 1 },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: C.hairline,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: { borderColor: C.green },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: C.green },
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
});
