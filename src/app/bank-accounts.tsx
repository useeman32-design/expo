import { useState } from 'react';
import {
  ActivityIndicator,
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
import { LinearGradient } from 'expo-linear-gradient';

import { Card, ScreenHeader } from '@/components/primitives';
import { BANKS, BANK_ACCOUNTS } from '@/services/wallet';
import { C, F, R, S, registerStyles, STATUSBAR } from '@/theme';
import type { BankAccount } from '@/types';

export default function BankAccountsScreen() {
  const [accounts, setAccounts] = useState<BankAccount[]>(BANK_ACCOUNTS);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [bank, setBank] = useState<typeof BANKS[number] | null>(null);
  const [accNum, setAccNum] = useState('');

  const valid = bank && /^\d{10}$/.test(accNum);

  const addAccount = async () => {
    if (!valid) return setErr('Select a bank and enter the 10-digit account number');
    setErr(null);
    setBusy(true);
    await new Promise((r) => setTimeout(r, 800)); // name lookup (NIBSS)
    setBusy(false);
    const next: BankAccount[] = [
      ...accounts.map((a) => ({ ...a, isDefault: false })),
      {
        id: `ba-${Date.now()}`,
        bankName: bank!.name,
        bankCode: bank!.code,
        accountNumber: accNum,
        accountName: 'USMAN ABDULLAHI',
        isDefault: true,
      },
    ];
    setAccounts(next);
    setOpen(false);
    setBank(null);
    setAccNum('');
  };

  const makeDefault = (id: string) =>
    setAccounts((list) => list.map((a) => ({ ...a, isDefault: a.id === id })));

  const remove = (id: string) =>
    setAccounts((list) => {
      const next = list.filter((a) => a.id !== id);
      if (next.length && !next.some((a) => a.isDefault)) next[0].isDefault = true;
      return next;
    });

  return (
    <View style={styles.screen}>
      <StatusBar style={STATUSBAR} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 48 }}>
        <ScreenHeader
          title="Bank Accounts"
          subtitle="Withdrawals are paid to accounts in your own name" showBack />

        <View style={{ paddingHorizontal: S.xl, marginTop: S.sm, gap: S.md }}>
          {accounts.map((a) => (
            <Card key={a.id} pad={S.lg} radius={R.lg}>
              <View style={styles.row}>
                <View style={styles.bankIcon}>
                  <Ionicons name="business" size={19} color={C.green} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.bankName}>{a.bankName}</Text>
                  <Text style={styles.accNum}>{a.accountNumber}</Text>
                  <Text style={styles.accName}>{a.accountName}</Text>
                </View>
                <Pressable onPress={() => remove(a.id)} style={styles.trash}>
                  <Ionicons name="trash-outline" size={17} color={C.negative} />
                </Pressable>
              </View>
              <View style={styles.defaultRow}>
                <Text style={styles.defaultLabel}>Default for withdrawals</Text>
                <Switch
                  value={a.isDefault}
                  onValueChange={() => makeDefault(a.id)}
                  trackColor={{ false: C.canvasAlt, true: C.green }}
                  thumbColor={C.white}
                />
              </View>
            </Card>
          ))}

          <Pressable
            onPress={() => setOpen(true)}
            style={({ pressed }) => [styles.addCard, pressed && { opacity: 0.8 }]}
          >
            <Ionicons name="add-circle-outline" size={22} color={C.green} />
            <Text style={styles.addText}>Add bank account</Text>
          </Pressable>
        </View>

        <View style={{ paddingHorizontal: S.xl, marginTop: S.xl }}>
          <Text style={styles.note}>
            For your security, withdrawals can only be sent to an account whose name matches your
            verified KYC name.
          </Text>
        </View>
      </ScrollView>

      {/* add sheet */}
      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <View style={styles.sheetBackdrop}>
          <Pressable style={{ flex: 1 }} onPress={() => setOpen(false)} />
          <View style={styles.sheet}>
            <View style={styles.sheetBar} />
            <Text style={styles.sheetTitle}>Add bank account</Text>

            <Text style={styles.label}>Bank</Text>
            <ScrollView style={styles.bankList} nestedScrollEnabled>
              {BANKS.map((b) => (
                <Pressable
                  key={b.code}
                  onPress={() => setBank(b)}
                  style={[styles.bankRow, bank?.code === b.code && styles.bankRowActive]}
                >
                  <Text
                    style={[styles.bankRowText, bank?.code === b.code && { color: C.green, fontWeight: '700' }]}
                  >
                    {b.name}
                  </Text>
                  {bank?.code === b.code ? (
                    <Ionicons name="checkmark" size={16} color={C.green} />
                  ) : null}
                </Pressable>
              ))}
            </ScrollView>

            <Text style={styles.label}>Account number</Text>
            <TextInput
              value={accNum}
              onChangeText={(t) => setAccNum(t.replace(/\D/g, '').slice(0, 10))}
              placeholder="0123456789"
              keyboardType="number-pad"
              placeholderTextColor={C.faint}
              style={styles.input}
            />
            {valid && <Text style={styles.lookup}>✓ USMAN ABDULLAHI — name verified</Text>}
            {err ? <Text style={styles.err}>{err}</Text> : null}

            <Pressable onPress={addAccount} disabled={busy} style={{ marginTop: S.lg }}>
              <LinearGradient
                colors={[C.hero1, C.hero2]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.cta}
              >
                {busy ? (
                  <ActivityIndicator color={C.white} size="small" />
                ) : (
                  <Text style={styles.ctaText}>Save account</Text>
                )}
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const makeStyles = () => StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.canvas },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  bankIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: C.greenTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bankName: { color: C.ink, fontFamily: F.sans, fontSize: 14.5, fontWeight: '700' },
  accNum: { color: C.ink2, fontFamily: F.mono, fontSize: 13.5, marginTop: 2, fontWeight: '600' },
  accName: { color: C.muted, fontFamily: F.sans, fontSize: 11.5, marginTop: 1 },
  trash: { padding: 8 },
  defaultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: S.md,
    paddingTop: S.md,
    borderTopWidth: 1,
    borderTopColor: C.hairlineSoft,
  },
  defaultLabel: { color: C.muted, fontFamily: F.sans, fontSize: 13 },
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
    backgroundColor: C.surface,
  },
  addText: { color: C.green, fontFamily: F.sans, fontSize: 14.5, fontWeight: '700' },
  note: { color: C.faint, fontFamily: F.sans, fontSize: 12, lineHeight: 18, textAlign: 'center' },
  sheetBackdrop: { flex: 1, backgroundColor: 'rgba(10,25,18,0.45)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: C.surface,
    borderTopLeftRadius: R.xxl,
    borderTopRightRadius: R.xxl,
    padding: S.xl,
    maxHeight: '88%',
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
  bankList: {
    borderWidth: 1,
    borderColor: C.hairline,
    borderRadius: R.sm,
    maxHeight: 170,
    backgroundColor: C.canvas,
  },
  bankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: C.hairlineSoft,
  },
  bankRowActive: { backgroundColor: C.greenTint },
  bankRowText: { color: C.ink2, fontFamily: F.sans, fontSize: 13.5 },
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
  lookup: { color: C.green, fontFamily: F.sans, fontSize: 12.5, marginTop: 6, fontWeight: '600' },
  err: { color: C.negative, fontFamily: F.sans, fontSize: 13, marginTop: 6 },
  cta: { alignItems: 'center', paddingVertical: 15, borderRadius: R.md },
  ctaText: { color: C.white, fontFamily: F.sans, fontSize: 15, fontWeight: '800' },
});
let styles = makeStyles();
registerStyles(() => { styles = makeStyles(); });
