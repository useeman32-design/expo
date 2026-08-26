import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import { Card, ScreenHeader } from '@/components/primitives';
import { LEGAL_DOCS } from '@/services/legal';
import { C, F, R, S } from '@/theme';

export default function LegalScreen() {
  const router = useRouter();

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <ScreenHeader
          title="Legal & Policies"
          subtitle="Reviewed before you invest"
          showBack
        />
        <View style={{ paddingHorizontal: S.xl, marginTop: S.sm, gap: S.md }}>
          {LEGAL_DOCS.map((d) => (
            <Pressable key={d.id} onPress={() => router.push(`/legal/${d.id}` as never)}>
              <Card pad={S.lg} radius={R.lg}>
                <View style={styles.row}>
                  <View style={[styles.icon, { backgroundColor: `${d.color}18` }]}>
                    <Ionicons name={d.icon as never} size={20} color={d.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.title}>{d.title}</Text>
                    <Text style={styles.sub}>{d.subtitle}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={C.faint} />
                </View>
              </Card>
            </Pressable>
          ))}
        </View>

        <View style={{ paddingHorizontal: S.xl, marginTop: S.xl }}>
          <Text style={styles.note}>
            These documents are provided for information and must be reviewed by qualified
            Nigerian counsel before the platform opens for live trading.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.canvas },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  icon: { width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  title: { color: C.ink, fontFamily: F.sans, fontSize: 15, fontWeight: '700' },
  sub: { color: C.muted, fontFamily: F.sans, fontSize: 12.5, marginTop: 2 },
  note: {
    color: C.faint,
    fontFamily: F.sans,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
});
