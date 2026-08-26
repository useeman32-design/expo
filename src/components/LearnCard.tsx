import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import type { Course } from '@/types';
import { C, F, R, S, registerStyles } from '@/theme';

export function LearnCard({
  course,
  horizontal = false,
}: {
  course: Course;
  horizontal?: boolean;
}) {
  const router = useRouter();
  return (
    <Pressable
      onPress={() => router.push(`/lesson/${course.id}`)}
      style={({ pressed }) => [
        horizontal ? styles.hCard : styles.card,
        pressed && { opacity: 0.85 },
      ]}
    >
      <View style={[styles.icon, { backgroundColor: `${course.color}1F` }]}>
        <Ionicons name={course.icon as never} size={20} color={course.color} />
      </View>
      <Text style={styles.title} numberOfLines={2}>
        {course.title}
      </Text>
      <Text style={styles.meta}>
        {course.readTime ?? `${course.minutes} min`} · {course.level}
      </Text>
      {course.progress > 0 ? (
        <View style={styles.bar}>
          <View
            style={[styles.barFill, { width: `${course.progress}%`, backgroundColor: course.color }]}
          />
        </View>
      ) : null}
    </Pressable>
  );
}

const base = {
  backgroundColor: C.card,
  borderRadius: R.lg,
  padding: S.lg,
  gap: 8,
  shadowColor: '#0A3D28',
  shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 0.05,
  shadowRadius: 10,
  elevation: 2,
};

const makeStyles = () => StyleSheet.create({
  card: { ...base },
  hCard: { ...base, width: 180 },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  title: {
    color: C.ink,
    fontFamily: F.sans,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
    lineHeight: 19,
  },
  meta: {
    color: C.muted,
    fontFamily: F.sans,
    fontSize: 12,
  },
  bar: {
    height: 5,
    borderRadius: 3,
    backgroundColor: C.canvasAlt,
    overflow: 'hidden',
    marginTop: 2,
  },
  barFill: {
    height: 5,
    borderRadius: 3,
  },
});
let styles = makeStyles();
registerStyles(() => { styles = makeStyles(); });
