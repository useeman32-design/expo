import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

import { useAppearance } from '@/appearance';
import { C, F, R, S, SH, registerStyles } from '@/theme';

type IconName = keyof typeof Ionicons.glyphMap;

const TABS: { name: string; label: string; icon: IconName; iconActive: IconName }[] = [
  { name: 'index', label: 'Home', icon: 'home-outline', iconActive: 'home' },
  { name: 'markets', label: 'Markets', icon: 'trending-up-outline', iconActive: 'trending-up' },
  { name: 'portfolio', label: 'Portfolio', icon: 'briefcase-outline', iconActive: 'briefcase' },
  { name: 'learn', label: 'Learn', icon: 'book-outline', iconActive: 'book' },
  { name: 'profile', label: 'Profile', icon: 'person-outline', iconActive: 'person' },
];

interface RouteLike {
  key: string;
  name: string;
}
interface NavLike {
  emit: (e: { type: string; target: string; canPreventDefault: boolean }) => {
    defaultPrevented: boolean;
  };
  navigate: (name: string) => void;
}
interface TabBarProps {
  state: { index: number; routes: RouteLike[] };
  navigation: NavLike;
  insets?: { bottom: number };
}

const PILL_W = 48;
const PILL_H = 34;

function FloatingTabBar({ state, navigation }: TabBarProps) {
  const { mode } = useAppearance();
  const dark = mode === 'dark';
  const [barW, setBarW] = useState(0);

  // continuous "position" of the active tab — animated so the highlight
  // glides across every intermediate button (WhatsApp-on-iPhone feel)
  const pos = useRef(new Animated.Value(state.index)).current;
  useEffect(() => {
    Animated.timing(pos, {
      toValue: state.index,
      duration: 420,
      easing: Easing.out(Easing.poly(4)),
      useNativeDriver: true,
    }).start();
  }, [state.index, pos]);

  const n = Math.max(state.routes.length, 1);
  const itemW = barW > 0 ? (barW - S.sm * 2) / n : 0;
  const pillX = (i: number) => S.sm + i * itemW + (itemW - PILL_W) / 2;
  const pillTranslate = pos.interpolate({
    inputRange: [0, n - 1],
    outputRange: [pillX(0), pillX(n - 1)],
  });

  return (
    <View style={styles.wrap} pointerEvents="box-none">
      <View style={styles.bar} onLayout={(e) => setBarW(e.nativeEvent.layout.width)}>
        {/* frosted glass, WhatsApp-on-iPhone style: real blur of whatever
            scrolls beneath the bar, plus a translucent theme tint on top */}
        <BlurView
          intensity={dark ? 42 : 58}
          tint={dark ? 'dark' : 'light'}
          experimentalBlurMethod={Platform.OS === 'android' ? 'dimezisBlurView' : undefined}
          style={styles.glassLayer}
        />
        <View
          style={[
            styles.glassLayer,
            styles.glassTint,
            { backgroundColor: dark ? 'rgba(13,18,15,0.62)' : 'rgba(255,255,255,0.55)' },
            { borderColor: dark ? 'rgba(255,255,255,0.08)' : 'rgba(10,61,40,0.10)' },
          ]}
          pointerEvents="none"
        />

        {/* sliding highlight — glides through intermediate tabs on jumps */}
        {barW > 0 ? (
          <Animated.View
            style={[styles.pill, { transform: [{ translateX: pillTranslate }] }]}
            pointerEvents="none"
          />
        ) : null}

        {state.routes.map((route, i) => {
          const tab = TABS.find((t) => t.name === route.name)!;
          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (i !== state.index && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };
          // how "lit" this tab is right now (1 = pill centered on it)
          const lit = pos.interpolate({
            inputRange: [i - 0.55, i, i + 0.55],
            outputRange: [0, 1, 0],
            extrapolate: 'clamp',
          });
          const dim = lit.interpolate({ inputRange: [0, 1], outputRange: [1, 0] });
          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              style={styles.item}
              android_ripple={{ color: 'transparent' }}
            >
              <View style={styles.iconWrap}>
                <Animated.View style={[styles.iconLayer, { opacity: dim }]}>
                  <Ionicons name={tab.icon as IconName} size={21} color={C.faint} />
                </Animated.View>
                <Animated.View style={[styles.iconLayer, { opacity: lit }]}>
                  <Ionicons name={tab.iconActive as IconName} size={21} color={C.green} />
                </Animated.View>
              </View>
              <View style={styles.labelWrap}>
                <Animated.Text style={[styles.label, { color: C.faint, opacity: dim }]}>
                  {tab.label}
                </Animated.Text>
                <Animated.Text style={[styles.label, styles.labelLit, { opacity: lit }]}>
                  {tab.label}
                </Animated.Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <FloatingTabBar {...(props as TabBarProps)} />}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="markets" />
      <Tabs.Screen name="portfolio" />
      <Tabs.Screen name="learn" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}

const makeStyles = () => StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: S.lg,
    right: S.lg,
    bottom: S.xl,
  },
  bar: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
    borderRadius: R.xxl,
    paddingVertical: 10,
    paddingHorizontal: S.sm,
    overflow: 'hidden',
    ...SH.float,
  },
  glassLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  glassTint: {
    borderWidth: 1,
    borderRadius: R.xxl,
  },
  pill: {
    position: 'absolute',
    top: 12,
    left: 0,
    width: PILL_W,
    height: PILL_H,
    borderRadius: 14,
    backgroundColor: C.greenSoft,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingVertical: 2,
  },
  iconWrap: {
    width: PILL_W,
    height: PILL_H,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelWrap: { height: 15, alignItems: 'center', justifyContent: 'center' },
  label: {
    fontFamily: F.sans,
    fontSize: 10.5,
    fontWeight: '700',
  },
  labelLit: {
    position: 'absolute',
    width: '100%',
    textAlign: 'center',
    color: C.green,
  },
});
let styles = makeStyles();
registerStyles(() => { styles = makeStyles(); });
