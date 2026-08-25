import { useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';

import type { Stock } from '@/types';
import { generateSeries, type Timeframe } from '@/services/chartData';
import { C, F } from '@/theme';

/**
 * Professional price chart using TradingView Lightweight Charts (v4), matching
 * the reference app. Data is deterministically generated per stock + timeframe,
 * so EVERY stock renders (no external symbol resolution needed). Candlestick or
 * area mode, with a compressed volume histogram. Requires network for the lib.
 */
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
  const [ready, setReady] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const data = generateSeries(stock.id, stock.price, stock.volume, timeframe);
  const mode = type === 'line' ? 'area' : 'candles';
  const payload = JSON.stringify(data);

  const html = `<!DOCTYPE html><html><head>
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
<style>
  html,body{margin:0;padding:0;background:#ffffff;height:100%;overflow:hidden;}
  #chart{position:absolute;inset:0;}
</style></head>
<body>
<div id="chart"></div>
<script src="https://unpkg.com/lightweight-charts@4.2.3/dist/lightweight-charts.standalone.production.js"></script>
<script>
  (function(){
    function ready(){ try{ window.ReactNativeWebView && window.ReactNativeWebView.postMessage('ready'); }catch(e){} }
    var LC = window.LightweightCharts;
    if(!LC){ document.body.innerHTML = '<div style="font-family:sans-serif;color:#9AA49E;font-size:13px;text-align:center;padding:40px 20px">Chart could not load. Check your connection.</div>'; ready(); return; }
    try {
      var data = ${payload};
      var chart = LC.createChart(document.getElementById('chart'), {
        autoSize: true,
        layout: { background:{ type:'solid', color:'#ffffff' }, textColor:'#6C7771', fontSize:11, fontFamily:'Inter, system-ui, sans-serif' },
        grid: { vertLines:{ color:'rgba(15,23,42,0.05)' }, horzLines:{ color:'rgba(15,23,42,0.05)' } },
        crosshair: { mode: LC.CrosshairMode.Normal, vertLine:{ labelBackgroundColor:'#0E8A57' }, horzLine:{ labelBackgroundColor:'#0E8A57' } },
        rightPriceScale: { borderColor:'rgba(15,23,42,0.12)' },
        timeScale: { borderColor:'rgba(15,23,42,0.12)', timeVisible:true, secondsVisible:false, rightOffset:2 },
        handleScale: true,
        handleScroll: true
      });
      var priceFmt = { type:'price', precision:2, minMove:0.01 };
      var series;
      if(${JSON.stringify(mode)} === 'candles'){
        series = chart.addCandlestickSeries({ upColor:'#0E9F5E', downColor:'#DD4B3E', borderUpColor:'#0E9F5E', borderDownColor:'#DD4B3E', wickUpColor:'#0E9F5E', wickDownColor:'#DD4B3E', priceFormat: priceFmt });
        series.setData(data.map(function(d){ return { time:d.time, open:d.o, high:d.h, low:d.l, close:d.c }; }));
      } else {
        series = chart.addAreaSeries({ lineColor:'#0E8A57', topColor:'rgba(14,138,87,0.28)', bottomColor:'rgba(14,138,87,0)', lineWidth:2, priceFormat: priceFmt });
        series.setData(data.map(function(d){ return { time:d.time, value:d.c }; }));
      }
      var vol = chart.addHistogramSeries({ priceFormat:{ type:'volume' }, priceScaleId:'' });
      vol.priceScale().applyOptions({ scaleMargins:{ top:0.82, bottom:0 } });
      vol.setData(data.map(function(d){ return { time:d.time, value:d.v, color: d.c>=d.o ? 'rgba(14,159,94,0.30)' : 'rgba(221,75,62,0.30)' }; }));
      chart.timeScale().fitContent();
    } catch(e){
      document.body.innerHTML = '<div style="font-family:sans-serif;color:#9AA49E;font-size:13px;text-align:center;padding:40px 20px">Chart could not load.</div>';
    }
    ready();
  })();
</script>
</body></html>`;

  return (
    <View style={[styles.wrap, { height }]}>
      <WebView
        key={`${stock.id}-${mode}-${timeframe}`}
        source={{ html }}
        originWhitelist={['*']}
        javaScriptEnabled
        domStorageEnabled
        style={styles.web}
        onLoadEnd={() => {
          // hide spinner shortly after load as a fallback to the postMessage
          if (timer.current) clearTimeout(timer.current);
          timer.current = setTimeout(() => setReady(true), 500);
        }}
        onMessage={(e) => {
          if (e.nativeEvent.data === 'ready') setReady(true);
        }}
      />
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
  web: {
    flex: 1,
    backgroundColor: C.white,
  },
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
