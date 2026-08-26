import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import { Card, ScreenHeader } from '@/components/primitives';
import { C, F, R, S } from '@/theme';

export default function SecurityScreen() {
  const [pin, setPin] = useState(false);
  const [biometric, setBiometric] = useState(true);
  const [twoFactor, setTwoFactor] = useState(true);

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 48 }}>
        <ScreenHeader title="Security" subtitle="Protect your account and money" />

        <View style={{ paddingHorizontal: S.xl, marginTop: S.sm, gap: S.md }}>
          <Card pad={0} radius={R.lg}>
            <ToggleRow
              icon="keypad-outline"
              color="#0E8A57"
              title="App PIN"
              sub="Require a 6-digit PIN to open the app"
              value={pin}
              onChange={setPin}
            />
            <Divider />
            <ToggleRow
              icon="finger-print-outline"
              color="#1F7AE0"
              title="Face ID / Fingerprint"
              sub="Unlock with biometrics instead of the PIN"
              value={biometric}
              onChange={setBiometric}
              disabled={!pin}
            />
            <Divider />
            <ToggleRow
              icon="phone-portrait-outline"
              color="#F6A623"
              title="2-step verification"
              sub="One-time code by SMS for logins on new devices"
              value={twoFactor}
              onChange={setTwoFactor}
            />
          </Card>

          {/* device sessions */}
          <Card pad={S.lg} radius={R.lg}>
            <Text style={styles.cardTitle}>Active sessions</Text>
            {[
              { icon: 'phone-portrait', name: 'iPhone 13 · Lagos', current: true, time: 'Now' },
              { icon: 'laptop-outline', name: 'Chrome · Windows', current: false, time: '2 days ago' },
            ].map((d) => (
              <View key={d.name} style={styles.deviceRow}>
                <Ionicons name={d.icon as never} size={18} color={C.ink2} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.deviceName}>
                    {d.name}
                    {d.current ? '  ·  this device' : ''}
                  </Text>
                  <Text style={styles.deviceTime}>{d.time}</Text>
                </View>
                {d.current ? (
                  <View style={styles.liveBadge}>
                    <Text style={styles.liveText}>Live</Text>
                  </View>
                ) : (
                  <Pressable style={styles.revoke}>
                    <Text style={styles.revokeText}>Sign out</Text>
                  </Pressable>
                )}
              </View>
            ))}
          </Card>

          <Pressable style={({ pressed }) => [styles.danger, pressed && { opacity: 0.85 }]}>
            <Ionicons name="warning-outline" size={18} color={C.negative} />
            <Text style={styles.dangerText}>Freeze account (blocks trades & withdrawals)</Text>
          </Pressable>
        </View>

        <View style={{ paddingHorizontal: S.xl, marginTop: S.lg }}>
          <Text style={styles.note}>
            The app PIN is enforced locally on device. Biometric unlock, 2FA codes and session
            management activate with the live backend.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

function ToggleRow({
  icon,
  color,
  title,
  sub,
  value,
  onChange,
  disabled,
}: {
  icon: string;
  color: string;
  title: string;
  sub: string;
  value: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <View style={[styles.toggleRow, disabled && { opacity: 0.45 }]}>
      <View style={[styles.toggleIcon, { backgroundColor: `${color}16` }]}>
        <Ionicons name={icon as never} size={18} color={color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.toggleTitle}>{title}</Text>
        <Text style={styles.toggleSub}>{sub}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={disabled ? undefined : onChange}
        trackColor={{ false: C.canvasAlt, true: C.green }}
        thumbColor={C.white}
      />
    </View>
  );
}

function Divider() {
  return <View style={{ height: 1, backgroundColor: C.hairlineSoft, marginLeft: 66 }} />;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.canvas },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: S.lg },
  toggleIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleTitle: { color: C.ink, fontFamily: F.sans, fontSize: 14.5, fontWeight: '700' },
  toggleSub: { color: C.muted, fontFamily: F.sans, fontSize: 12, marginTop: 2, flex: 1 },
  cardTitle: { color: C.ink, fontFamily: F.sans, fontSize: 14.5, fontWeight: '700', marginBottom: S.md },
  deviceRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 9 },
  deviceName: { color: C.ink, fontFamily: F.sans, fontSize: 13.5, fontWeight: '600' },
  deviceTime: { color: C.faint, fontFamily: F.sans, fontSize: 11.5, marginTop: 1 },
  liveBadge: {
    backgroundColor: C.positiveSoft,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: R.pill,
  },
  liveText: { color: C.green, fontFamily: F.sans, fontSize: 10.5, fontWeight: '700' },
  revoke: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: R.pill,
    borderWidth: 1,
    borderColor: C.hairline,
  },
  revokeText: { color: C.muted, fontFamily: F.sans, fontSize: 12, fontWeight: '600' },
  danger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    backgroundColor: C.negativeSoft,
    paddingVertical: 15,
    borderRadius: R.lg,
  },
  dangerText: { color: C.negative, fontFamily: F.sans, fontSize: 13.5, fontWeight: '700' },
  note: { color: C.faint, fontFamily: F.sans, fontSize: 12, lineHeight: 18, textAlign: 'center' },
});
