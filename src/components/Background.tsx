import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { C } from '@/theme';

/** Deep green gradient backdrop with soft brand glows. */
export function Background({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.fill} pointerEvents="box-none">
      <LinearGradient
        colors={[C.bg0, C.bg1, C.bg2, C.bg0]}
        locations={[0, 0.35, 0.7, 1]}
        style={StyleSheet.absoluteFill}
      />
      {/* ambient glows */}
      <View style={styles.glowTop} pointerEvents="none" />
      <View style={styles.glowBottom} pointerEvents="none" />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    backgroundColor: C.bg0,
    overflow: 'hidden',
  },
  glowTop: {
    position: 'absolute',
    top: -160,
    right: -100,
    width: 420,
    height: 420,
    borderRadius: 210,
    backgroundColor: C.glowSoft,
    opacity: 0.9,
  },
  glowBottom: {
    position: 'absolute',
    bottom: -180,
    left: -140,
    width: 380,
    height: 380,
    borderRadius: 190,
    backgroundColor: 'rgba(10, 166, 99, 0.14)',
  },
});
