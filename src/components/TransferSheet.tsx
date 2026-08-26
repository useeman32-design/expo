import { useEffect, useState } from 'react';
import { Pressable, Share, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useStore } from '@/store';
import { Sheet, SheetRow, SuccessOverlay } from '@/components/Sheet';
import { Button, Chip } from '@/components/primitives';
import { BANK_ACCOUNTS, DEPOSIT_METHODS } from '@/services/wallet';
import { DEPOSIT_LIMITS } from '@/services/kyc';
import { useKyc } from '@/kyc';
import { C, F, R, S } from '@/theme';
import { money } from '@/utils';

/** USSD short codes per bank (Flutterwave-style merchant billing). */
const USSD_BANKS = [
  { name: 'GTBank', code: '737' },
  { name: 'UBA', code: '919' },
  { name: 'Zenith', code: '966' },
  { name: 'Access', code: '901' },
  { name: 'First Bank', code: '894' },
  { name: 'Stanbic', code: '909' },
];

/** Virtual account shown for the bank-transfer channel (Monnify-style). */
const VIRTUAL_ACCOUNT = {
  bank: 'Wema Bank',
  number: '2030456711',
  name: 'STOCKSX/USMAN ABDULLAHI',
};

function formatCardNumber(digits: string): string {
  const d = digits.replace(/\D/g, '').slice(0, 19);
  return d.replace(/(.{4})/g, '$1 ').trim();
}

