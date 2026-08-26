import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { C, F, registerStyles } from '@/theme';
import { compact } from '@/utils';

export interface DonutSlice {
  id: string;
  label: string;
  value: number;
  color: string;
}

/** Premium allocation donut (SVG, no deps). Center shows total. */
export function Donut({
  slices,
  size = 150,
  thickness = 16,
  centerLabel,
  centerValue,
}: {
  slices: DonutSlice[];
  size?: number;
  thickness?: number;
  centerLabel?: string;
  centerValue?: string;
}) {
  const total = slices.reduce((a, s) => a + s.value, 0) || 1;
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;

  const arcs = useMemo(() => {
    let offset = 0;
    return slices.map((s) => {
      const frac = s.value / total;
      const arc = { ...s, frac, offset };
      offset += frac;
      return arc;
    });
  }, [slices, total]);

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={C.hairline}
          strokeWidth={thickness}
          fill="none"
        />
        {arcs.map((a) => (
          <Circle
            key={a.id}
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke={a.color}
            strokeWidth={thickness}
            fill="none"
            strokeDasharray={`${a.frac * c} ${c}`}
            strokeDashoffset={-a.offset * c}
            strokeLinecap="butt"
            rotation={-90}
            originX={size / 2}
            originY={size / 2}
          />
        ))}
      </Svg>
      <View style={{ alignItems: 'center' }}>
        {centerLabel ? <Text style={styles.centerLabel}>{centerLabel}</Text> : null}
        {centerValue ? <Text style={styles.centerValue}>{centerValue}</Text> : null}
      </View>
    </View>
  );
}

/** Legend row with dot, ticker, share %. */
export function DonutLegend({ slices }: { slices: DonutSlice[] }) {
  const total = slices.reduce((a, s) => a + s.value, 0) || 1;
  return (
    <View style={styles.legend}>
      {slices.slice(0, 6).map((s) => (
        <View key={s.id} style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: s.color }]} />
          <Text style={styles.legendTicker}>{s.label}</Text>
          <Text style={styles.legendPct}>{((s.value / total) * 100).toFixed(1)}%</Text>
        </View>
      ))}
      {slices.length > 6 ? (
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: C.hairline }]} />
          <Text style={styles.legendTicker}>Other</Text>
          <Text style={styles.legendPct}>
            {(
              (slices.slice(6).reduce((a, s) => a + s.value, 0) / total) * 100
            ).toFixed(1)}
            %
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const makeStyles = () => StyleSheet.create({
  centerLabel: { color: C.muted, fontFamily: F.sans, fontSize: 11 },
  centerValue: {
    color: C.ink,
    fontFamily: F.display,
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  legendTicker: { color: C.ink, fontFamily: F.sans, fontSize: 12, fontWeight: '600' },
  legendPct: { color: C.muted, fontFamily: F.mono, fontSize: 12 },
});
let styles = makeStyles();
registerStyles(() => { styles = makeStyles(); });

export { compact };
