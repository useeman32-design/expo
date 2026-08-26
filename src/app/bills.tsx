import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import { Button, Card, ScreenHeader } from '@/components/primitives';
import { ReceiptModal } from '@/components/ReceiptModal';
import { HiddenStars } from '@/components/HiddenAmount';
import { BILL_CATEGORIES, getBillCategory, type BillCategory } from '@/services/bills';
import { useStore } from '@/store';
import type { WalletTransaction } from '@/types';
import { C, F, R, S, STATUSBAR, registerStyles } from '@/theme';
import { money } from '@/utils';

/**
 * Pay bills from the wallet: airtime, data bundles, electricity meters and
 * TV subscriptions (OPay-style). Provider catalogue is local for now; the
 * payment debits wallet cash and issues a receipt. Live aggregator wiring
 * lands with the backend.
 */
export default function BillsScreen() {
  const { cat } = useLocalSearchParams<{ cat?: string }>();
  const router = useRouter();
  const { cash, payBill, notify } = useStore();

  const [category, setCategory] = useState<BillCategory>(getBillCategory(cat).id);
  const [providerId, setProviderId] = useState('');
  const [account, setAccount] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [receipt, setReceipt] = useState<WalletTransaction | null>(null);

  const meta = getBillCategory(category);
  const provider = meta.providers.find((p) => p.id === providerId);
  const digits = account.replace(/\D/g, '');
  const amount = Number(amountStr.replace(/[^0-9.]/g, '')) || 0;
  const valid = !!provider && digits.length >= meta.fieldMinDigits && amount >= meta.min;

  const switchCategory = (id: BillCategory) => {
    if (id === category) return;
    setCategory(id);
    setProviderId('');
  };

  const pay = () => {
    if (!provider) return notify('Choose a provider first', 'error');
    if (digits.length < meta.fieldMinDigits)
      return notify(`Enter a valid ${meta.fieldLabel.toLowerCase()}`, 'error');
    if (amount < meta.min) return notify(`Minimum amount is ${money(meta.min)}`, 'error');
    if (amount > cash) return notify('Amount exceeds cash balance', 'error');

    const reference = `SX-BILL-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const res = payBill({
      provider: provider.name,
      label: `${meta.label} · ${provider.name}`,
      amount,
      reference,
    });
    if (!res.ok) return notify(res.msg, 'error');
    if (res.tx) setReceipt(res.tx);
    setAmountStr('');
  };

  return (
    <View style={styles.screen}>
      <StatusBar style={STATUSBAR} />
      <ScreenHeader title="Pay Bills" subtitle="Airtime, data, electricity & TV" showBack />

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: S.xl, paddingBottom: 120 }}
      >
        {/* category switcher */}
        <View style={styles.catRow}>
          {BILL_CATEGORIES.map((c) => {
            const active = c.id === category;
            return (
              <Pressable
                key={c.id}
                onPress={() => switchCategory(c.id)}
                style={({ pressed }) => [styles.catChip, active && styles.catChipActive, pressed && { opacity: 0.8 }]}
                accessibilityLabel={`Switch to ${c.label}`}
              >
                <Ionicons name={c.icon as never} size={15} color={active ? C.white : C.muted} />
                <Text style={[styles.catChipText, active && styles.catChipTextActive]}>{c.label}</Text>
              </Pressable>
            );
          })}
        </View>

        {/* provider grid */}
        <View style={{ marginTop: S.lg }}>
          <Text style={styles.blockLabel}>SELECT PROVIDER</Text>
          <View style={styles.providerGrid}>
            {meta.providers.map((p) => {
              const active = p.id === providerId;
              return (
                <Pressable
                  key={p.id}
                  onPress={() => setProviderId(p.id)}
                  style={({ pressed }) => [styles.providerCard, active && { borderColor: meta.accent }, pressed && { opacity: 0.85 }]}
                  accessibilityLabel={`Select ${p.name}`}
                >
                  <View style={styles.providerTop}>
                    <View style={[styles.providerDot, { backgroundColor: active ? meta.accent : C.faint }]} />
                    <View style={{ flex: 1 }} />
                    <Ionicons
                      name={active ? 'checkmark-circle' : 'ellipse-outline'}
                      size={19}
                      color={active ? meta.accent : C.faint}
                    />
                  </View>
                  <Text style={[styles.providerName, active && { color: C.ink }]}>{p.name}</Text>
                  {p.tag ? <Text style={styles.providerTag}>{p.tag}</Text> : null}
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* account + amount */}
        <Card pad={S.lg} style={{ marginTop: S.lg }}>
          <Text style={styles.fieldLabel}>{meta.fieldLabel.toUpperCase()}</Text>
          <View style={styles.inputWrap}>
            <Ionicons name={meta.fieldIcon as never} size={17} color={C.muted} />
            <TextInput
              value={account}
              onChangeText={setAccount}
              placeholder={meta.fieldPlaceholder}
              placeholderTextColor={C.faint}
              keyboardType="number-pad"
              autoCorrect={false}
              style={styles.input}
            />
          </View>

          <Text style={[styles.fieldLabel, { marginTop: S.lg }]}>AMOUNT</Text>
          <View style={styles.amountWrap}>
            <Text style={styles.amountCurrency}>₦</Text>
            <TextInput
              value={amountStr}
              onChangeText={(t) => setAmountStr(t.replace(/[^0-9.]/g, ''))}
              placeholder="0"
              placeholderTextColor={C.faint}
              keyboardType="decimal-pad"
              style={[styles.input, styles.amountInput]}
            />
          </View>

          <View style={styles.presetRow}>
            {meta.presets.map((p) => {
              const active = amount === p;
              return (
                <Pressable
                  key={p}
                  onPress={() => setAmountStr(String(p))}
                  style={({ pressed }) => [styles.preset, active && styles.presetActive, pressed && { opacity: 0.8 }]}
                >
                  <Text style={[styles.presetText, active && styles.presetTextActive]}>
                    {p >= 1000 ? `₦${p / 1000}k` : `₦${p}`}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Card>

        {/* paying from */}
        <Card pad={S.lg} style={{ marginTop: S.md }}>
          <View style={styles.payFromRow}>
            <View style={styles.payFromLeft}>
              <View style={styles.walletIcon}>
                <Ionicons name="wallet-outline" size={17} color={C.green} />
              </View>
              <View>
                <Text style={styles.payFromLabel}>Paying from</Text>
                <Text style={styles.payFromValue}>StocksX Wallet</Text>
              </View>
            </View>
            <HiddenStars value={cash} style={styles.payFromBalance} />
          </View>
          <View style={styles.feeRow}>
            <Ionicons name="shield-checkmark-outline" size={13} color={C.green} />
            <Text style={styles.feeText}>Instant delivery · Zero fees</Text>
          </View>
        </Card>
      </ScrollView>

      {/* pay bar */}
      <View style={styles.payBar}>
        <Button
          label={amount > 0 ? `Pay ${money(amount)}` : `Pay ${meta.label}`}
          onPress={pay}
          variant={valid ? 'primary' : 'light'}
          icon="checkmark-circle-outline"
          block
        />
      </View>

      <ReceiptModal tx={receipt} onClose={() => setReceipt(null)} />
    </View>
  );
}

const makeStyles = () =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: C.canvas },
    catRow: { flexDirection: 'row', gap: S.sm },
    catChip: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingVertical: 10,
      borderRadius: R.pill,
      backgroundColor: C.canvasAlt,
      borderWidth: 1,
      borderColor: C.hairline,
    },
    catChipActive: { backgroundColor: C.green, borderColor: C.green },
    catChipText: { color: C.muted, fontFamily: F.sans, fontSize: 12, fontWeight: '700' },
    catChipTextActive: { color: C.white },
    blockLabel: { color: C.faint, fontFamily: F.sans, fontSize: 10.5, fontWeight: '800', letterSpacing: 1.1, marginBottom: S.md },
    providerGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: S.sm },
    providerCard: {
      width: '48.5%',
      flexGrow: 1,
      backgroundColor: C.surface,
      borderRadius: R.lg,
      borderWidth: 1.5,
      borderColor: C.hairline,
      padding: S.md,
    },
    providerTop: { flexDirection: 'row', alignItems: 'center' },
    providerDot: { width: 10, height: 10, borderRadius: 5 },
    providerName: { color: C.ink, fontFamily: F.sans, fontSize: 14.5, fontWeight: '700', marginTop: 10 },
    providerTag: { color: C.faint, fontFamily: F.sans, fontSize: 11.5, marginTop: 2 },
    fieldLabel: { color: C.faint, fontFamily: F.sans, fontSize: 10.5, fontWeight: '800', letterSpacing: 1.1, marginBottom: S.sm },
    inputWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      backgroundColor: C.canvasAlt,
      borderRadius: R.md,
      paddingHorizontal: 14,
      height: 48,
    },
    input: { flex: 1, color: C.ink, fontFamily: F.sans, fontSize: 15, fontWeight: '600', height: '100%' },
    amountWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: C.canvasAlt,
      borderRadius: R.md,
      paddingHorizontal: 14,
      height: 52,
    },
    amountCurrency: { color: C.muted, fontFamily: F.display, fontSize: 20, fontWeight: '800' },
    amountInput: { fontFamily: F.display, fontSize: 21, fontWeight: '800' },
    presetRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: S.md },
    preset: {
      paddingHorizontal: 13,
      paddingVertical: 7,
      borderRadius: R.pill,
      backgroundColor: C.canvasAlt,
      borderWidth: 1,
      borderColor: C.hairline,
    },
    presetActive: { backgroundColor: C.green, borderColor: C.green },
    presetText: { color: C.muted, fontFamily: F.sans, fontSize: 12, fontWeight: '700' },
    presetTextActive: { color: C.white },
    payFromRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    payFromLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    walletIcon: {
      width: 38,
      height: 38,
      borderRadius: 12,
      backgroundColor: C.canvasAlt,
      alignItems: 'center',
      justifyContent: 'center',
    },
    payFromLabel: { color: C.muted, fontFamily: F.sans, fontSize: 12 },
    payFromValue: { color: C.ink, fontFamily: F.sans, fontSize: 14, fontWeight: '700', marginTop: 1 },
    payFromBalance: { color: C.ink, fontFamily: F.display, fontSize: 16, fontWeight: '800' },
    feeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: S.md, paddingTop: S.md, borderTopWidth: 1, borderTopColor: C.hairlineSoft },
    feeText: { color: C.muted, fontFamily: F.sans, fontSize: 12 },
    payBar: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      paddingHorizontal: S.xl,
      paddingTop: S.md,
      paddingBottom: 24,
      backgroundColor: C.surface,
      borderTopWidth: 1,
      borderTopColor: C.hairline,
    },
  });

let styles = makeStyles();
registerStyles(() => {
  styles = makeStyles();
});
