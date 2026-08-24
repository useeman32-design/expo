import { StyleSheet, Text, View } from 'react-native';

import type { MarketIndex } from '@/types';
import { C, F, R, S } from '@/theme';
import { ChangePill } from '@/components/primitives';
import { Chart } from '@/components/Chart';

export function IndexCard({
  index,
  style,
}: {
  index: MarketIndex;
  style?: object;
}) {
  const up = index.changePct >= 0;
  return (
    <View style={[styles.card, style]}>
      <Text style={styles.short}>{index.short}</Text>
      <Text style={styles.value}>
        {index.value.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </Text>
      <View style={styles.bottom}>
        <ChangePill value={index.changePct} />
        <Chart
          data={index.spark}
          width={48}
          height={20}
          stroke={up ? C.positive : C.negative}
          strokeWidth={1.5}
          fill={false}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: C.card,
    borderRadius: R.lg,
    padding: S.lg,
    gap: 6,
    shadowColor: '#0A3D28',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  short: {
    color: C.muted,
    fontFamily: F.sans,
    fontSize: 12.5,
    fontWeight: '700',
  },
  value: {
    color: C.ink,
    fontFamily: F.mono,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  bottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
});
