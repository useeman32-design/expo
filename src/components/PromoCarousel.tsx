import { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import type { Promotion } from '@/services/promotions';
import { C, F, R, registerStyles } from '@/theme';

const AUTO_ADVANCE_MS = 4500;

/**
 * OPay-style promotional banner carousel for the Home screen:
 * full-width banners that auto-rotate, with dot indicators; tapping a banner
 * opens its dedicated campaign page (/promo/[id]).
 */
export function PromoCarousel({ promos }: { promos: Promotion[] }) {
  const router = useRouter();
  const width = Dimensions.get('window').width - 40; // S.xl padding both sides
  const scrollRef = useRef<ScrollView>(null);
  const [index, setIndex] = useState(0);
  const paused = useRef(false);
  const fade = useRef(new Animated.Value(1)).current;

  // auto-advance (paused while the user is dragging or has tapped a banner)
  useEffect(() => {
    if (promos.length < 2) return;
    const t = setInterval(() => {
      if (paused.current) return;
      const next = (index + 1) % promos.length;
      scrollRef.current?.scrollTo({ x: next * width, animated: true });
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(t);
  }, [index, promos.length, width]);

  const onPage = (i: number) => {
    setIndex(i);
    // gentle breathing of the dots
    Animated.sequence([
      Animated.timing(fade, { toValue: 0.55, duration: 120, useNativeDriver: true }),
      Animated.timing(fade, { toValue: 1, duration: 180, useNativeDriver: true }),
    ]).start();
  };

  return (
    <View>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={(e) => {
          const i = Math.round(e.nativeEvent.contentOffset.x / width);
          if (i !== index) onPage(i);
        }}
        onTouchStart={() => {
          paused.current = true;
        }}
        onTouchEnd={() => {
          setTimeout(() => {
            paused.current = false;
          }, 6000);
        }}
      >
        {promos.map((p) => (
          <Pressable
            key={p.id}
            onPress={() => router.push(`/promo/${p.id}` as never)}
            style={({ pressed }) => [styles.banner, { width }, pressed && { opacity: 0.9 }]}
            accessibilityLabel={`${p.title} — open campaign page`}
          >
            <Image source={p.image as never} style={styles.bannerImg} contentFit="cover" />
            {/* readability scrim over the (dark) left zone */}
            <View style={[styles.scrim, { backgroundColor: p.tint }]} pointerEvents="none" />
            <View style={styles.copy} pointerEvents="none">
              <View style={[styles.badge, { backgroundColor: `${p.badgeColor}26`, borderColor: `${p.badgeColor}66` }]}>
                <Text style={[styles.badgeText, { color: p.badgeColor }]}>{p.badge}</Text>
              </View>
              <Text style={styles.title} numberOfLines={2}>
                {p.title}
              </Text>
              <Text style={styles.subtitle} numberOfLines={1}>
                {p.subtitle}
              </Text>
              <View style={styles.cta}>
                <Text style={styles.ctaText}>{p.cta}</Text>
                <Ionicons name="chevron-forward" size={13} color={C.white} />
              </View>
            </View>
          </Pressable>
        ))}
      </ScrollView>

      {/* dots */}
      <Animated.View style={styles.dots}>
        {promos.map((p, i) => (
          <View key={p.id} style={[styles.dot, i === index && styles.dotActive]} />
        ))}
      </Animated.View>
    </View>
  );
}

const makeStyles = () =>
  StyleSheet.create({
    banner: {
      height: 132,
      borderRadius: R.xl,
      overflow: 'hidden',
      backgroundColor: C.dark,
    },
    bannerImg: {
      ...StyleSheet.absoluteFill,
      width: '100%',
      height: '100%',
    },
    scrim: {
      ...StyleSheet.absoluteFill,
    },
    copy: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: 0,
      width: '62%',
      padding: 16,
      justifyContent: 'center',
      gap: 5,
    },
    badge: {
      alignSelf: 'flex-start',
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: R.sm,
      borderWidth: 1,
    },
    badgeText: {
      fontFamily: F.sans,
      fontSize: 9,
      fontWeight: '800',
      letterSpacing: 0.8,
    },
    title: {
      color: C.white,
      fontFamily: F.display,
      fontSize: 17,
      fontWeight: '800',
      letterSpacing: -0.3,
      lineHeight: 21,
    },
    subtitle: {
      color: 'rgba(255,255,255,0.82)',
      fontFamily: F.sans,
      fontSize: 11.5,
      lineHeight: 15,
    },
    cta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
      alignSelf: 'flex-start',
      backgroundColor: 'rgba(255,255,255,0.18)',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.35)',
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: R.pill,
      marginTop: 3,
    },
    ctaText: {
      color: C.white,
      fontFamily: F.sans,
      fontSize: 11,
      fontWeight: '800',
    },
    dots: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 5,
      marginTop: 10,
    },
    dot: {
      width: 5,
      height: 5,
      borderRadius: 2.5,
      backgroundColor: C.faint,
      opacity: 0.45,
    },
    dotActive: {
      width: 16,
      backgroundColor: C.green,
      opacity: 1,
    },
  });
let styles = makeStyles();
registerStyles(() => {
  styles = makeStyles();
});
