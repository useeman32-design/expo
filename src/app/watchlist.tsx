import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { Card, ScreenHeader, ChangePill, StockLogo } from '@/components/primitives';
import { useStore } from '@/store';
import { getStock } from '@/services/marketData';
import { getLogo } from '@/services/logos';
import { price as fmtPrice } from '@/utils';
import { C, F, R, S } from '@/theme';

export default function WatchlistScreen() {
  const router = useRouter();
  const { watchlist, toggleWatch } = useStore();
  const stocks = watchlist.map((id) => getStock(id)).filter((s) => s !== undefined);

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 48 }}>
        <ScreenHeader title="Watchlist" subtitle="Stocks you're tracking" />

        <View style={{ paddingHorizontal: S.xl, marginTop: S.sm, gap: S.sm }}>
          {stocks.length === 0 ? (
            <Card pad={S.xxl} radius={R.lg}>
              <View style={{ alignItems: 'center', gap: S.sm }}>
                <Ionicons name="star-outline" size={34} color={C.faint} />
                <Text style={styles.emptyTitle}>Nothing on your watchlist</Text>
                <Text style={styles.emptySub}>
                  Tap the star on any stock in Markets to track it here.
                </Text>
                <Pressable
                  onPress={() => router.push('/(tabs)/markets' as never)}
                  style={({ pressed }) => [styles.browse, pressed && { opacity: 0.85 }]}
                >
                  <Text style={styles.browseText}>Browse markets</Text>
                </Pressable>
              </View>
            </Card>
          ) : (
            stocks.map((s) => (
              <Card key={s!.id} pad={S.md} radius={R.md}>
                <View style={styles.row}>
                  <Pressable
                    style={styles.left}
                    onPress={() => router.push(`/stock/${s!.id}` as never)}
                  >
                    <StockLogo ticker={s!.ticker} color={s!.color} size={40} logo={getLogo(s!.id)} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.ticker}>{s!.ticker}</Text>
                      <Text style={styles.name} numberOfLines={1}>
                        {s!.name}
                      </Text>
                    </View>
                    <Text style={styles.price}>{fmtPrice(s!.price)}</Text>
                    <ChangePill value={s!.changePct} />
                  </Pressable>
                  <Pressable onPress={() => toggleWatch(s!.id)} style={styles.star}>
                    <Ionicons name="star" size={20} color="#F6A623" />
                  </Pressable>
                </View>
              </Card>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.canvas },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  left: { flexDirection: 'row', alignItems: 'center', gap: 11, flex: 1 },
  ticker: { color: C.ink, fontFamily: F.display, fontSize: 14.5, fontWeight: '700' },
  name: { color: C.muted, fontFamily: F.sans, fontSize: 11.5, marginTop: 1, maxWidth: 110 },
  price: { fontFamily: F.mono, fontSize: 14.5, fontWeight: '700', color: C.ink },
  star: { padding: 7 },
  emptyTitle: { color: C.ink, fontFamily: F.sans, fontSize: 15, fontWeight: '700' },
  emptySub: { color: C.muted, fontFamily: F.sans, fontSize: 13, lineHeight: 19, textAlign: 'center' },
  browse: {
    marginTop: S.xs,
    backgroundColor: C.green,
    paddingHorizontal: S.xl,
    paddingVertical: 12,
    borderRadius: R.md,
  },
  browseText: { color: C.white, fontFamily: F.sans, fontSize: 14, fontWeight: '700' },
});
