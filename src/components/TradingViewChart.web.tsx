import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import type { Stock } from '@/types';
import { generateSeries, type Timeframe } from '@/services/chartData';
import { C, F } from '@/theme';

/**
 * Web implementation of the price chart: renders TradingView Lightweight
 * Charts directly into the DOM (no WebView). Platform-override of
 * TradingViewChart.tsx — same props, same generated data, same look.
 */
const CDN = 'https://unpkg.com/lightweight-charts@4.2.3/dist/lightweight-charts.standalone.production.js';

type LCChart = any;

function loadChartLib(): Promise<any> {
  return new Promise((resolve) => {
    const w = window as any;
    if (w.LightweightCharts) return resolve(w.LightweightCharts);
    const s = document.createElement('script');
    s.src = CDN;
    s.onload = () => resolve((window as any).LightweightCharts || null);
    s.onerror = () => resolve(null);
    document.head.appendChild(s);
  });
}

export function TradingViewChart({
  stock,
  type = 'candles',
  timeframe = '3M',
  height = 360,
}: {
  stock: Stock;
  type?: 'line' | 'candles';
  timeframe?: Timeframe;
  height?: number;
}) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let chart: LCChart = null;
    let cancelled = false;

    (async () => {
      const LC = await loadChartLib();
      if (!LC || cancelled || !hostRef.current) return;

      const data = generateSeries(stock.id, stock.price, stock.volume, timeframe);
      const mode = type === 'line' ? 'area' : 'candles';

      chart = LC.createChart(hostRef.current, {
        autoSize: true,
        layout: {
          background: { type: 'solid', color: '#ffffff' },
          textColor: '#6C7771',
          fontSize: 11,
          fontFamily: 'Inter, system-ui, sans-serif',
        },
        grid: {
          vertLines: { color: 'rgba(15,23,42,0.05)' },
          horzLines: { color: 'rgba(15,23,42,0.05)' },
        },
        crosshair: {
          mode: LC.CrosshairMode.Normal,
          vertLine: { labelBackgroundColor: '#0E8A57' },
          horzLine: { labelBackgroundColor: '#0E8A57' },
        },
        rightPriceScale: { borderColor: 'rgba(15,23,42,0.12)' },
        timeScale: {
          borderColor: 'rgba(15,23,42,0.12)',
          timeVisible: true,
          secondsVisible: false,
          rightOffset: 2,
        },
        handleScale: true,
        handleScroll: true,
      });

      const priceFmt = { type: 'price', precision: 2, minMove: 0.01 };
      let series: any;
      if (mode === 'candles') {
        series = chart.addCandlestickSeries({
          upColor: '#0E9F5E',
          downColor: '#DD4B3E',
          borderUpColor: '#0E9F5E',
          borderDownColor: '#DD4B3E',
          wickUpColor: '#0E9F5E',
          wickDownColor: '#DD4B3E',
          priceFormat: priceFmt,
        });
        series.setData(data.map((d) => ({ time: d.time, open: d.o, high: d.h, low: d.l, close: d.c })));
      } else {
        series = chart.addAreaSeries({
          lineColor: '#0E8A57',
          topColor: 'rgba(14,138,87,0.28)',
          bottomColor: 'rgba(14,138,87,0)',
          lineWidth: 2,
          priceFormat: priceFmt,
        });
        series.setData(data.map((d) => ({ time: d.time, value: d.c })));
      }

      const vol = chart.addHistogramSeries({ priceFormat: { type: 'volume' }, priceScaleId: '' });
      vol.priceScale().applyOptions({ scaleMargins: { top: 0.82, bottom: 0 } });
      vol.setData(
        data.map((d) => ({
          time: d.time,
          value: d.v,
          color: d.c >= d.o ? 'rgba(14,159,94,0.30)' : 'rgba(221,75,62,0.30)',
        })),
      );

      chart.timeScale().fitContent();
      if (!cancelled) setReady(true);
    })();

    return () => {
      cancelled = true;
      if (chart) {
        try {
          chart.remove();
        } catch {
          /* ignore */
        }
      }
    };
  }, [stock.id, stock.price, stock.volume, type, timeframe]);

  return (
    <View style={[styles.wrap, { height }]}>
      <View ref={hostRef as never} style={styles.host} />
      {!ready ? (
        <View style={styles.loading} pointerEvents="none">
          <ActivityIndicator color={C.green} />
          <Text style={styles.loadingText}>Loading chart…</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: C.white,
  },
  host: { flex: 1 },
  loading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  loadingText: {
    color: C.muted,
    fontFamily: F.sans,
    fontSize: 12,
    fontWeight: '600',
  },
});
