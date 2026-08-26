import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';

import { Button, Card, ScreenHeader } from '@/components/primitives';
import { HiddenStars } from '@/components/HiddenAmount';
import { PaymentSim } from '@/components/PaymentSim';
import { BILL_CATEGORIES, type BillCategoryMeta } from '@/services/bills';
import { useStore } from '@/store';
import { C, F, R, S, STATUSBAR, registerStyles } from '@/theme';
import { money } from '@/utils';

/**
 * Dedicated bill-payment screen per category (/bills/airtime, /bills/data,
 * /bills/electricity, /bills/tv) — each with its own provider logos,
 * account + amount entry, wallet funding summary and a live payment
 * simulation on pay.
 */

/** brand logo in a white rounded tile (falls back to initials) */
function BillLogo({ logo, name, size = 34 }: { logo?: unknown; name: string; size?: number }) {
  const [err, setErr] = useState(false);
  const show = !!logo && !err;
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.3,
        backgroundColor: C.white,
        borderColor: C.hairline,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {show ? (
        <Image
          source={logo as never}
          style={{ width: size - 8, height: size - 8 }}
          contentFit="contain"
          transition={120}
          onError={() => setErr(true)}
        />
      ) : (
        <Text style={{ color: C.ink, fontFamily: F.display, fontWeight: '800', fontSize: size * 0.36 }}>
          {name.replace(/[^A-Za-z0-9]/g, '').slice(0, 2).toUpperCase()}
        </Text>
      )}
    </View>
  );
}

export default function BillCategoryScreen() {
  const { cat } = useLocalSearchParams<{ cat: string }>();
  const { cash, payBill, notify } = useStore();

  const meta: BillCategoryMeta | undefined = BILL_CATEGORIES.find((c) => c.id === cat);
  const [providerId, setProviderId] = useState('');
  const [account, setAccount] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [sim, setSim] = useState<{ amount: number; provider: string; reference: string; mask: string } | null>(null);

  if (!meta) {
    return (
      <View style={styles.screen}>
        <StatusBar style={STATUSBAR} />
        <ScreenHeader title="Pay Bills" showBack />
        <View style={{ padding: S.xl, marginTop: S.xxl, alignItems: 'center' }}>
          <Ionicons name="alert-circle-outline" size={40} color={C.faint} />
          <Text style={styles.missing}>This service is not available</Text>
        </View>
      </View>
    );
  }

  const provider = meta.providers.find((p) => p.id === providerId);
  const digits = account.replace(/\D/g, '');
  const amount = Number(amountStr.replace(/[^0-9.]/g, '')) || 0;
  const valid = !!provider && digits.length >= meta.fieldMinDigits && amount >= meta.min;

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
    const mask = digits.length > 4 ? `${digits.slice(0, 4)} ••• ${digits.slice(-4)}` : digits;
    setSim({ amount, provider: provider.name, reference, mask });
    setAmountStr('');
  };

  return (
    <View style={styles.screen}>
      <StatusBar style={STATUSBAR} />
      <ScreenHeader title={meta.screenTitle} subtitle={meta.tagline} showBack />

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: S.xl, paddingBottom: 120 }}
      >
        {/* provider grid with brand logos */}
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
                  <BillLogo logo={p.logo} name={p.name} />
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

      <PaymentSim
        visible={!!sim}
        onClose={() => setSim(null)}
        amount={sim?.amount ?? 0}
        provider={sim?.provider ?? ''}
        reference={sim?.reference ?? ''}
        fieldMask={sim?.mask}
      />
    </View>
  );
}

const makeStyles = () =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: C.canvas },
    missing: { color: C.muted, fontFamily: F.sans, fontSize: 14, marginTop: S.md },
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
