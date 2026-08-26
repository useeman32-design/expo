import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import { Card, ScreenHeader } from '@/components/primitives';
import { useAuth } from '@/auth';
import { useKyc } from '@/kyc';
import { C, F, R, S } from '@/theme';

export default function PersonalInfoScreen() {
  const { user } = useAuth();
  const { kyc, verified } = useKyc();
  const [name, setName] = useState(user?.name ?? 'Usman Abdullahi');
  const [email, setEmail] = useState(user?.email ?? 'usman.abdullahi@email.com');
  const [phone, setPhone] = useState(kyc.phone || '08012345678');
  const [saved, setSaved] = useState(false);

  const save = () => setSaved(true);

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 48 }}>
        <ScreenHeader title="Personal Info" subtitle="Kept in sync with your KYC record" />

        {/* verification status */}
        <View style={{ paddingHorizontal: S.xl, marginTop: S.sm }}>
          <Card pad={S.lg} radius={R.lg}>
            <View style={styles.statusRow}>
              <Ionicons
                name={verified ? 'shield-checkmark' : 'shield-half-outline'}
                size={20}
                color={verified ? C.green : '#F6A623'}
              />
              <Text style={[styles.statusText, { color: verified ? C.green : '#F6A623' }]}>
                {verified ? 'Identity fully verified (Tier 3)' : 'Complete verification to edit your legal name'}
              </Text>
            </View>
          </Card>
        </View>

        {/* form */}
        <View style={{ paddingHorizontal: S.xl, marginTop: S.md }}>
          <Card pad={S.xl} radius={R.xl}>
            <Text style={styles.label}>Full name</Text>
            <TextInput value={name} onChangeText={setName} style={styles.input} placeholderTextColor={C.faint} />
            <Text style={styles.hint}>Must match the name on your BVN</Text>

            <Text style={styles.label}>Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
              placeholderTextColor={C.faint}
            />

            <Text style={styles.label}>Phone number</Text>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              style={[styles.input, kyc.bvnVerified && styles.inputLocked]}
              editable={!kyc.bvnVerified}
              placeholderTextColor={C.faint}
            />
            {kyc.bvnVerified ? (
              <Text style={styles.hint}>Locked — this number is linked to your verified BVN</Text>
            ) : null}

            <Pressable onPress={save} style={({ pressed }) => [styles.save, pressed && { opacity: 0.85 }]}>
              <Text style={styles.saveText}>Save changes</Text>
            </Pressable>
            {saved ? (
              <View style={styles.savedRow}>
                <Ionicons name="checkmark-circle" size={15} color={C.green} />
                <Text style={styles.savedText}>Saved (stored on device until the backend is live)</Text>
              </View>
            ) : null}
          </Card>
        </View>

        <View style={{ paddingHorizontal: S.xl, marginTop: S.lg }}>
          <Text style={styles.note}>
            Changes to your legal name require re-verification because your CSCS account is opened
            in this name.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.canvas },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  statusText: { fontFamily: F.sans, fontSize: 13.5, fontWeight: '700', flex: 1 },
  label: {
    color: C.ink2,
    fontFamily: F.sans,
    fontSize: 13,
    fontWeight: '600',
    marginTop: S.md,
    marginBottom: 6,
  },
  input: {
    backgroundColor: C.canvas,
    borderWidth: 1,
    borderColor: C.hairline,
    borderRadius: R.sm,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    fontFamily: F.sans,
    color: C.ink,
  },
  inputLocked: { opacity: 0.6 },
  hint: { color: C.faint, fontFamily: F.sans, fontSize: 11.5, marginTop: 5 },
  save: {
    alignItems: 'center',
    backgroundColor: C.green,
    paddingVertical: 14,
    borderRadius: R.md,
    marginTop: S.lg,
  },
  saveText: { color: C.white, fontFamily: F.sans, fontSize: 15, fontWeight: '700' },
  savedRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: S.md, justifyContent: 'center' },
  savedText: { color: C.green, fontFamily: F.sans, fontSize: 12, fontWeight: '600' },
  note: { color: C.faint, fontFamily: F.sans, fontSize: 12, lineHeight: 18, textAlign: 'center' },
});
