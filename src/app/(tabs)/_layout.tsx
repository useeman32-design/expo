import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

import { C, F, R, S, SH } from '@/theme';

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
  return (
    <View style={styles.wrap} pointerEvents="box-none">
      <View style={styles.bar}>
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

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: S.lg,
    right: S.lg,
    bottom: S.xl,
  },
  bar: {
    flexDirection: 'row',
    backgroundColor: C.white,
    borderRadius: R.xxl,
    paddingVertical: 10,
    paddingHorizontal: S.sm,
    ...SH.float,
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
