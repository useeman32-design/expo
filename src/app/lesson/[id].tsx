import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Background } from '@/components/Background';
import { AppHeader, GlassCard, PrimaryButton, SectionHeader } from '@/components/ui';
import {
  LESSONS,
  courseById,
  lessonById,
  lessonsForCourse,
} from '@/data/lessons';
import { C, FONT, R, S } from '@/theme';

export default function LessonDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const lesson = lessonById(String(id));
  const [done, setDone] = useState(false);

  if (!lesson) {
    return (
      <Background>
        <AppHeader title="Not found" showBack />
        <Text style={{ color: C.textMuted, padding: S.xl }}>
          This lesson could not be found.
        </Text>
      </Background>
    );
  }

  const course = courseById(lesson.courseId);
  const inCourse = lessonsForCourse(lesson.courseId);
  const pos = inCourse.findIndex((l) => l.id === lesson.id) + 1;
  const flatIdx = LESSONS.findIndex((l) => l.id === lesson.id);
  const next = LESSONS[flatIdx + 1];

  return (
    <Background>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <AppHeader title={course?.title ?? 'Lesson'} subtitle={course?.haTitle} showBack />

        <View style={{ paddingHorizontal: S.xl }}>
          {/* Title block */}
          <View style={styles.titleBlock}>
            <View
              style={[styles.courseBadge, { backgroundColor: (course?.color ?? C.accent) + '22' }]}
            >
              <Ionicons name={(course?.icon ?? 'book') as never} size={18} color={course?.color ?? C.accent} />
              <Text style={[styles.courseBadgeText, { color: course?.color ?? C.accent }]}>
                Lesson {pos} of {inCourse.length} · {lesson.minutes} min
              </Text>
            </View>
            <Text style={styles.lessonTitle}>{lesson.title}</Text>
            {lesson.haTitle ? (
              <Text style={styles.lessonHa}>{lesson.haTitle}</Text>
            ) : null}
          </View>

          {/* Body */}
          <View style={{ marginTop: S.xl }}>
            <SectionHeader title="Read" ha="Karanta" />
            <GlassCard style={styles.bodyCard}>
              {lesson.body.map((p, i) => (
                <Text key={i} style={styles.bodyText}>
                  {p}
                </Text>
              ))}
            </GlassCard>
          </View>

          {/* Takeaways */}
          <View style={{ marginTop: S.xl }}>
            <SectionHeader title="Key takeaways" ha="Abubuwan tunawa" />
            <GlassCard style={styles.takeCard}>
              {lesson.takeaways.map((t, i) => (
                <View key={i} style={[styles.takeRow, i < lesson.takeaways.length - 1 && styles.takeDiv]}>
                  <View style={styles.check}>
                    <Ionicons name="checkmark" size={14} color="#04140E" />
                  </View>
                  <Text style={styles.takeText}>{t}</Text>
                </View>
              ))}
            </GlassCard>
          </View>

          {/* Actions */}
          <Pressable
            onPress={() => setDone((v) => !v)}
            style={({ pressed }) => pressed && { opacity: 0.85 }}
          >
            <GlassCard variant={done ? 'green' : 'default'} style={styles.doneCard}>
                  <View style={[styles.doneCircle, { backgroundColor: done ? C.accent : 'transparent' }]}>
                    {done ? (
                      <Ionicons name="checkmark" size={20} color="#04140E" />
                    ) : null}
                  </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.doneTitle}>
                  {done ? 'Lesson complete!' : 'Mark as complete'}
                </Text>
                <Text style={styles.doneSub}>
                  {done ? 'Alhamdulillah — keep the streak going.' : 'Tap when you’ve finished reading.'}
                </Text>
              </View>
            </GlassCard>
          </Pressable>

          {next ? (
            <View style={styles.nextRow}>
              <PrimaryButton
                label={`Next: ${next.title}`}
                icon="arrow-forward"
                onPress={() => router.push(`/lesson/${next.id}`)}
              />
            </View>
          ) : (
            <View style={styles.nextRow}>
              <PrimaryButton label="Back to courses" icon="book" onPress={() => router.push('/learn')} />
            </View>
          )}
        </View>
      </ScrollView>
    </Background>
  );
}

const styles = StyleSheet.create({
  titleBlock: { gap: 12 },
  courseBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: R.pill,
  },
  courseBadgeText: {
    fontFamily: FONT.sans,
    fontSize: 12,
    fontWeight: '700',
  },
  lessonTitle: {
    color: C.text,
    fontFamily: FONT.sans,
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.8,
    lineHeight: 36,
  },
  lessonHa: {
    color: C.accent,
    fontFamily: FONT.sans,
    fontSize: 16,
    fontWeight: '600',
  },
  bodyCard: { padding: 20, gap: 16 },
  bodyText: {
    color: C.text,
    fontFamily: FONT.sans,
    fontSize: 15.5,
    lineHeight: 24,
  },
  takeCard: { padding: 18, gap: 4 },
  takeRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  takeDiv: { borderBottomWidth: 1, borderBottomColor: C.border },
  check: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: C.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  takeText: {
    flex: 1,
    color: C.text,
    fontFamily: FONT.sans,
    fontSize: 14.5,
    lineHeight: 21,
  },
  doneCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    marginTop: S.xl,
  },
  doneCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: C.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneTitle: {
    color: C.text,
    fontFamily: FONT.sans,
    fontSize: 15,
    fontWeight: '700',
  },
  doneSub: {
    color: C.textMuted,
    fontFamily: FONT.sans,
    fontSize: 13,
    marginTop: 1,
  },
  nextRow: { marginTop: S.lg },
});