function formatExpiry(digits: string): string {
  const d = digits.replace(/\D/g, '').slice(0, 4);
  if (d.length <= 2) return d;
  return `${d.slice(0, 2)}/${d.slice(2)}`;
}

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
  const [method, setMethod] = useState<string>(DEPOSIT_METHODS[0].id);
  const [account, setAccount] = useState(BANK_ACCOUNTS[0]?.id ?? '');
  const [cardNum, setCardNum] = useState('');
  const [cardExp, setCardExp] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [ussdBank, setUssdBank] = useState(USSD_BANKS[0].name);
  const [result, setResult] = useState<{
    open: boolean;
    status: 'success' | 'error';
    title: string;
    sub?: string;
  }>({ open: false, status: 'success', title: '' });

  useEffect(() => {
    if (visible) {
      setAmount('');
      setMethod(mode === 'deposit' ? DEPOSIT_METHODS[0].id : 'transfer');
      setAccount(BANK_ACCOUNTS[0]?.id ?? '');
      setCardNum('');
      setCardExp('');
      setCardCvv('');
      setUssdBank(USSD_BANKS[0].name);
      setResult({ open: false, status: 'success', title: '' });
    }
  }, [visible, mode]);

  const amt = Number(amount) || 0;
  const isDeposit = mode === 'deposit';
  const primary = isDeposit ? C.green : C.negative;
  const methodMeta = DEPOSIT_METHODS.find((m) => m.id === method);
  const methodTitle = isDeposit ? (methodMeta?.title ?? '') : 'Bank transfer';

  // deposit fee preview (gateway pricing)
  const fee =
    method === 'card' && amt > 0
      ? Math.min(amt * 0.015 + (amt < 2500 ? 0 : 100), 2000)
      : method === 'ussd' && amt > 0
        ? amt * 0.005 + 50
        : 0;

  const limit = DEPOSIT_LIMITS[verified ? 3 : kyc.bvnVerified ? 2 : 1];
  const selected = BANK_ACCOUNTS.find((a) => a.id === account);

  const ussdCode = `*${USSD_BANKS.find((b) => b.name === usdBankSafe(ussdBank))?.code ?? '737'}*${
    amt > 0 ? amt : 'AMOUNT'
  }*0000001234#`;

  const shareUssd = async () => {
    try {
      await Share.share({ message: `StocksX deposit code: ${ussdCode}` });
    } catch {
      /* share unavailable — the code is selectable above */
    }
  };

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
    if (isDeposit && method === 'card') {
      const digits = cardNum.replace(/\D/g, '');
      if (digits.length < 16) {
        setResult({
          open: true,
          status: 'error',
          title: 'Check your card',
          sub: 'Enter the full 16-digit card number',
        });
        return;
      }
      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(cardExp)) {
        setResult({
          open: true,
          status: 'error',
          title: 'Check expiry date',
          sub: 'Enter it as MM/YY',
        });
        return;
      }
      if (cardCvv.length < 3) {
        setResult({
          open: true,
          status: 'error',
          title: 'Check CVV',
          sub: 'The 3 digits on the back of your card',
        });
        return;
      }
    }
    const res = isDeposit ? store.deposit(amt) : store.withdraw(amt);
    if (res.ok) {
      setResult({
        open: true,
        status: 'success',
        title: isDeposit ? 'Deposit complete!' : 'Withdrawal sent!',
        sub: isDeposit
          ? `${money(amt)} · ${methodTitle}`
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
      footer={
        <View>
          <Button
            label={isDeposit ? 'Deposit funds' : 'Withdraw funds'}
            variant={isDeposit ? 'primary' : 'danger'}
            block
            onPress={confirm}
            style={{ backgroundColor: primary, borderColor: primary }}
          />
          <Text style={styles.demoNote}>
            Demo transaction — no real money is moved. Fees shown match live gateway pricing.
          </Text>
        </View>
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
          <Text style={[styles.fieldLabel, { marginTop: S.sm + 2 }]}>Method</Text>
          <View style={{ gap: 6, marginTop: 2 }}>
            {DEPOSIT_METHODS.map((m) => {
              const active = method === m.id;
              return (
                <Pressable
                  key={m.id}
                  onPress={() => setMethod(m.id)}
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

          {/* ---- card details ---- */}
          {method === 'card' ? (
            <View style={styles.subForm}>
              <Text style={styles.subFormTitle}>
                <Ionicons name="lock-closed-outline" size={12} color={C.muted} /> Card details
              </Text>
              <TextInput
                value={cardNum}
                onChangeText={(t) => setCardNum(formatCardNumber(t))}
                keyboardType="number-pad"
                placeholder="0000 0000 0000 0000"
                placeholderTextColor={C.faint}
                style={styles.cardInput}
              />
              <View style={styles.cardRow}>
                <TextInput
                  value={cardExp}
                  onChangeText={(t) => setCardExp(formatExpiry(t))}
                  keyboardType="number-pad"
                  placeholder="MM/YY"
                  placeholderTextColor={C.faint}
                  style={[styles.cardInput, { flex: 1 }]}
                />
                <TextInput
                  value={cardCvv}
                  onChangeText={(t) => setCardCvv(t.replace(/\D/g, '').slice(0, 4))}
                  keyboardType="number-pad"
                  placeholder="CVV"
                  placeholderTextColor={C.faint}
                  style={[styles.cardInput, { flex: 1 }]}
                  secureTextEntry
                />
              </View>
              <Text style={styles.subFormHint}>
                Verve, Mastercard & Visa accepted. Details are tokenized — StocksX never stores
                your PIN.
              </Text>
            </View>
          ) : null}

          {/* ---- USSD ---- */}
          {method === 'ussd' ? (
            <View style={styles.subForm}>
              <Text style={styles.subFormTitle}>Choose your bank</Text>
              <View style={styles.ussdBanks}>
                {USSD_BANKS.map((b) => {
                  const active = ussdBank === b.name;
                  return (
                    <Pressable
                      key={b.name}
                      onPress={() => setUssdBank(b.name)}
                      style={[styles.ussdChip, active && styles.ussdChipActive]}
                    >
                      <Text style={[styles.ussdChipText, active && { color: C.white }]}>
                        {b.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              <Text style={styles.subFormTitle}>Dial this code</Text>
              <View style={styles.ussdBox}>
                <Text selectable style={styles.ussdCode}>
                  {ussdCode}
                </Text>
                <Pressable onPress={shareUssd} style={styles.ussdShare}>
                  <Ionicons name="share-social-outline" size={15} color={C.green} />
                  <Text style={styles.ussdShareText}>Share</Text>
                </Pressable>
              </View>
              <Text style={styles.subFormHint}>
                Dial the code on the phone number linked to your {ussdBank} account, then approve
                with your PIN. Your wallet is credited in seconds.
              </Text>
            </View>
          ) : null}

          {/* ---- bank transfer ---- */}
          {method === 'transfer' ? (
            <View style={styles.subForm}>
              <Text style={styles.subFormTitle}>Transfer to this account</Text>
              <View style={styles.vaBox}>
                <Text style={styles.vaName}>{VIRTUAL_ACCOUNT.name}</Text>
                <Text selectable style={styles.vaNumber}>
                  {VIRTUAL_ACCOUNT.number}
                </Text>
                <Text style={styles.vaBank}>{VIRTUAL_ACCOUNT.bank}</Text>
              </View>
              <Text style={styles.subFormHint}>
                Send the exact amount — deposits reflect automatically in about 5 minutes. This
                account is unique to you.
              </Text>
            </View>
          ) : null}
        </>
      ) : (
        <>
          <Text style={[styles.fieldLabel, { marginTop: S.sm + 2 }]}>To bank account</Text>
          <View style={{ gap: 6, marginTop: 2 }}>
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
        <SheetRow label="Method" value={isDeposit ? methodTitle : selected ? `${selected.bankName} ····${selected.accountNumber.slice(-4)}` : '—'} />
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
    </Sheet>
  );
}

// guard for persisted odd states (never happens in practice)
function usdBankSafe(name: string): string {
  return USSD_BANKS.some((b) => b.name === name) ? name : USSD_BANKS[0].name;
}

const styles = StyleSheet.create({
  balanceBox: {
    backgroundColor: C.canvas,
    borderRadius: R.lg,
    paddingVertical: S.sm + 2,
    paddingHorizontal: S.lg,
    alignItems: 'center',
    marginBottom: S.sm,
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
    fontSize: 20,
    fontWeight: '800',
    marginTop: 1,
  },
  limitRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 5 },
  limitText: { color: '#F6A623', fontFamily: F.sans, fontSize: 11, fontWeight: '600' },
  fieldLabel: {
    color: C.muted,
    fontFamily: F.sans,
    fontSize: 12.5,
    fontWeight: '600',
    marginBottom: 5,
  },
  amountBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.canvas,
    borderWidth: 1,
    borderColor: C.hairline,
    borderRadius: R.md,
    height: 54,
  },
  naira: { color: C.muted, fontFamily: F.sans, fontSize: 20, fontWeight: '800', marginRight: 8 },
  amountInput: {
    fontFamily: F.mono,
    fontSize: 23,
    fontWeight: '800',
    color: C.ink,
    minWidth: 120,
    textAlign: 'center',
  },
  quickRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 0, marginTop: 6 },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: C.hairline,
    borderRadius: R.md,
    paddingVertical: 8,
    paddingHorizontal: S.sm + 2,
    backgroundColor: C.white,
  },
  methodCardActive: { borderColor: C.green, backgroundColor: C.greenTint },
  methodIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodTitle: { color: C.ink, fontFamily: F.sans, fontSize: 13, fontWeight: '700' },
  methodSub: { color: C.muted, fontFamily: F.sans, fontSize: 10.5, marginTop: 1 },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: C.hairline,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: { borderColor: C.green },
  radioDot: { width: 9, height: 9, borderRadius: 4.5, backgroundColor: C.green },
  subForm: { marginTop: S.md },
  subFormTitle: {
    color: C.ink2,
    fontFamily: F.sans,
    fontSize: 12.5,
    fontWeight: '700',
    marginBottom: 6,
  },
  cardInput: {
    backgroundColor: C.canvas,
    borderWidth: 1,
    borderColor: C.hairline,
    borderRadius: R.sm,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 15,
    fontFamily: F.mono,
    color: C.ink,
    marginBottom: 8,
  },
  cardRow: { flexDirection: 'row', gap: 8 },
  subFormHint: {
    color: C.faint,
    fontFamily: F.sans,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 2,
  },
  ussdBanks: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: S.md },
  ussdChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: R.pill,
    backgroundColor: C.canvas,
    borderWidth: 1,
    borderColor: C.hairline,
  },
  ussdChipActive: { backgroundColor: C.green, borderColor: C.green },
  ussdChipText: { color: C.ink2, fontFamily: F.sans, fontSize: 12, fontWeight: '600' },
  ussdBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1.5,
    borderColor: C.green,
    borderStyle: 'dashed',
    borderRadius: R.md,
    backgroundColor: C.greenTint,
    paddingHorizontal: S.md,
    paddingVertical: 12,
  },
  ussdCode: { flex: 1, color: C.greenDark, fontFamily: F.mono, fontSize: 16, fontWeight: '800' },
  ussdShare: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ussdShareText: { color: C.green, fontFamily: F.sans, fontSize: 12.5, fontWeight: '700' },
  vaBox: {
    alignItems: 'center',
    backgroundColor: C.canvas,
    borderWidth: 1,
    borderColor: C.hairline,
    borderRadius: R.md,
    paddingVertical: S.md,
    gap: 3,
  },
  vaName: { color: C.muted, fontFamily: F.sans, fontSize: 11, fontWeight: '600' },
  vaNumber: {
    color: C.ink,
    fontFamily: F.mono,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  vaBank: { color: C.green, fontFamily: F.sans, fontSize: 12.5, fontWeight: '700' },
  summary: {
    backgroundColor: C.canvas,
    borderRadius: R.md,
    paddingHorizontal: S.lg,
    paddingVertical: 2,
    marginTop: S.md,
  },
  demoNote: {
    color: C.faint,
    fontFamily: F.sans,
    fontSize: 10,
    textAlign: 'center',
    marginTop: S.sm,
  },
});
