import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import {
  Card,
  Chip,
  ScreenHeader,
  SectionTitle,
} from '@/components/primitives';
import { LearnCard } from '@/components/LearnCard';
import {
  GLOSSARY,
  LEARN_CATEGORIES,
  getCourses,
  getContinueLearning,
  overallProgress,
} from '@/services/learning';
import { C, F, R, S, SH, registerStyles, STATUSBAR } from '@/theme';

const CAT_TILES = [
  { label: 'Stock Basics', icon: 'cube', color: '#11A06B', category: 'Beginner' },
  { label: 'Investing', icon: 'trending-up', color: '#0E8A57', category: 'Investing' },
  { label: 'Trading', icon: 'analytics', color: '#7C5CFF', category: 'Trading' },
  { label: 'Nigerian Market', icon: 'business', color: '#F6A623', category: 'Nigerian Market' },
  { label: 'Dividends', icon: 'cash', color: '#3DDC97', category: 'Investing' },
  { label: 'Risk Management', icon: 'shield', color: '#DD4B3E', category: 'Risk Management' },
];

export default function LearnScreen() {
  const router = useRouter();
  const [cat, setCat] = useState('All');
  const cont = useMemo(() => getContinueLearning(), []);
  const progress = useMemo(() => overallProgress(), []);
  const courses = useMemo(() => getCourses(cat), [cat]);

  return (
    <View style={styles.screen}>
      <StatusBar style={STATUSBAR} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 110 }}>
        <ScreenHeader title="Learn" subtitle={`Your progress · ${progress}%`} />

        {/* categories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginTop: S.sm }}
          contentContainerStyle={{ paddingHorizontal: S.xl }}
        >
          {LEARN_CATEGORIES.map((c) => (
            <Chip key={c} label={c} active={cat === c} onPress={() => setCat(c)} />
          ))}
        </ScrollView>

        {/* continue learning */}
        <View style={{ paddingHorizontal: S.xl, marginTop: S.lg }}>
          <Pressable
            onPress={() => router.push(`/lesson/${cont.id}`)}
            style={({ pressed }) => pressed && { opacity: 0.9 }}
          >
            <Card pad={S.lg} radius={R.xl}>
              <View style={styles.contRow}>
                <View style={[styles.contIcon, { backgroundColor: `${cont.color}1F` }]}>
                  <Ionicons name={cont.icon as never} size={22} color={cont.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.contKicker}>CONTINUE LEARNING</Text>
                  <Text style={styles.contTitle}>{cont.title}</Text>
                  <View style={styles.bar}>
                    <View
                      style={[styles.barFill, { width: `${cont.progress}%`, backgroundColor: cont.color }]}
                    />
                  </View>
                  <Text style={styles.contMeta}>{cont.progress}% complete</Text>
                </View>
                <Ionicons name="play-circle" size={30} color={C.green} />
              </View>
            </Card>
          </Pressable>
        </View>

        {/* categories grid */}
        <View style={{ paddingHorizontal: S.xl, marginTop: S.xxl }}>
          <SectionTitle title="Learning Categories" />
          <View style={styles.catGrid}>
            {Array.from({ length: Math.ceil(CAT_TILES.length / 3) }, (_, ri) =>
              CAT_TILES.slice(ri * 3, ri * 3 + 3),
            ).map((row, ri) => (
              <View key={ri} style={styles.catRow}>
                {row.map((t) => (
                  <Pressable
                    key={t.label}
                    onPress={() => setCat(t.category)}
                    style={({ pressed }) => [styles.catTile, pressed && { opacity: 0.85 }]}
                  >
                    <View style={[styles.catIcon, { backgroundColor: `${t.color}1F` }]}>
                      <Ionicons name={t.icon as never} size={20} color={t.color} />
                    </View>
                    <Text style={styles.catLabel}>{t.label}</Text>
                  </Pressable>
                ))}
              </View>
            ))}
          </View>
        </View>

        {/* recommended */}
        <View style={{ paddingHorizontal: S.xl, marginTop: S.xxl }}>
          <SectionTitle title={cat === 'All' ? 'Recommended for you' : cat} />
          <View style={styles.courseList}>
            {courses.map((c) => (
              <LearnCard key={c.id} course={c} />
            ))}
          </View>
        </View>

        {/* glossary */}
        <View style={{ marginTop: S.xxl }}>
          <View style={{ paddingHorizontal: S.xl }}>
            <SectionTitle title="Hausa glossary" />
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: S.xl, gap: S.md }}
          >
            {GLOSSARY.map((g) => (
              <View key={g.ha} style={styles.glossCard}>
                <Text style={styles.glossHa}>{g.ha}</Text>
                <Text style={styles.glossEn}>{g.en}</Text>
                <Text style={styles.glossMeaning} numberOfLines={4}>
                  {g.meaning}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
}

const makeStyles = () => StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.canvas },
  contRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  contIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contKicker: {
    color: C.green,
    fontFamily: F.sans,
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 1,
  },
  contTitle: {
    color: C.ink,
    fontFamily: F.sans,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
    marginTop: 2,
    marginBottom: 7,
  },
  bar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: C.canvasAlt,
    overflow: 'hidden',
  },
  barFill: { height: 6, borderRadius: 3 },
  contMeta: {
    color: C.muted,
    fontFamily: F.sans,
    fontSize: 11.5,
    marginTop: 5,
  },
  catGrid: {
    gap: S.md,
  },
  catRow: {
    flexDirection: 'row',
    gap: S.md,
  },
  catTile: {
    flex: 1,
    backgroundColor: C.surface,
    borderRadius: R.lg,
    padding: S.lg,
    gap: 10,
    ...SH.soft,
  },
  catIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catLabel: {
    color: C.ink,
    fontFamily: F.sans,
    fontSize: 13,
    fontWeight: '700',
  },
  courseList: { gap: S.md },
  glossCard: {
    width: 200,
    backgroundColor: C.surface,
    borderRadius: R.lg,
    padding: S.lg,
    ...SH.soft,
  },
  glossHa: {
    color: C.green,
    fontFamily: F.sans,
    fontSize: 20,
    fontWeight: '800',
  },
  glossEn: {
    color: C.ink,
    fontFamily: F.sans,
    fontSize: 13.5,
    fontWeight: '600',
    marginBottom: 8,
  },
  glossMeaning: {
    color: C.muted,
    fontFamily: F.sans,
    fontSize: 13,
    lineHeight: 19,
  },
});
let styles = makeStyles();
registerStyles(() => { styles = makeStyles(); });
