import { useMemo, useState } from 'react';
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import {
  Avatar,
  Card,
  ChangePill,
  IconBtn,
  LiveDot,
  SectionTitle,
} from '@/components/primitives';
import { Chart } from '@/components/Chart';
import { StockRow } from '@/components/StockRow';
import { IndexCard } from '@/components/IndexCard';
import { LearnCard } from '@/components/LearnCard';
import { QuickAction } from '@/components/QuickAction';
import { TransferSheet } from '@/components/TransferSheet';
import { PromoCarousel } from '@/components/PromoCarousel';
import { PROMOTIONS } from '@/services/promotions';
import { BalanceEyeButton, HiddenAmount, HiddenStars } from '@/components/HiddenAmount';
import { useStore } from '@/store';
import { getStock } from '@/services/marketData';
import { getIndices } from '@/services/marketData';
import { getPortfolio } from '@/services/portfolio';
import {
  getCourses,
  getContinueLearning,
} from '@/services/learning';
import { C, F, R, S, SH, registerStyles } from '@/theme';
import { genSpark, money, pct } from '@/utils';

const WATCH = ['mtnn', 'gtco', 'zenith', 'dangcem'];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const store = useStore();
  const portfolio = useMemo(() => getPortfolio(), []);
  const upToday = portfolio.todayPl >= 0;
  const upTodayPct = portfolio.todayPct >= 0;
  const [transfer, setTransfer] = useState<{ open: boolean; mode: 'deposit' | 'withdraw' }>({
    open: false,
    mode: 'deposit',
  });
  const indices = useMemo(() => getIndices().slice(0, 3), []);
  const watch = useMemo(() => WATCH.map((id) => getStock(id)!).filter(Boolean), []);
  const courses = useMemo(() => getCourses().filter((c) => !c.readTime || c.progress === 0).slice(0, 6), []);
  const cont = useMemo(() => getContinueLearning(), []);
  const heroSpark = useMemo(() => genSpark(7, 34, 0.02, 0.006), []);

  const heroH = Math.max(Math.round(Dimensions.get('window').height * 0.34), 300);

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <ScrollView
        bounces
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 110 }}
      >
        {/* ---------- GREEN HERO ---------- */}
        <LinearGradient
          colors={[C.hero1, C.hero2, C.hero3]}
          locations={[0, 0.55, 1]}
          style={[styles.hero, { height: heroH }]}
        >
          <View style={[styles.heroInner, { paddingTop: insets.top + 10 }]}>
            {/* header */}
            <View style={styles.heroHeader}>
              <View style={styles.heroGreet}>
                <Avatar initials="U" size={46} ring />
                <View>
                  <Text style={styles.greetSmall}>Good morning 👋</Text>
                  <Text style={styles.greetName}>Hi, Usman</Text>
                </View>
              </View>
              <View style={styles.heroIcons}>
                <IconBtn name="notifications-outline" onPress={() => router.push('/notifications')} />
                <IconBtn name="settings-outline" onPress={() => router.push('/settings')} />
              </View>
            </View>

            {/* status pills */}
            <View style={styles.pillRow}>
              <View style={styles.solidPill}>
                <LiveDot color={C.white} />
                <Text style={styles.solidPillText}>Market Open</Text>
              </View>
              <View style={styles.ghostPill}>
                <Text style={styles.ghostPillText}>NGX</Text>
              </View>
              <View style={styles.ghostPill}>
                <Text style={styles.ghostPillText}>₦ NGN</Text>
              </View>
            </View>

            <View style={{ flex: 1 }} />

            {/* portfolio value + chart (lower portion) */}
            <View style={styles.heroValueBlock}>
              <View style={styles.heroLabelRow}>
                <Text style={styles.heroLabel}>Total Portfolio Value</Text>
                <BalanceEyeButton light />
              </View>
              <HiddenAmount value={portfolio.totalValue} style={styles.heroValue} />
              <View style={styles.heroChangeRow}>
                <View style={[styles.whitePill, !upTodayPct && styles.whitePillDown]}>
                  <Ionicons name={upTodayPct ? 'caret-up' : 'caret-down'} size={11} color={C.white} />
                  <Text style={styles.whitePillText}>{pct(portfolio.todayPct)}</Text>
                </View>
                <Text style={styles.heroChangeText}>
                  {store.balanceHidden ? '₦**** Today' : `${money(portfolio.todayPl)} Today`}
                </Text>
              </View>
            </View>

            <View style={{ marginTop: 14, marginBottom: 30 }}>
              <Chart
                data={heroSpark}
                width={Dimensions.get('window').width - S.xl * 2}
                height={62}
                stroke="rgba(255,255,255,0.95)"
                strokeWidth={2.2}
                fill
                fillFrom="rgba(255,255,255,0.32)"
                fillTo="rgba(255,255,255,0)"
              />
            </View>
          </View>
        </LinearGradient>

        {/* ---------- BRIDGE CARD (overlaps hero) ---------- */}
        <Card
          radius={R.xxl}
          style={[styles.bridge, SH.float]}
          pad={S.xl}
        >
          <View style={styles.bridgeRow}>
            <View style={styles.bridgeCol}>
              <Text style={styles.bridgeLabel}>Buying Power</Text>
              <HiddenStars value={portfolio.cash} style={styles.bridgeValue} />
            </View>
            <View style={styles.bridgeDivider} />
            <View style={styles.bridgeCol}>
              <Text style={styles.bridgeLabel}>Today’s P/L</Text>
              <Text style={[styles.bridgeValue, { color: upToday ? C.positive : C.negative }]}>
                {store.balanceHidden ? pct(portfolio.todayPct) : money(portfolio.todayPl)}
              </Text>
              <Text style={[styles.bridgeSub, { color: upTodayPct ? C.positive : C.negative }]}>
                {pct(portfolio.todayPct)}
              </Text>
            </View>
          </View>
        </Card>

        {/* ---------- QUICK ACTIONS ---------- */}
        <View style={styles.quickRow}>
          <QuickAction label="Buy" icon="add" tone="green" onPress={() => router.push('/markets')} />
          <QuickAction label="Sell" icon="remove" tone="red" onPress={() => router.push('/portfolio')} />
          <QuickAction label="Deposit" icon="arrow-down" tone="dark" onPress={() => setTransfer({ open: true, mode: 'deposit' })} />
          <QuickAction label="Withdraw" icon="arrow-up" tone="dark" onPress={() => setTransfer({ open: true, mode: 'withdraw' })} />
        </View>

        {/* ---------- BILL PAYMENTS ---------- */}
        <Text style={styles.billsCaption}>PAY BILLS</Text>
        <View style={styles.quickRow}>
          <QuickAction label="Airtime" icon="phone-portrait-outline" tone="airtime" onPress={() => router.push('/bills/airtime' as never)} />
          <QuickAction label="Data" icon="globe-outline" tone="data" onPress={() => router.push('/bills/data' as never)} />
          <QuickAction label="Electricity" icon="flash-outline" tone="electricity" onPress={() => router.push('/bills/electricity' as never)} />
          <QuickAction label="TV" icon="tv-outline" tone="tv" onPress={() => router.push('/bills/tv' as never)} />
        </View>

        {/* ---------- WATCHLIST ---------- */}
        <Section style={{ marginTop: S.xxxl }}>
          <SectionTitle title="My Watchlist" onAction={() => router.push('/markets')} />
          <Card pad={S.lg} style={{ paddingHorizontal: S.lg }}>
            {watch.map((s, i) => (
              <StockRow key={s.id} stock={s} last={i === watch.length - 1} />
            ))}
          </Card>
        </Section>

        {/* ---------- MARKET OVERVIEW ---------- */}
        <Section style={{ marginTop: S.xxl }}>
          <SectionTitle title="Market Overview" onAction={() => router.push('/markets')} />
          <View style={styles.indexRow}>
            {indices.map((ix) => (
              <IndexCard key={ix.id} index={ix} />
            ))}
          </View>
        </Section>

        {/* ---------- PROMO BANNERS (campaigns carousel) ---------- */}
        <Section style={{ marginTop: S.xxl }}>
          <PromoCarousel promos={PROMOTIONS} />
        </Section>

        {/* ---------- LEARN & GROW ---------- */}
        <Section style={{ marginTop: S.xxl }}>
          <SectionTitle title="Learn & Grow" action="See all" onAction={() => router.push('/learn')} />
          <Pressable
            onPress={() => router.push(`/lesson/${cont.id}`)}
            style={({ pressed }) => pressed && { opacity: 0.9 }}
          >
            <Card pad={S.lg} radius={R.xl}>
              <View style={styles.contRow}>
                <View style={[styles.contIcon, { backgroundColor: `${cont.color}1F` }]}>
                  <Ionicons name={cont.icon as never} size={22} color={cont.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.contKicker}>CONTINUE LEARNING</Text>
                  <Text style={styles.contTitle}>{cont.title}</Text>
                  <View style={styles.bar}>
                    <View
                      style={[styles.barFill, { width: `${cont.progress}%`, backgroundColor: cont.color }]}
                    />
                  </View>
                </View>
                <Ionicons name="play-circle" size={30} color={C.green} />
              </View>
            </Card>
          </Pressable>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginTop: S.md, marginHorizontal: -S.xl }}
            contentContainerStyle={{ paddingHorizontal: S.xl, gap: S.md }}
          >
            {courses.map((c) => (
              <LearnCard key={c.id} course={c} horizontal />
            ))}
          </ScrollView>
        </Section>
      </ScrollView>
      <TransferSheet
        visible={transfer.open}
        onClose={() => setTransfer((t) => ({ ...t, open: false }))}
        mode={transfer.mode}
      />
    </View>
  );
}

