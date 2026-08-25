import { useId } from 'react';
import Svg, { Path, Rect, Defs, LinearGradient, Stop } from 'react-native-svg';

import type { Candle } from '@/utils';

interface Point {
  x: number;
  y: number;
}

interface ChartProps {
  data: number[];
  width: number;
  height: number;
  stroke: string;
  strokeWidth?: number;
  fill?: boolean;
  fillFrom?: string;
  fillTo?: string;
  curved?: boolean;
}

function buildPoints(data: number[], width: number, height: number, pad: number): Point[] {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const stepX = width / (data.length - 1);
  return data.map((d, i) => ({
    x: i * stepX,
    y: height - pad - ((d - min) / range) * (height - pad * 2),
  }));
}

/** Catmull-Rom -> cubic bezier for an elegant smooth line. */
function smoothPath(pts: Point[]): string {
  if (pts.length < 2) return '';
  const t = 0.18;
  let d = `M ${pts[0].x},${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1x = p1.x + (p2.x - p0.x) * t;
    const c1y = p1.y + (p2.y - p0.y) * t;
    const c2x = p2.x - (p3.x - p1.x) * t;
    const c2y = p2.y - (p3.y - p1.y) * t;
    d += ` C ${c1x},${c1y} ${c2x},${c2y} ${p2.x},${p2.y}`;
  }
  return d;
}

function linearPath(pts: Point[]): string {
  return pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`).join(' ');
}

export function Chart({
  data,
  width,
  height,
  stroke,
  strokeWidth = 2,
  fill = false,
  fillFrom,
  fillTo,
  curved = true,
}: ChartProps) {
  const uid = useId().replace(/[:]/g, '');
  const gradId = `grad-${uid}`;
  if (data.length < 2) return null;

  const pad = strokeWidth + 1;
  const pts = buildPoints(data, width, height, pad);
  const line = curved ? smoothPath(pts) : linearPath(pts);
  const area = `${line} L ${width},${height} L 0,${height} Z`;

  return (
    <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <Defs>
        <LinearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor={fillFrom ?? stroke} stopOpacity="0.28" />
          <Stop offset="100%" stopColor={fillTo ?? stroke} stopOpacity="0" />
        </LinearGradient>
      </Defs>
      {fill && <Path d={area} fill={`url(#${gradId})`} />}
      <Path
        d={line}
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </Svg>
  );
}

/* ---------------- Candlestick ---------------- */
export function Candlestick({
  data,
  width,
  height,
  upColor,
  downColor,
}: {
  data: Candle[];
  width: number;
  height: number;
  upColor: string;
  downColor: string;
}) {
  if (data.length < 2) return null;
  const padY = 6;
  const lows = data.map((d) => d.l);
  const highs = data.map((d) => d.h);
  const min = Math.min(...lows);
  const max = Math.max(...highs);
  const range = max - min || 1;
  const n = data.length;
  const slot = width / n;
  const bodyW = Math.max(2, slot * 0.62);

  const y = (v: number) => padY + (1 - (v - min) / range) * (height - padY * 2);

  return (
    <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {data.map((d, i) => {
        const cx = i * slot + slot / 2;
        const isUp = d.c >= d.o;
        const color = isUp ? upColor : downColor;
        const bodyTop = y(Math.max(d.o, d.c));
        const bodyH = Math.max(1.5, Math.abs(y(d.o) - y(d.c)));
        return (
          <g key={i}>
            <Rect
              x={cx - 0.6}
              y={y(d.h)}
              width={1.2}
              height={Math.max(1, y(d.l) - y(d.h))}
              fill={color}
              opacity={0.9}
            />
            <Rect
              x={cx - bodyW / 2}
              y={bodyTop}
              width={bodyW}
              height={bodyH}
              fill={color}
              rx={1}
            />
          </g>
        );
      })}
    </Svg>
  );
}
