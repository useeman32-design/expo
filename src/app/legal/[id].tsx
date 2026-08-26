import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import { Card, ScreenHeader } from '@/components/primitives';
import { getLegalDoc } from '@/services/legal';
import { C, F, R, S } from '@/theme';

export default function LegalDocScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const doc = getLegalDoc(String(id ?? ''));

  if (!doc) {
    return (
      <View style={styles.screen}>
        <StatusBar style="dark" />
        <ScreenHeader title="Document" showBack />
        <View style={{ padding: S.xl, marginTop: S.xxl, alignItems: 'center' }}>
          <Ionicons name="document-outline" size={40} color={C.faint} />
          <Text style={styles.missing}>Document not found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 48 }}>
        <ScreenHeader title={doc.title} subtitle={doc.subtitle} showBack />

        <View style={{ paddingHorizontal: S.xl, marginTop: S.sm }}>
          <Card pad={S.md} radius={R.md} style={styles.metaCard}>
            <View style={styles.metaRow}>
              <View style={[styles.metaIcon, { backgroundColor: `${doc.color}18` }]}>
                <Ionicons name={doc.icon as never} size={18} color={doc.color} />
              </View>
              <Text style={styles.metaText}>Last updated · {doc.updated}</Text>
            </View>
          </Card>
        </View>

        <View style={{ paddingHorizontal: S.xl, marginTop: S.lg, gap: S.md }}>
          {doc.sections.map((s) => (
            <Card key={s.heading} pad={S.xl} radius={R.lg}>
              <Text style={styles.heading}>{s.heading}</Text>
              {s.body.map((p, i) => (
                <Text key={i} style={styles.paragraph}>
                  {p}
                </Text>
              ))}
            </Card>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.canvas },
  missing: { color: C.muted, fontFamily: F.sans, fontSize: 14, marginTop: S.md },
  metaCard: { backgroundColor: C.white },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  metaIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaText: { color: C.muted, fontFamily: F.sans, fontSize: 12.5, fontWeight: '600' },
  heading: { color: C.ink, fontFamily: F.display, fontSize: 15.5, fontWeight: '700' },
  paragraph: {
    color: C.ink2,
    fontFamily: F.sans,
    fontSize: 14,
    lineHeight: 22,
    marginTop: S.md,
  },
});
