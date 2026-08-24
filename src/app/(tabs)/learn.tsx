import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Background } from '@/components/Background';
import { AppHeader, GlassCard, PrimaryButton, SectionHeader } from '@/components/ui';
import { COURSES, GLOSSARY, lessonsForCourse } from '@/data/lessons';
import { C, FONT, R, S } from '@/theme';

export default function LearnScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const resume = COURSES[0];
  const resumeLessons = lessonsForCourse(resume.id);

  return (
    <Background>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 130 }}
      >
        <AppHeader title="Learn" subtitle="Koyi kasuwanci" />

        {/* Resume card */}
        <View style={{ paddingHorizontal: S.xl }}>
          <GlassCard variant="green" style={styles.resume}>
            <View style={styles.resumeTop}>
              <View style={[styles.resumeIcon, { backgroundColor: resume.color + '22' }]}>
                <Ionicons name={resume.icon as never} size={24} color={resume.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.resumeKicker}>CONTINUE LEARNING</Text>
                <Text style={styles.resumeTitle}>{resume.title}</Text>
                <Text style={styles.resumeHa}>{resume.haTitle}</Text>
              </View>
            </View>
            <View style={styles.barTrack}>
              <View style={[styles.barFill, { width: '50%' }]} />
            </View>
            <View style={styles.resumeFoot}>
              <Text style={styles.resumeFootText}>Lesson 2 of {resume.lessons}</Text>
              <PrimaryButton
                label="Resume"
                icon="play"
                onPress={() => router.push(`/lesson/${resumeLessons[1].id}`)}
              />
            </View>
          </GlassCard>
        </View>

        {/* Courses */}
        <View style={{ paddingHorizontal: S.xl, marginTop: S.xxxl }}>
          <SectionHeader title="Courses" ha="Darussa" />
          <View style={styles.courseList}>
            {COURSES.map((c) => {
              const first = lessonsForCourse(c.id)[0];
              return (
                <Pressable
                  key={c.id}
                  onPress={() => router.push(`/lesson/${first.id}`)}
                  style={({ pressed }) => pressed && { opacity: 0.85 }}
                >
                  <GlassCard style={styles.courseCard}>
                    <View
                      style={[styles.courseIcon, { backgroundColor: c.color + '22' }]}
                    >
                      <Ionicons name={c.icon as never} size={22} color={c.color} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.courseTitle}>{c.title}</Text>
                      <Text style={styles.courseHa}>{c.haTitle}</Text>
                      <Text style={styles.courseDesc} numberOfLines={2}>
                        {c.description}
                      </Text>
                      <View style={styles.courseMeta}>
                        <View style={[styles.levelTag, { borderColor: c.color + '66' }]}>
                          <Text style={[styles.levelText, { color: c.color }]}>
                            {c.level}
                          </Text>
                        </View>
                        <Text style={styles.metaDot}>·</Text>
                        <Text style={styles.metaText}>{c.lessons} lessons</Text>
                        <Text style={styles.metaDot}>·</Text>
                        <Text style={styles.metaText}>{c.minutes} min</Text>
                      </View>
                    </View>
                  </GlassCard>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Glossary */}
        <View style={{ marginTop: S.xxxl }}>
          <View style={{ paddingHorizontal: S.xl }}>
            <SectionHeader title="Hausa glossary" ha="Kamusun kuɗi" />
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: S.xl, gap: 12 }}
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
        <View style={{ height: insets.bottom }} />
      </ScrollView>
    </Background>
  );
}

const styles = StyleSheet.create({
  resume: { padding: 20, gap: 16 },
  resumeTop: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  resumeIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resumeKicker: {
    color: C.accent,
    fontFamily: FONT.sans,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  resumeTitle: {
    color: C.text,
    fontFamily: FONT.sans,
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginTop: 2,
  },
  resumeHa: {
    color: C.textMuted,
    fontFamily: FONT.sans,
    fontSize: 13,
  },
  barTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.10)',
    overflow: 'hidden',
  },
  barFill: {
    height: 8,
    borderRadius: 4,
    backgroundColor: C.accent,
  },
  resumeFoot: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  resumeFootText: {
    color: C.textMuted,
    fontFamily: FONT.sans,
    fontSize: 13,
    fontWeight: '600',
  },
  courseList: { gap: 12 },
  courseCard: {
    padding: 16,
    flexDirection: 'row',
    gap: 14,
    alignItems: 'flex-start',
  },
  courseIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  courseTitle: {
    color: C.text,
    fontFamily: FONT.sans,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  courseHa: {
    color: C.accent,
    fontFamily: FONT.sans,
    fontSize: 12,
    marginBottom: 4,
  },
  courseDesc: {
    color: C.textMuted,
    fontFamily: FONT.sans,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 2,
  },
  courseMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  levelTag: {
    borderWidth: 1,
    borderRadius: R.sm,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  levelText: {
    fontFamily: FONT.sans,
    fontSize: 11,
    fontWeight: '700',
  },
  metaDot: { color: C.textFaint },
  metaText: {
    color: C.textFaint,
    fontFamily: FONT.sans,
    fontSize: 12,
  },
  glossCard: {
    width: 200,
    backgroundColor: C.glass,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: R.lg,
    padding: 18,
  },
  glossHa: {
    color: C.accent,
    fontFamily: FONT.sans,
    fontSize: 22,
    fontWeight: '800',
  },
  glossEn: {
    color: C.text,
    fontFamily: FONT.sans,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  glossMeaning: {
    color: C.textMuted,
    fontFamily: FONT.sans,
    fontSize: 13,
    lineHeight: 19,
  },
});
