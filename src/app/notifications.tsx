import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import type { NotificationItem } from '@/types';
import { Card, ScreenHeader } from '@/components/primitives';
import { getNotifications } from '@/services/notifications';
import { C, F, R, S } from '@/theme';

export default function NotificationsScreen() {
  const [items, setItems] = useState<NotificationItem[]>(() => getNotifications());

  const unread = items.filter((n) => !n.read).length;
  const markAll = () => setItems((arr) => arr.map((n) => ({ ...n, read: true })));
  const markRead = (id: string) =>
    setItems((arr) => arr.map((n) => (n.id === id ? { ...n, read: true } : n)));

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />
      <ScreenHeader
        title="Notifications"
        subtitle={unread ? `${unread} unread` : "You're all caught up"}
        showBack
        right={
          unread ? (
            <Pressable onPress={markAll} style={styles.markAllBtn}>
              <Text style={styles.markAllText}>Mark all read</Text>
            </Pressable>
          ) : undefined
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: S.xl, paddingTop: S.sm, paddingBottom: 40 }}
      >
        {items.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="notifications-off-outline" size={46} color={C.faint} />
            <Text style={styles.emptyTitle}>No notifications</Text>
            <Text style={styles.emptySub}>Price alerts and updates will appear here.</Text>
          </View>
        ) : (
          items.map((n, i) => (
            <NotifCard key={n.id} n={n} last={i === items.length - 1} onPress={() => markRead(n.id)} />
          ))
        )}
      </ScrollView>
    </View>
  );
}

function NotifCard({
  n,
  last,
  onPress,
}: {
  n: NotificationItem;
  last: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [pressed && { opacity: 0.92 }]}>
      <Card pad={S.lg} radius={R.lg} style={!last ? { marginBottom: S.md } : undefined}>
        <View style={styles.row}>
          <View style={[styles.icon, { backgroundColor: `${n.color}1F` }]}>
            <Ionicons name={n.icon as never} size={20} color={n.color} />
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.titleRow}>
              <Text style={styles.title} numberOfLines={1}>
                {n.title}
              </Text>
              {!n.read ? <View style={styles.unreadDot} /> : null}
            </View>
            <Text style={styles.body} numberOfLines={2}>
              {n.body}
            </Text>
            <Text style={styles.time}>{n.time}</Text>
          </View>
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.canvas },
  markAllBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: R.pill,
    backgroundColor: C.greenSoft,
  },
  markAllText: {
    color: C.greenDark,
    fontFamily: F.sans,
    fontSize: 13,
    fontWeight: '700',
  },
  empty: { alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  emptyTitle: {
    color: C.ink,
    fontFamily: F.sans,
    fontSize: 17,
    fontWeight: '700',
    marginTop: S.md,
  },
  emptySub: {
    color: C.muted,
    fontFamily: F.sans,
    fontSize: 13.5,
    marginTop: 4,
    textAlign: 'center',
  },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  icon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: {
    color: C.ink,
    fontFamily: F.sans,
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
  },
  body: {
    color: C.ink2,
    fontFamily: F.sans,
    fontSize: 13.5,
    fontWeight: '500',
    lineHeight: 19,
    marginTop: 3,
  },
  time: {
    color: C.faint,
    fontFamily: F.sans,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 6,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.green,
    marginLeft: 8,
  },
});
