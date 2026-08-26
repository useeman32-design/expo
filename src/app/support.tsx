import { useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import { Card, ScreenHeader } from '@/components/primitives';
import { FAQS } from '@/services/support';
import { C, F, R, S } from '@/theme';

export default function SupportScreen() {
  const [openId, setOpenId] = useState<string | null>(FAQS[0]?.id ?? null);

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 48 }}>
        <ScreenHeader title="Help & Support" subtitle="Answers and ways to reach us" />

        {/* contact actions */}
        <View style={{ paddingHorizontal: S.xl, marginTop: S.sm, gap: S.md }}>
          <View style={styles.contactRow}>
            <ContactCard
              icon="chatbubble-ellipses-outline"
              color="#0E8A57"
              title="Live chat"
              sub="Mon–Fri, 8am–6pm WAT"
              onPress={() => undefined}
            />
            <ContactCard
              icon="mail-outline"
              color="#1F7AE0"
              title="Email us"
              sub="support@stocksx.ng"
              onPress={() => Linking.openURL('mailto:support@stocksx.ng').catch(() => undefined)}
            />
          </View>
          <View style={styles.contactRow}>
            <ContactCard
              icon="call-outline"
              color="#F6A623"
              title="Call"
              sub="+234 700 000 0000"
              onPress={() => Linking.openURL('tel:+2347000000000').catch(() => undefined)}
            />
            <ContactCard
              icon="logo-whatsapp"
              color="#0E9F5E"
              title="WhatsApp"
              sub="Fastest response"
              onPress={() => Linking.openURL('https://wa.me/2347000000000').catch(() => undefined)}
            />
          </View>
        </View>

        {/* FAQ */}
        <View style={{ paddingHorizontal: S.xl, marginTop: S.xxl }}>
          <Text style={styles.section}>Frequently asked questions</Text>
          <View style={{ gap: S.sm, marginTop: S.sm }}>
            {FAQS.map((f) => {
              const open = openId === f.id;
              return (
                <Card key={f.id} pad={0} radius={R.lg}>
                  <Pressable
                    style={styles.faqRow}
                    onPress={() => setOpenId(open ? null : f.id)}
                  >
                    <Text style={styles.faqQ}>{f.q}</Text>
                    <Ionicons
                      name={open ? 'chevron-up' : 'chevron-down'}
                      size={16}
                      color={C.faint}
                    />
                  </Pressable>
                  {open ? (
                    <View style={styles.faqBody}>
                      <Text style={styles.faqA}>{f.a}</Text>
                      <View style={styles.faqTag}>
                        <Text style={styles.faqTagText}>{f.category}</Text>
                      </View>
                    </View>
                  ) : null}
                </Card>
              );
            })}
          </View>
        </View>

        <View style={{ paddingHorizontal: S.xl, marginTop: S.xl }}>
          <Text style={styles.note}>
            A ticket system with in-app messaging arrives with the live backend.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

function ContactCard({
  icon,
  color,
  title,
  sub,
  onPress,
}: {
  icon: string;
  color: string;
  title: string;
  sub: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.contactCard, pressed && { opacity: 0.85 }]}
    >
      <View style={[styles.contactIcon, { backgroundColor: `${color}16` }]}>
        <Ionicons name={icon as never} size={20} color={color} />
      </View>
      <Text style={styles.contactTitle}>{title}</Text>
      <Text style={styles.contactSub} numberOfLines={1}>
        {sub}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.canvas },
  contactRow: { flexDirection: 'row', gap: S.md },
  contactCard: {
    flex: 1,
    backgroundColor: C.white,
    borderRadius: R.lg,
    padding: S.lg,
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: C.hairline,
  },
  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: S.sm,
  },
  contactTitle: { color: C.ink, fontFamily: F.sans, fontSize: 14, fontWeight: '700' },
  contactSub: { color: C.muted, fontFamily: F.sans, fontSize: 11.5, marginTop: 2 },
  section: {
    color: C.muted,
    fontFamily: F.sans,
    fontSize: 13,
    fontWeight: '700',
    marginLeft: S.xs,
  },
  faqRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: S.md,
    padding: S.lg,
  },
  faqQ: { color: C.ink, fontFamily: F.sans, fontSize: 14, fontWeight: '600', flex: 1 },
  faqBody: { paddingHorizontal: S.lg, paddingBottom: S.lg },
  faqA: { color: C.ink2, fontFamily: F.sans, fontSize: 13.5, lineHeight: 20.5 },
  faqTag: {
    alignSelf: 'flex-start',
    backgroundColor: C.greenTint,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: R.pill,
    marginTop: S.md,
  },
  faqTagText: { color: C.green, fontFamily: F.sans, fontSize: 10.5, fontWeight: '700' },
  note: { color: C.faint, fontFamily: F.sans, fontSize: 12, lineHeight: 18, textAlign: 'center' },
});
