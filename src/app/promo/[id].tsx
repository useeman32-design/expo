import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';

import { Button, Card, ScreenHeader } from '@/components/primitives';
import { getPromotion } from '@/services/promotions';
import { useStore } from '@/store';
import { C, F, R, S, registerStyles } from '@/theme';

/**
 * Dedicated page for a promotional campaign (OPay-style): the banner's
 * artwork as hero, full offer details, how-it-works steps, terms and a
 * primary CTA that jumps into the relevant app flow.
 */
export default function PromoPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { notify } = useStore();
  const [joined, setJoined] = useState(false);
  const promo = getPromotion(String(id ?? ''));

  if (!promo) {
    return (
      <View style={styles.screen}>
        <StatusBar style="light" />
        <ScreenHeader title="Campaign" showBack />
        <View style={{ padding: S.xl, marginTop: S.xxl, alignItems: 'center' }}>
          <Ionicons name="megaphone-outline" size={40} color={C.faint} />
          <Text style={styles.missing}>This campaign has ended</Text>
        </View>
      </View>
    );
  }

  const join = () => {
    setJoined(true);
    notify(`Offer activated · ${promo.title}`);
    if (promo.actionRoute) {
      // small delay so the toast is visible before navigating
      setTimeout(() => router.push(promo.actionRoute as never), 600);
    }
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 48 }}>
        {/* hero */}
        <View style={styles.hero}>
          <Image source={promo.image as never} style={styles.heroImg} contentFit="cover" />
          <View style={[styles.heroScrim, { backgroundColor: promo.tint }]} pointerEvents="none" />
          <View style={styles.heroNav}>
            <Pressable onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={22} color={C.white} />
            </Pressable>
            <View style={styles.heroBadge}>
              <Text style={[styles.heroBadgeText, { color: promo.badgeColor }]}>{promo.badge}</Text>
            </View>
          </View>
          <View style={styles.heroCopy} pointerEvents="none">
            <Text style={styles.heroTitle}>{promo.title}</Text>
            <Text style={styles.heroSub}>{promo.subtitle}</Text>
          </View>
        </View>

        {/* body */}
        <View style={{ paddingHorizontal: S.xl, marginTop: S.lg }}>
          <Card pad={S.xl} radius={R.xl}>
            <Text style={styles.headline}>{promo.page.headline}</Text>
            <Text style={styles.description}>{promo.page.description}</Text>
            <View style={styles.expiryRow}>
              <Ionicons name="time-outline" size={13} color={C.green} />
              <Text style={styles.expiry}>{promo.page.expiry}</Text>
            </View>
          </Card>
        </View>

        {/* steps */}
        <View style={{ paddingHorizontal: S.xl, marginTop: S.lg }}>
          <Text style={styles.sectionLabel}>HOW IT WORKS</Text>
          <Card pad={S.xl} radius={R.xl}>
            {promo.page.steps.map((s, i) => (
              <View key={s.title} style={styles.stepRow}>
                <View style={styles.stepNum}>
                  <Text style={styles.stepNumText}>{i + 1}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.stepTitle}>{s.title}</Text>
                  <Text style={styles.stepSub}>{s.sub}</Text>
                </View>
              </View>
            ))}
          </Card>
        </View>

        {/* terms */}
        <View style={{ paddingHorizontal: S.xl, marginTop: S.lg }}>
          <Text style={styles.sectionLabel}>TERMS & CONDITIONS</Text>
          <Card pad={S.lg} radius={R.xl}>
            {promo.page.terms.map((t, i) => (
              <View key={i} style={styles.termRow}>
                <Text style={styles.termBullet}>•</Text>
                <Text style={styles.termText}>{t}</Text>
              </View>
            ))}
          </Card>
        </View>

        {/* CTA */}
        <View style={{ paddingHorizontal: S.xl, marginTop: S.lg, gap: S.md }}>
          <Button
            label={joined ? 'Offer activated ✓' : promo.cta}
            onPress={join}
            block
            icon={joined ? 'checkmark-circle' : 'flash'}
          />
          {promo.actionLabel && !joined ? (
            <Button
              label={promo.actionLabel}
              variant="light"
              block
              onPress={() => promo.actionRoute && router.push(promo.actionRoute as never)}
            />
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}

const makeStyles = () =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: C.canvas },
    hero: {
      height: 230,
      backgroundColor: C.dark,
    },
    heroImg: {
      ...StyleSheet.absoluteFill,
      width: '100%',
      height: '100%',
    },
    heroScrim: {
      ...StyleSheet.absoluteFill,
    },
    heroNav: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: S.lg,
      paddingTop: 54,
    },
    backBtn: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: 'rgba(0,0,0,0.35)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    heroBadge: {
      backgroundColor: 'rgba(0,0,0,0.35)',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: R.pill,
    },
    heroBadgeText: {
      fontFamily: F.sans,
      fontSize: 10,
      fontWeight: '800',
      letterSpacing: 0.8,
    },
    heroCopy: {
      position: 'absolute',
      left: S.xl,
      right: S.xl,
      bottom: S.lg,
    },
    heroTitle: {
      color: C.white,
      fontFamily: F.display,
      fontSize: 24,
      fontWeight: '800',
      letterSpacing: -0.6,
      lineHeight: 29,
    },
    heroSub: {
      color: 'rgba(255,255,255,0.85)',
      fontFamily: F.sans,
      fontSize: 13,
      marginTop: 4,
    },
    headline: {
      color: C.ink,
      fontFamily: F.display,
      fontSize: 18,
      fontWeight: '800',
      letterSpacing: -0.3,
      lineHeight: 23,
    },
    description: {
      color: C.ink2,
      fontFamily: F.sans,
      fontSize: 14,
      lineHeight: 21,
      marginTop: S.md,
    },
    expiryRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      marginTop: S.md,
    },
    expiry: { color: C.green, fontFamily: F.sans, fontSize: 12.5, fontWeight: '700' },
    sectionLabel: {
      color: C.faint,
      fontFamily: F.sans,
      fontSize: 11,
      fontWeight: '800',
      letterSpacing: 1,
      marginBottom: S.sm,
    },
    stepRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      paddingVertical: 10,
    },
    stepNum: {
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: C.greenTint,
      borderWidth: 1.5,
      borderColor: C.green,
      alignItems: 'center',
      justifyContent: 'center',
    },
    stepNumText: { color: C.greenDark, fontFamily: F.display, fontSize: 13, fontWeight: '800' },
    stepTitle: { color: C.ink, fontFamily: F.sans, fontSize: 14.5, fontWeight: '700' },
    stepSub: { color: C.muted, fontFamily: F.sans, fontSize: 12, lineHeight: 17, marginTop: 1 },
    termRow: {
      flexDirection: 'row',
      gap: 8,
      paddingVertical: 5,
    },
    termBullet: { color: C.faint, fontSize: 13 },
    termText: {
      flex: 1,
      color: C.muted,
      fontFamily: F.sans,
      fontSize: 12.5,
      lineHeight: 18,
    },
    missing: {
      color: C.muted,
      fontFamily: F.sans,
      fontSize: 14,
      marginTop: S.sm,
    },
  });
let styles = makeStyles();
registerStyles(() => {
  styles = makeStyles();
});