function Section({ children, style }: { children: React.ReactNode; style?: object }) {
  return <View style={[{ paddingHorizontal: S.xl }, style]}>{children}</View>;
}

const makeStyles = () => StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.canvas },
  hero: {
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden',
  },
  heroInner: { flex: 1, paddingHorizontal: S.xl },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroGreet: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  greetSmall: {
    color: 'rgba(255,255,255,0.82)',
    fontFamily: F.sans,
    fontSize: 13,
    fontWeight: '500',
  },
  greetName: {
    color: C.white,
    fontFamily: F.sans,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  heroIcons: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  pillRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 16 },
  solidPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: R.pill,
  },
  solidPillText: {
    color: C.white,
    fontFamily: F.sans,
    fontSize: 12,
    fontWeight: '700',
  },
  ghostPill: {
    backgroundColor: 'rgba(255,255,255,0.14)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: R.pill,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  ghostPillText: {
    color: 'rgba(255,255,255,0.92)',
    fontFamily: F.sans,
    fontSize: 12,
    fontWeight: '700',
  },
  heroValueBlock: { gap: 6 },
  heroLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  heroLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontFamily: F.sans,
    fontSize: 13.5,
    fontWeight: '600',
  },
  heroValue: {
    color: C.white,
    fontFamily: F.display,
    fontSize: 38,
    fontWeight: '800',
    letterSpacing: -1.2,
  },
  heroChangeRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 2 },
  whitePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: 'rgba(255,255,255,0.22)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: R.sm,
  },
  whitePillDown: { backgroundColor: C.negative },
  whitePillText: {
    color: C.white,
    fontFamily: F.sans,
    fontSize: 12,
    fontWeight: '700',
  },
  heroChangeText: {
    color: 'rgba(255,255,255,0.92)',
    fontFamily: F.sans,
    fontSize: 13,
    fontWeight: '600',
  },
  bridge: {
    marginTop: -34,
    marginHorizontal: S.xl,
  },
  bridgeRow: { flexDirection: 'row', alignItems: 'center' },
  bridgeCol: { flex: 1, gap: 3 },
  bridgeDivider: { width: 1, height: 38, backgroundColor: C.hairline, marginHorizontal: 6 },
  bridgeLabel: {
    color: C.muted,
    fontFamily: F.sans,
    fontSize: 12.5,
    fontWeight: '600',
  },
  bridgeValue: {
    color: C.ink,
    fontFamily: F.mono,
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  bridgeSub: {
    color: C.positive,
    fontFamily: F.sans,
    fontSize: 12,
    fontWeight: '700',
  },
  quickRow: {
    flexDirection: 'row',
    paddingHorizontal: S.xl,
    marginTop: S.lg,
    gap: S.sm,
  },
  billsCaption: {
    color: C.faint,
    fontFamily: F.sans,
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 1.2,
    paddingHorizontal: S.xl,
    marginTop: S.md,
    marginBottom: -4,
  },
  indexRow: { flexDirection: 'row', gap: S.md },
  contRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  contIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contKicker: {
    color: C.green,
    fontFamily: F.sans,
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 1,
  },
  contTitle: {
    color: C.ink,
    fontFamily: F.sans,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
    marginTop: 2,
    marginBottom: 7,
  },
  bar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: C.canvasAlt,
    overflow: 'hidden',
  },
  barFill: { height: 6, borderRadius: 3 },
});
let styles = makeStyles();
registerStyles(() => { styles = makeStyles(); });
