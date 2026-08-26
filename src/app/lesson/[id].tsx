import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import { Button, Card, ScreenHeader, SectionTitle } from '@/components/primitives';
import {
  COURSES,
  getCourse,
  getLessonByCourse,
} from '@/services/learning';
import { C, F, R, S, registerStyles, STATUSBAR } from '@/theme';

export default function LessonDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const course = getCourse(String(id));
  const lesson = getLessonByCourse(String(id));
  const [done, setDone] = useState(false);

  if (!lesson || !course) {
    return (
      <View style={styles.screen}>
        <ScreenHeader title="Lesson" showBack />
        <Text style={{ color: C.muted, padding: S.xl }}>Lesson not found.</Text>
      </View>
    );
  }

  const idx = COURSES.findIndex((c) => c.id === course.id);
  const next = COURSES[idx + 1];

  return (
    <View style={styles.screen}>
      <StatusBar style={STATUSBAR} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <ScreenHeader title={course.category} subtitle="Lesson" showBack />

        <View style={{ paddingHorizontal: S.xl, marginTop: S.sm }}>
          <View style={[styles.badge, { backgroundColor: `${course.color}1F` }]}>
            <Ionicons name={course.icon as never} size={15} color={course.color} />
            <Text style={[styles.badgeText, { color: course.color }]}>
              {course.level} · {lesson.minutes} min read
            </Text>
          </View>
          <Text style={styles.title}>{lesson.title}</Text>

          {/* progress */}
          <View style={styles.bar}>
            <View
              style={[styles.barFill, { width: `${Math.max(course.progress, done ? 100 : 0)}%`, backgroundColor: course.color }]}
            />
          </View>
          <Text style={styles.progressText}>
            {done ? 100 : course.progress}% complete
          </Text>
        </View>

        {/* body */}
        <View style={{ paddingHorizontal: S.xl, marginTop: S.xxl }}>
          <Card pad={S.lg} radius={R.xl}>
            {lesson.body.map((p, i) => (
              <Text key={i} style={styles.bodyText}>
                {p}
              </Text>
            ))}
          </Card>
        </View>

        {/* takeaways */}
        <View style={{ paddingHorizontal: S.xl, marginTop: S.xxl }}>
          <SectionTitle title="Key takeaways" />
          <Card pad={S.lg}>
            {lesson.takeaways.map((t, i) => (
              <View
                key={i}
                style={[styles.takeRow, i < lesson.takeaways.length - 1 && styles.takeDiv]}
              >
                <View style={styles.check}>
                  <Ionicons name="checkmark" size={13} color={C.white} />
                </View>
                <Text style={styles.takeText}>{t}</Text>
              </View>
            ))}
          </Card>
        </View>

        {/* mark complete */}
        <View style={{ paddingHorizontal: S.xl, marginTop: S.xxl }}>
          <Pressable
            onPress={() => setDone((v) => !v)}
            style={({ pressed }) => [pressed && { opacity: 0.9 }]}
          >
            <Card
              pad={S.lg}
              radius={R.lg}
              style={{ backgroundColor: done ? C.greenSoft : C.white }}
            >
              <View style={styles.doneRow}>
                <View style={[styles.doneCircle, { backgroundColor: done ? C.green : 'transparent', borderColor: done ? C.green : C.hairline }]}>
                  {done ? <Ionicons name="checkmark" size={16} color={C.white} /> : null}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.doneTitle}>
                    {done ? 'Lesson complete!' : 'Mark as complete'}
                  </Text>
                  <Text style={styles.doneSub}>
                    {done ? 'Well done — keep the streak going.' : 'Tap when you’ve finished reading.'}
                  </Text>
                </View>
              </View>
            </Card>
          </Pressable>
        </View>

        {/* next */}
        <View style={{ paddingHorizontal: S.xl, marginTop: S.lg }}>
          {next ? (
            <Button
              label={`Next: ${next.title}`}
              icon="arrow-forward"
              variant="primary"
              block
              onPress={() => router.push(`/lesson/${next.id}`)}
            />
          ) : (
            <Button
              label="Back to Learn"
              icon="book"
              variant="light"
              block
              onPress={() => router.push('/learn')}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const makeStyles = () => StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.canvas },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: R.pill,
  },
  badgeText: {
    fontFamily: F.sans,
    fontSize: 12,
    fontWeight: '700',
  },
  title: {
    color: C.ink,
    fontFamily: F.sans,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.8,
    lineHeight: 34,
    marginTop: S.md,
  },
  bar: {
    height: 7,
    borderRadius: 4,
    backgroundColor: C.canvasAlt,
    overflow: 'hidden',
    marginTop: S.lg,
  },
  barFill: { height: 7, borderRadius: 4 },
  progressText: {
    color: C.muted,
    fontFamily: F.sans,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 6,
  },
  bodyText: {
    color: C.ink2,
    fontFamily: F.sans,
    fontSize: 15.5,
    lineHeight: 24,
    marginBottom: S.md,
  },
  takeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: S.md,
  },
  takeDiv: { borderBottomWidth: 1, borderBottomColor: C.hairlineSoft },
  check: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: C.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  takeText: {
    flex: 1,
    color: C.ink,
    fontFamily: F.sans,
    fontSize: 14.5,
    lineHeight: 21,
  },
  doneRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  doneCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneTitle: {
    color: C.ink,
    fontFamily: F.sans,
    fontSize: 15,
    fontWeight: '700',
  },
  doneSub: {
    color: C.muted,
    fontFamily: F.sans,
    fontSize: 12.5,
    marginTop: 1,
  },
});
let styles = makeStyles();
registerStyles(() => { styles = makeStyles(); });
