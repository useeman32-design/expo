import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';

import { useAuth } from '@/auth';
import { LabeledInput, SocialButton } from '@/components/AuthFields';
import { C, F, R, S } from '@/theme';
import logoApp from '@/assets/images/logo-app.png';

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { signInEmail, signInWith, continueAsGuest } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState<null | 'email' | 'google' | 'apple'>(null);

  const submitEmail = () => {
    setErr('');
    if (!email.includes('@')) return setErr('Enter a valid email address');
    if (password.length < 6) return setErr('Password must be at least 6 characters');
    setLoading('email');
    setTimeout(() => signInEmail(email), 650);
  };

  const submitSocial = (provider: 'google' | 'apple') => {
    setErr('');
    setLoading(provider);
    setTimeout(() => signInWith(provider), 750);
  };

  const guest = () => {
    setErr('');
    setLoading('email');
    setTimeout(() => continueAsGuest(), 400);
  };

  const busy = loading !== null;

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1, paddingTop: insets.top + 18, paddingHorizontal: S.xl, paddingBottom: insets.bottom + 24 }}
        >
          {/* brand */}
          <View style={styles.brand}>
            <Image source={logoApp} style={styles.logoImg} contentFit="contain" />
            <Text style={styles.brandText}>StocksX</Text>
          </View>

          <Text style={styles.hello}>Welcome back 👋</Text>
          <Text style={styles.helloSub}>Log in to keep building your portfolio.</Text>

          {/* social */}
          <View style={{ gap: S.md, marginTop: S.xxl }}>
            <SocialButton provider="google" label="Continue with Google" onPress={() => submitSocial('google')} loading={loading === 'google'} />
            <SocialButton provider="apple" label="Continue with Apple" onPress={() => submitSocial('apple')} loading={loading === 'apple'} />
          </View>

          {/* divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or log in with email</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* fields */}
          <LabeledInput label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" />
          <LabeledInput label="Password" value={password} onChangeText={setPassword} placeholder="••••••••" secure />

          <View style={styles.forgotRow}>
            <Pressable onPress={() => {}}>
              <Text style={styles.forgotText}>Forgot password?</Text>
            </Pressable>
          </View>

          {err ? <Text style={styles.errText}>{err}</Text> : null}

          {/* CTA */}
          <Pressable onPress={submitEmail} disabled={busy}>
            {({ pressed }) => (
              <LinearGradient
                colors={[C.hero1, C.hero2]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.cta, pressed && { opacity: 0.9 }, busy && { opacity: 0.7 }]}
              >
                {loading === 'email' ? (
                  <ActivityIndicator size="small" color={C.white} />
                ) : (
                  <>
                    <Text style={styles.ctaText}>Log in</Text>
                    <Ionicons name="arrow-forward" size={19} color={C.white} />
                  </>
                )}
              </LinearGradient>
            )}
          </Pressable>

          <Pressable onPress={guest} disabled={busy}>
            <Text style={styles.guestText}>Skip for now</Text>
          </Pressable>

          {/* footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>New to StocksX?</Text>
            <Pressable onPress={() => router.push('/register')}>
              <Text style={styles.footerLink}> Create account</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.white },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  logoImg: { width: 32, height: 32, borderRadius: 10 },
  brandText: { color: C.ink, fontFamily: F.sans, fontSize: 19, fontWeight: '900', letterSpacing: -0.3 },
  hello: {
    color: C.ink,
    fontFamily: F.sans,
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.7,
    marginTop: S.xxl,
  },
  helloSub: {
    color: C.muted,
    fontFamily: F.sans,
    fontSize: 15,
    fontWeight: '500',
    marginTop: 6,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: S.xl,
    gap: 12,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: C.hairline },
  dividerText: {
    color: C.faint,
    fontFamily: F.sans,
    fontSize: 12.5,
    fontWeight: '600',
  },
  forgotRow: { alignItems: 'flex-end', marginTop: -4, marginBottom: S.md },
  forgotText: {
    color: C.greenDark,
    fontFamily: F.sans,
    fontSize: 13,
    fontWeight: '700',
  },
  errText: {
    color: C.negative,
    fontFamily: F.sans,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: S.sm,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 17,
    borderRadius: R.md,
  },
  ctaText: { color: C.white, fontFamily: F.sans, fontSize: 16, fontWeight: '800' },
  guestText: {
    color: C.muted,
    fontFamily: F.sans,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: S.lg,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: S.xxl,
  },
  footerText: { color: C.muted, fontFamily: F.sans, fontSize: 14, fontWeight: '600' },
  footerLink: { color: C.greenDark, fontFamily: F.sans, fontSize: 14, fontWeight: '800' },
});
