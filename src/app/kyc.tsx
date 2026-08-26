import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { Card, ScreenHeader } from '@/components/primitives';
import { useKyc } from '@/kyc';
import { KYC_TIERS, validateBvn, validateNin, validatePhone } from '@/services/kyc';
import { C, F, R, S, SH, registerStyles, STATUSBAR } from '@/theme';

type Phase = 'overview' | 'bvn' | 'nin' | 'document';

export default function KycScreen() {
  const { kyc, verified, verify } = useKyc();
  const [phase, setPhase] = useState<Phase>('overview');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // form fields
  const [bvn, setBvn] = useState('');
  const [phone, setPhone] = useState(kyc.phone || '');
  const [nin, setNin] = useState('');
  const [docType, setDocType] = useState<'NIN Slip' | 'Passport' | "Driver's Licence">('NIN Slip');

  const run = async (fn: () => Promise<boolean>) => {
    setBusy(true);
    setErr(null);
    const ok = await fn();
    setBusy(false);
    if (ok) setPhase('overview');
  };

  const submitBvn = () => {
    if (!validateBvn(bvn)) return setErr('BVN must be exactly 11 digits');
    if (!validatePhone(phone)) return setErr('Enter a valid Nigerian phone number');
    return run(() => verify('bvn', { phone }));
  };

  const submitNin = () => {
    if (!validateNin(nin)) return setErr('NIN must be exactly 11 digits');
    return run(() => verify('nin'));
  };

  const submitDoc = () => run(() => verify('document'));

  const done = (s: string) =>
    s === 'bvn' ? kyc.bvnVerified : s === 'nin' ? kyc.ninVerified : kyc.documentVerified;

  const progress = [kyc.bvnVerified, kyc.ninVerified, kyc.documentVerified].filter(Boolean).length;

  return (
    <View style={styles.screen}>
      <StatusBar style={STATUSBAR} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          <ScreenHeader
            title="KYC & Verification"
            subtitle={verified ? 'Fully verified' : 'Unlocks funding, trading & withdrawals'}
            showBack={phase === 'overview'}
            right={
              phase !== 'overview' ? (
                <Pressable onPress={() => setPhase('overview')} style={styles.cancelBtn}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </Pressable>
              ) : undefined
            }
          />

          {/* progress card */}
          <View style={{ paddingHorizontal: S.xl, marginTop: S.sm }}>
            <Card pad={S.xl} radius={R.xl}>
              <View style={styles.progRow}>
                <View style={[styles.progBadge, verified && { backgroundColor: C.green }]}>
                  <Ionicons
                    name={verified ? 'shield-checkmark' : 'shield-half-outline'}
                    size={22}
                    color={C.white}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.progTitle}>
                    {verified ? 'Tier 3 · Verified' : `Tier ${1 + progress} in progress`}
                  </Text>
                  <Text style={styles.progSub}>
                    {verified
                      ? 'All features unlocked — thank you!'
                      : `${progress} of 3 steps complete`}
                  </Text>
                </View>
              </View>
              <View style={styles.progTrack}>
                <View style={[styles.progFill, { width: `${(progress / 3) * 100}%` }]} />
              </View>
            </Card>
          </View>

          {/* tiers */}
          <View style={{ paddingHorizontal: S.xl, marginTop: S.xxl, gap: S.md }}>
            {KYC_TIERS.map((t) => {
              const isDone = done(t.step);
              const current = !isDone && !verified && phase === 'overview';
              return (
                <Card key={t.step} pad={S.xl} radius={R.xl}>
                  <View style={styles.tierRow}>
                    <View style={[styles.tierIcon, { backgroundColor: `${t.color}18` }]}>
                      <Ionicons name={t.icon as never} size={20} color={t.color} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.tierTitle}>{t.title}</Text>
                      <Text style={styles.tierSub}>{t.unlocks}</Text>
                    </View>
                    {isDone ? (
                      <View style={styles.doneBadge}>
                        <Ionicons name="checkmark" size={14} color={C.green} />
                        <Text style={styles.doneText}>Done</Text>
                      </View>
                    ) : (
                      <Ionicons name="chevron-forward" size={16} color={C.faint} />
                    )}
                  </View>
                  {!isDone && current && (
                    <Pressable
                      onPress={() => setPhase(t.step)}
                      disabled={busy}
                      style={({ pressed }) => [styles.cta, pressed && { opacity: 0.9 }]}
                    >
                      <LinearGradient
                        colors={[C.hero1, C.hero2]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.ctaGradient}
                      >
                        <Text style={styles.ctaText}>Verify now</Text>
                        <Ionicons name="arrow-forward" size={17} color={C.white} />
                      </LinearGradient>
                    </Pressable>
                  )}
                </Card>
              );
            })}
          </View>

          {/* ---- step: BVN ---- */}
          {phase === 'bvn' && (
            <View style={{ paddingHorizontal: S.xl, marginTop: S.xxl }}>
              <Card pad={S.xl} radius={R.xl}>
                <Text style={styles.formTitle}>Bank Verification Number</Text>
                <Text style={styles.formSub}>
                  We check your BVN against the NIBSS registry. This confirms your legal name,
                  date of birth and phone number.
                </Text>
                <Text style={styles.label}>BVN (11 digits)</Text>
                <TextInput
                  value={bvn}
                  onChangeText={(t) => setBvn(t.replace(/\D/g, '').slice(0, 11))}
                  placeholder="2229 9988 7766"
                  keyboardType="number-pad"
                  placeholderTextColor={C.faint}
                  style={styles.input}
                />
                <Text style={styles.label}>Phone number linked to your BVN</Text>
                <TextInput
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="08012345678"
                  keyboardType="phone-pad"
                  placeholderTextColor={C.faint}
                  style={styles.input}
                />
                {err ? <Text style={styles.errText}>{err}</Text> : null}
                <Pressable
                  onPress={submitBvn}
                  disabled={busy}
                  style={({ pressed }) => [styles.cta, pressed && { opacity: 0.9 }]}
                >
                  <LinearGradient
                    colors={[C.hero1, C.hero2]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.ctaGradient}
                  >
                    {busy ? (
                      <ActivityIndicator color={C.white} size="small" />
                    ) : (
                      <>
                        <Text style={styles.ctaText}>Verify BVN</Text>
                        <Ionicons name="arrow-forward" size={17} color={C.white} />
                      </>
                    )}
                  </LinearGradient>
                </Pressable>
                <Text style={styles.footnote}>
                  Dial *565*0# on your registered line to see your BVN.
                </Text>
              </Card>
            </View>
          )}

          {/* ---- step: NIN ---- */}
          {phase === 'nin' && (
            <View style={{ paddingHorizontal: S.xl, marginTop: S.xxl }}>
              <Card pad={S.xl} radius={R.xl}>
                <Text style={styles.formTitle}>National Identity Number</Text>
                <Text style={styles.formSub}>
                  We verify your NIN with the NIMC database and match it to the name on your BVN.
                </Text>
                <Text style={styles.label}>NIN (11 digits)</Text>
                <TextInput
                  value={nin}
                  onChangeText={(t) => setNin(t.replace(/\D/g, '').slice(0, 11))}
                  placeholder="12345678901"
                  keyboardType="number-pad"
                  placeholderTextColor={C.faint}
                  style={styles.input}
                />
                {err ? <Text style={styles.errText}>{err}</Text> : null}
                <Pressable
                  onPress={submitNin}
                  disabled={busy}
                  style={({ pressed }) => [styles.cta, pressed && { opacity: 0.9 }]}
                >
                  <LinearGradient
                    colors={[C.hero1, C.hero2]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.ctaGradient}
                  >
                    {busy ? (
                      <ActivityIndicator color={C.white} size="small" />
                    ) : (
                      <>
                        <Text style={styles.ctaText}>Verify NIN</Text>
                        <Ionicons name="arrow-forward" size={17} color={C.white} />
                      </>
                    )}
                  </LinearGradient>
                </Pressable>
              </Card>
            </View>
          )}

          {/* ---- step: document + selfie ---- */}
          {phase === 'document' && (
            <View style={{ paddingHorizontal: S.xl, marginTop: S.xxl }}>
              <Card pad={S.xl} radius={R.xl}>
                <Text style={styles.formTitle}>Valid ID & selfie</Text>
                <Text style={styles.formSub}>
                  Upload a government-issued ID and take a quick selfie with liveness detection.
                </Text>
                <Text style={styles.label}>Document type</Text>
                <View style={styles.docRow}>
                  {(['NIN Slip', 'Passport', "Driver's Licence"] as const).map((d) => (
                    <Pressable
                      key={d}
                      onPress={() => setDocType(d)}
                      style={[styles.docChip, docType === d && styles.docChipActive]}
                    >
                      <Text style={[styles.docChipText, docType === d && styles.docChipTextActive]}>
                        {d}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                <View style={[styles.uploadBox, styles.uploadFirst]}>
                  <Ionicons name="cloud-upload-outline" size={26} color={C.green} />
                  <Text style={styles.uploadTitle}>Upload {docType}</Text>
                  <Text style={styles.uploadSub}>Front side, all corners visible</Text>
                </View>
                <View style={styles.uploadBox}>
                  <Ionicons name="camera-outline" size={26} color={C.green} />
                  <Text style={styles.uploadTitle}>Take a selfie</Text>
                  <Text style={styles.uploadSub}>Look straight ahead in good light</Text>
                </View>

                {err ? <Text style={styles.errText}>{err}</Text> : null}
                <Pressable
                  onPress={submitDoc}
                  disabled={busy}
                  style={({ pressed }) => [styles.cta, pressed && { opacity: 0.9 }]}
                >
                  <LinearGradient
                    colors={[C.hero1, C.hero2]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.ctaGradient}
                  >
                    {busy ? (
                      <ActivityIndicator color={C.white} size="small" />
                    ) : (
                      <>
                        <Text style={styles.ctaText}>Submit for review</Text>
                        <Ionicons name="arrow-forward" size={17} color={C.white} />
                      </>
                    )}
                  </LinearGradient>
                </Pressable>
                <Text style={styles.footnote}>
                  Documents are encrypted and reviewed automatically — usually within 5 minutes.
                </Text>
              </Card>
            </View>
          )}

          <View style={{ paddingHorizontal: S.xl, marginTop: S.xl }}>
            <Text style={styles.privacyNote}>
              Your data is encrypted, used only for regulatory verification and never sold. See our{' '}
              <Text style={styles.privacyLink}>Privacy Policy</Text>.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const makeStyles = () => StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.canvas },
  cancelBtn: { paddingHorizontal: 12, paddingVertical: 6 },
  cancelText: { color: C.muted, fontFamily: F.sans, fontSize: 14, fontWeight: '600' },
  progRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  progBadge: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: C.greenSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progTitle: { color: C.ink, fontFamily: F.display, fontSize: 17, fontWeight: '700' },
  progSub: { color: C.muted, fontFamily: F.sans, fontSize: 13, marginTop: 2 },
  progTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: C.canvasAlt,
    marginTop: S.lg,
    overflow: 'hidden',
  },
  progFill: { height: '100%', borderRadius: 3, backgroundColor: C.green },
  tierRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  tierIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tierTitle: { color: C.ink, fontFamily: F.sans, fontSize: 15, fontWeight: '700' },
  tierSub: { color: C.muted, fontFamily: F.sans, fontSize: 12.5, marginTop: 2, flex: 1 },
  doneBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: C.positiveSoft,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: R.pill,
  },
  doneText: { color: C.green, fontFamily: F.sans, fontSize: 12, fontWeight: '700' },
  cta: { marginTop: S.lg },
  ctaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 15,
    borderRadius: R.md,
  },
  ctaText: { color: C.white, fontFamily: F.sans, fontSize: 15, fontWeight: '800' },
  formTitle: { color: C.ink, fontFamily: F.display, fontSize: 18, fontWeight: '700' },
  formSub: {
    color: C.muted,
    fontFamily: F.sans,
    fontSize: 13.5,
    lineHeight: 19,
    marginTop: S.sm,
    marginBottom: S.md,
  },
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
    paddingVertical: Platform.OS === 'web' ? 12 : 14,
    fontSize: 16,
    fontFamily: F.mono,
    color: C.ink,
  },
  errText: { color: C.negative, fontFamily: F.sans, fontSize: 13, marginTop: S.sm },
  docRow: { flexDirection: 'row', gap: 8, marginTop: S.xs },
  docChip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: R.pill,
    backgroundColor: C.canvas,
    borderWidth: 1,
    borderColor: C.hairline,
  },
  docChipActive: { backgroundColor: C.green, borderColor: C.green },
  docChipText: { color: C.ink2, fontFamily: F.sans, fontSize: 13, fontWeight: '600' },
  docChipTextActive: { color: C.white },
  uploadBox: {
    borderWidth: 1.5,
    borderColor: C.hairline,
    borderStyle: 'dashed',
    borderRadius: R.lg,
    alignItems: 'center',
    paddingVertical: S.lg,
    marginTop: S.md,
  },
  uploadFirst: { marginTop: S.lg },
  uploadTitle: { color: C.ink, fontFamily: F.sans, fontSize: 14, fontWeight: '700', marginTop: 6 },
  uploadSub: { color: C.muted, fontFamily: F.sans, fontSize: 12, marginTop: 2 },
  footnote: {
    color: C.faint,
    fontFamily: F.sans,
    fontSize: 12,
    marginTop: S.md,
    textAlign: 'center',
  },
  privacyNote: {
    color: C.faint,
    fontFamily: F.sans,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
  privacyLink: { color: C.green, fontWeight: '600' },
  cardShadow: SH.card,
});
let styles = makeStyles();
registerStyles(() => { styles = makeStyles(); });
