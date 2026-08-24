import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Background } from '@/components/Background';
import {
  Avatar,
  ChangePill,
  GlassCard,
  HalalBadge,
  IconButton,
  PrimaryButton,
  SectionHeader,
  StockLogo,
} from '@/components/ui';
import { Sparkline } from '@/components/Sparkline';
import { StockRow } from '@/components/StockRow';
import { CASH, STOCKS, getPortfolio } from '@/data/stocks';
import { GLOSSARY } from '@/data/lessons';
import { C, FONT, R, S } from '@/theme';
import { money, pct } from '@/utils';

const WATCHLIST = ['mtnn', 'dangcem', 'airtelafri', 'jaizbank', 'seplat'];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const portfolio = useMemo(() => getPortfolio(), []);
  const word = GLOSSARY[0];
  const watch = STOCKS.filter((s) => WATCHLIST.includes(s.id));
  const portfolioSpark = useMemo(
    () => STOCKS.find((s) => s.id === 'mtnn')!.spark,
    [],
  );

  return (
    <Background>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 130 }}
      >
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 6 }]}>
          <View style={styles.headerLeft}>
            <Avatar initials="YI" size={44} />
            <View>
              <Text style={styles.greeting}>Ina kwana, Yusuf 👋</Text>
              <Text style={styles.greetingSub}>Here’s your portfolio</Text>
            </View>
          </View>
          <IconButton name="notifications-outline" badge />
        </View>

        {/* Portfolio hero */}
        <GlassCard variant="green" style={styles.hero}>
          <View style={styles.heroTop}>
            <Text style={styles.heroLabel}>Total dukiya · Portfolio value</Text>
            <HalalBadge compliant />
          </View>
          <Text style={styles.heroValue}>{money(portfolio.value)}</Text>
          <View style={styles.heroChange}>
            <ChangePill value={portfolio.today} />
            <Text style={styles.heroChangeText}>
              {pct(portfolio.today)} today
            </Text>
            <View style={{ flex: 1 }} />
            <Sparkline data={portfolioSpark} width={110} height={36} />
          </View>

          <View style={styles.heroDivider} />
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>All-time P/L</Text>
              <Text
                style={[
                  styles.statValue,
                  {
                    color:
                      portfolio.pl >= 0 ? C.positive : C.negative,
                  },
                ]}
              >
                {money(portfolio.pl)}
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Available cash</Text>
              <Text style={styles.statValue}>{money(CASH)}</Text>
            </View>
          </View>

          <PrimaryButton
            label="Add money"
            icon="add-circle"
            onPress={() => router.push('/markets')}
            variant="solid"
          />
        </GlassCard>

        {/* Quick actions */}
        <View style={styles.quickRow}>
          <QuickAction icon="arrow-down-circle" label="Deposit" />
          <QuickAction icon="add-circle" label="Buy" />
          <QuickAction
            icon="swap-vertical"
            label="Trade"
            onPress={() => router.push('/markets')}
          />
          <QuickAction
            icon="school"
            label="Learn"
            onPress={() => router.push('/learn')}
          />
        </View>

        {/* Markets today */}
        <View style={styles.section}>
          <SectionHeader
            title="Markets today"
            ha="Kasuwar yau"
            action="See all"
            onAction={() => router.push('/markets')}
          />
          <View style={styles.indexRow}>
            <IndexCard
              title="NGX ASI"
              value="102,340"
              change={0.87}
              seed={3}
            />
            <IndexCard
              title="S&P 500"
              value="5,640"
              change={0.42}
              seed={9}
              usd
            />
          </View>
        </View>

        {/* Watchlist */}
        <View style={styles.section}>
          <SectionHeader
            title="Your watchlist"
            ha="Lissafin biyayya"
            action="See all"
            onAction={() => router.push('/markets')}
          />
          <GlassCard style={styles.listCard}>
            <View style={{ paddingHorizontal: 16 }}>
              {watch.map((s, i) => (
                <StockRow
                  key={s.id}
                  stock={s}
                  showHalal
                  last={i === watch.length - 1}
                />
              ))}
            </View>
          </GlassCard>
        </View>

        {/* Word of the day */}
        <View style={styles.section}>
          <SectionHeader title="Word of the day" ha="Kalmar rana" />
          <Pressable
            onPress={() => router.push('/learn')}
            style={({ pressed }) => pressed && { opacity: 0.85 }}
          >
            <GlassCard style={styles.wordCard}>
              <View style={styles.wordTop}>
                <StockLogo
                  ticker={word.en}
                  color={C.accent}
                  size={40}
                />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.wordHa}>{word.ha}</Text>
                  <Text style={styles.wordEn}>{word.en}</Text>
                </View>
                <Ionicons name="arrow-forward" size={18} color={C.accent} />
              </View>
              <Text style={styles.wordMeaning}>{word.meaning}</Text>
            </GlassCard>
          </Pressable>
        </View>
      </ScrollView>
    </Background>
  );
}

