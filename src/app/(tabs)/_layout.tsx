import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

import { C, FONT, SHADOW } from '@/theme';

type IconName = keyof typeof Ionicons.glyphMap;

interface TabRoute {
  key: string;
  name: string;
}
interface TabState {
  index: number;
  routes: TabRoute[];
}
interface TabNavigation {
  emit: (e: { type: string; target: string; canPreventDefault: boolean }) => {
    defaultPrevented: boolean;
  };
  navigate: (name: string) => void;
}
interface TabBarProps {
  state: TabState;
  navigation: TabNavigation;
}

const TABS: {
  name: string;
  label: string;
  icon: IconName;
  iconActive: IconName;
}[] = [
  { name: 'index', label: 'Home', icon: 'home-outline', iconActive: 'home' },
  { name: 'markets', label: 'Markets', icon: 'trending-up-outline', iconActive: 'trending-up' },
  { name: 'learn', label: 'Learn', icon: 'book-outline', iconActive: 'book' },
  { name: 'portfolio', label: 'Portfolio', icon: 'briefcase-outline', iconActive: 'briefcase' },
];

function FloatingTabBar({ state, navigation }: BottomTabBarProps) {
  return (
    <View style={styles.wrap}>
      <BlurView
        intensity={45}
        tint="dark"
        experimentalBlurMethod
        style={styles.bar}
      >
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
              navigation.navigate(route.name as never);
            }
          };
          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              style={styles.item}
              android_ripple={{ color: 'transparent' }}
            >
              <View style={[styles.pill, active && styles.pillActive]}>
                <Ionicons
                  name={(active ? tab.iconActive : tab.icon) as IconName}
                  size={22}
                  color={active ? C.accent : C.textFaint}
                />
                <Text
                  style={[
                    styles.label,
                    { color: active ? C.accent : C.textFaint },
                  ]}
                >
                  {tab.label}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </BlurView>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <FloatingTabBar {...props} />}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="markets" />
      <Tabs.Screen name="learn" />
      <Tabs.Screen name="portfolio" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 18,
    right: 18,
    bottom: 22,
  },
  bar: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: C.borderStrong,
    overflow: 'hidden',
    ...SHADOW.float,
  },
  item: {
    flex: 1,
  },
  pill: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    borderRadius: 24,
  },
  pillActive: {
    backgroundColor: C.glassGreen,
    ...SHADOW.glow,
  },
  label: {
    fontFamily: FONT.sans,
    fontSize: 10.5,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
