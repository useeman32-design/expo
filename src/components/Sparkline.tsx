import { useId } from 'react';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';

import { C } from '@/theme';

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  positive?: boolean;
  strokeWidth?: number;
  fill?: boolean;
}

/** A smooth mini price chart used in stock rows and cards. */
export function Sparkline({
  data,
  width = 120,
  height = 40,
  positive = true,
  strokeWidth = 2,
  fill = true,
}: SparklineProps) {
  const uid = useId().replace(/:/g, '');
  const gradId = `spark-${positive ? 'up' : 'dn'}-${uid}`;

  if (data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const stepX = width / (data.length - 1);
  const pad = 3;

  const pts = data.map((d, i) => ({
    x: i * stepX,
    y: height - pad - ((d - min) / range) * (height - pad * 2),
  }));

  const line = pts
    .map((p, i) => (i === 0 ? `M${p.x},${p.y}` : `L${p.x},${p.y}`))
    .join(' ');
  const area = `${line} L${width},${height} L0,${height} Z`;
  const color = positive ? C.accent : C.negative;

  return (
    <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <Defs>
        <LinearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <Stop offset="100%" stopColor={color} stopOpacity="0" />
        </LinearGradient>
      </Defs>
      {fill && <Path d={area} fill={`url(#${gradId})`} />}
      <Path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </Svg>
  );
}
