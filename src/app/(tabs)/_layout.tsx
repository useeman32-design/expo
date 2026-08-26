import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
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

function FloatingTabBar({ state, navigation }: TabBarProps) {
  const { mode } = useAppearance();
  const dark = mode === 'dark';
  return (
    <View style={styles.wrap} pointerEvents="box-none">
      <View style={styles.bar}>
        {/* frosted glass, WhatsApp-on-iPhone style: real blur of whatever
            scrolls beneath the bar, plus a translucent theme tint on top */}
        <BlurView
          intensity={dark ? 42 : 58}
          tint={dark ? 'dark' : 'light'}
          experimentalBlurMethod={Platform.OS === 'android' ? 'dimezisBlurView' : undefined}
          style={StyleSheet.absoluteFill}
        />
        <View
          style={[
            styles.glassTint,
            { backgroundColor: dark ? 'rgba(13,18,15,0.62)' : 'rgba(255,255,255,0.55)' },
            { borderColor: dark ? 'rgba(255,255,255,0.08)' : 'rgba(10,61,40,0.10)' },
          ]}
          pointerEvents="none"
        />
        {state.routes.map((route, i) => {
          const tab = TABS.find((t) => t.name === route.name)!;
          const active = i === state.index;
          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!active && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };
          const color = active ? C.green : C.faint;
          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              style={styles.item}
              android_ripple={{ color: 'transparent' }}
            >
              <View style={[styles.iconWrap, active && { backgroundColor: C.greenSoft }]}>
                <Ionicons
                  name={(active ? tab.iconActive : tab.icon) as IconName}
                  size={21}
                  color={color}
                />
              </View>
              <Text style={[styles.label, { color }]}>{tab.label}</Text>
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
  glassTint: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 1,
    borderRadius: R.xxl,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingVertical: 2,
  },
  iconWrap: {
    width: 48,
    height: 34,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: F.sans,
    fontSize: 10.5,
    fontWeight: '700',
  },
});
let styles = makeStyles();
registerStyles(() => { styles = makeStyles(); });