function QuickAction({
  icon,
  label,
  onPress,
}: {
  icon: string;
  label: string;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.qa, pressed && { opacity: 0.8 }]}
    >
      <View style={styles.qaCircle}>
        <Ionicons name={icon as never} size={22} color={C.accent} />
      </View>
      <Text style={styles.qaLabel}>{label}</Text>
    </Pressable>
  );
}

function IndexCard({
  title,
  value,
  change,
  seed,
  usd,
}: {
  title: string;
  value: string;
  change: number;
  seed: number;
  usd?: boolean;
}) {
  const data = useMemo(
    () =>
      Array.from({ length: 16 }, (_, i) => 100 + Math.sin(i / 2 + seed) * 6 + i * 0.4),
    [seed],
  );
  const up = change >= 0;
  return (
    <GlassCard style={styles.indexCard}>
      <Text style={styles.indexTitle}>{title}</Text>
      <Text style={styles.indexValue}>
        {usd ? '$' : '₦'}
        {value}
      </Text>
      <View style={styles.indexBottom}>
        <ChangePill value={change} showSign={false} />
        <Sparkline data={data} positive={up} width={50} height={24} fill={false} />
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: S.xl,
    paddingBottom: S.md,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  greeting: {
    color: C.text,
    fontFamily: FONT.sans,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  greetingSub: {
    color: C.textMuted,
    fontFamily: FONT.sans,
    fontSize: 13,
  },
  hero: { marginHorizontal: S.xl, padding: 22, gap: 4 },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  heroLabel: {
    color: C.textMuted,
    fontFamily: FONT.sans,
    fontSize: 13,
    fontWeight: '500',
  },
  heroValue: {
    color: C.text,
    fontFamily: FONT.sans,
    fontSize: 38,
    fontWeight: '800',
    letterSpacing: -1.2,
  },
  heroChange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
    marginBottom: 14,
  },
  heroChangeText: {
    color: C.textMuted,
    fontFamily: FONT.sans,
    fontSize: 13,
    fontWeight: '500',
  },
  heroDivider: {
    height: 1,
    backgroundColor: C.border,
    marginVertical: 4,
    marginBottom: 14,
  },
  statsRow: { flexDirection: 'row', marginBottom: 18 },
  stat: { flex: 1, gap: 4 },
  statDivider: { width: 1, backgroundColor: C.border, marginHorizontal: 4 },
  statLabel: {
    color: C.textFaint,
    fontFamily: FONT.sans,
    fontSize: 12,
    fontWeight: '500',
  },
  statValue: {
    color: C.text,
    fontFamily: FONT.mono,
    fontSize: 16,
    fontWeight: '700',
  },
  quickRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: S.xl,
    marginTop: S.lg,
    marginBottom: S.xl,
  },
  qa: { alignItems: 'center', gap: 6, flex: 1 },
  qaCircle: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: C.glass,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qaLabel: {
    color: C.textMuted,
    fontFamily: FONT.sans,
    fontSize: 12,
    fontWeight: '600',
  },
  section: { marginTop: S.xl, paddingHorizontal: S.xl },
  indexRow: { flexDirection: 'row', gap: 12 },
  indexCard: { flex: 1, padding: 16, gap: 8 },
  indexTitle: {
    color: C.textMuted,
    fontFamily: FONT.sans,
    fontSize: 13,
    fontWeight: '600',
  },
  indexValue: {
    color: C.text,
    fontFamily: FONT.mono,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  indexBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  listCard: { paddingVertical: 4 },
  wordCard: { padding: 18, gap: 14 },
  wordTop: { flexDirection: 'row', alignItems: 'center' },
  wordHa: {
    color: C.accent,
    fontFamily: FONT.sans,
    fontSize: 20,
    fontWeight: '800',
  },
  wordEn: {
    color: C.textMuted,
    fontFamily: FONT.sans,
    fontSize: 13,
  },
  wordMeaning: {
    color: C.text,
    fontFamily: FONT.sans,
    fontSize: 14,
    lineHeight: 21,
  },
});
