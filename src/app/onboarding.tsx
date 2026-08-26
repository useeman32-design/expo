import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';

import { useAuth } from '@/auth';
import { C, F, R, S, SH } from '@/theme';
import logoApp from '@/assets/images/logo-app.png';

import img1 from '@/assets/onboarding/onboarding1.png';
import img2 from '@/assets/onboarding/onboarding2.png';
import img3 from '@/assets/onboarding/onboarding3.png';

const SLIDES = [
  {
    img: img1,
    title: 'Trade NGX & global stocks',
    sub: 'Buy and sell Nigerian and US stocks in seconds — right from your phone, with low fees.',
  },
  {
    img: img2,
    title: 'Invest the halal way',
    sub: 'Sharia-compliant screening helps keep your portfolio aligned with your values.',
  },
  {
    img: img3,
    title: 'Learn & grow your wealth',
    sub: 'Bite-sized lessons in English (Hausa coming soon) help you invest with confidence.',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { completeOnboarding } = useAuth();
  const scrollRef = useRef<ScrollView>(null);
  const [index, setIndex] = useState(0);
  const last = index === SLIDES.length - 1;

  // Preload every slide image up front so swiping never stalls on a decode.
  useEffect(() => {
    if (typeof window !== 'undefined' && typeof (window as any).Image === 'function') {
      SLIDES.forEach((s) => {
        const preloader = new (window as any).Image();
        preloader.src = s.img as any;
      });
    } else {
      SLIDES.forEach((s) => Image.prefetch(s.img as any).catch(() => undefined));
    }
  }, []);

  const go = (i: number) => scrollRef.current?.scrollTo({ x: i * width, animated: true });

  const finish = async () => {
    await completeOnboarding();
    router.replace('/login');
  };

  const next = () => (last ? finish() : go(index + 1));

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />

      {/* top bar */}
      <View style={[styles.topBar, { marginTop: insets.top + 6 }]}>
        <View style={styles.wordmark}>
          <Image source={logoApp} style={styles.logoImg} contentFit="contain" />
          <Text style={styles.wordmarkText}>StocksX</Text>
        </View>
        <Pressable onPress={finish} style={styles.skipBtn}>
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>
      </View>

      {/* slides */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={(e) => {
          const i = Math.round(e.nativeEvent.contentOffset.x / width);
          setIndex((prev) => (i === prev ? prev : i));
        }}
        onMomentumScrollEnd={(e) => setIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
        style={{ flex: 1 }}
      >
        {SLIDES.map((s, i) => (
          <View key={i} style={[styles.slide, { width }]}>
            <View style={[styles.imgCard, { width: width - S.xxl * 2 }]}>
              <Image source={s.img} style={styles.img} contentFit="contain" />
            </View>
            <Text style={styles.title}>{s.title}</Text>
            <Text style={styles.sub}>{s.sub}</Text>
          </View>
        ))}
      </ScrollView>

      {/* dots */}
      <View style={styles.dots}>
        {SLIDES.map((_, i) => (
          <View key={i} style={[styles.dot, i === index ? styles.dotActive : null]} />
        ))}
      </View>

      {/* actions */}
      <View style={[styles.actions, { paddingBottom: insets.bottom + 16 }]}>
        {index > 0 ? (
          <Pressable onPress={() => go(index - 1)} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={20} color={C.ink} />
            <Text style={styles.backText}>Back</Text>
          </Pressable>
        ) : (
          <View style={{ width: 90 }} />
        )}

        <Pressable onPress={next} style={{ flex: 1 }}>
          {({ pressed }) => (
            <LinearGradient
              colors={[C.hero1, C.hero2]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.cta, pressed && { opacity: 0.9 }]}
            >
              <Text style={styles.ctaText}>{last ? 'Get Started' : 'Continue'}</Text>
              <Ionicons name="arrow-forward" size={19} color={C.white} />
            </LinearGradient>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.white },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: S.xl,
    paddingBottom: S.sm,
  },
  wordmark: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  logoImg: { width: 32, height: 32, borderRadius: 10 },
  wordmarkText: {
    color: C.ink,
    fontFamily: F.display,
    fontSize: 19,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  skipBtn: { paddingHorizontal: 10, paddingVertical: 6 },
  skipText: {
    color: C.muted,
    fontFamily: F.sans,
    fontSize: 14,
    fontWeight: '700',
  },
  slide: {
    paddingHorizontal: S.xxl,
    alignItems: 'center',
    paddingTop: S.md,
  },
  imgCard: {
    maxWidth: 340,
    aspectRatio: 1,
    borderRadius: R.xxl,
    backgroundColor: C.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...SH.card,
  },
  img: { width: '100%', height: '100%' },
  title: {
    color: C.ink,
    fontFamily: F.display,
    fontSize: 25,
    fontWeight: '900',
    letterSpacing: -0.6,
    textAlign: 'center',
    marginTop: S.xxl,
  },
  sub: {
    color: C.muted,
    fontFamily: F.sans,
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 22,
    textAlign: 'center',
    marginTop: S.sm,
    paddingHorizontal: S.md,
  },
  dots: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, paddingVertical: S.lg },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.hairline },
  dotActive: { width: 24, backgroundColor: C.green },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.md,
    paddingHorizontal: S.xl,
    paddingTop: S.sm,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    width: 90,
    paddingVertical: 14,
  },
  backText: { color: C.ink, fontFamily: F.sans, fontSize: 15, fontWeight: '700' },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 17,
    borderRadius: R.md,
  },
  ctaText: {
    color: C.white,
    fontFamily: F.sans,
    fontSize: 16,
    fontWeight: '800',
  },
});
