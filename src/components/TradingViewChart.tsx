import { StyleSheet, View, ActivityIndicator, Text } from 'react-native';
import { WebView } from 'react-native-webview';

import { C, F } from '@/theme';

/**
 * Real TradingView Advanced Chart embedded via WebView.
 * `type` switches the default chart style: 'candles' or 'line'.
 * Requires network (loads on device + browser; not in the offline preview).
 */
export function TradingViewChart({
  symbol,
  type = 'candles',
  height = 360,
}: {
  symbol: string;
  type?: 'line' | 'candles';
  height?: number;
}) {
  const style = type === 'line' ? '2' : '1'; // 2 = line, 1 = candlesticks
  const html = `<!DOCTYPE html><html><head>
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
<style>
  html,body{margin:0;padding:0;background:#ffffff;height:100%;overflow:hidden;}
  #tv{height:100%;}
</style></head>
<body>
<div id="tv"></div>
<script src="https://s3.tradingview.com/tv.js"></script>
<script>
  try {
    new TradingView.widget({
      autosize: true,
      symbol: ${JSON.stringify(symbol)},
      interval: "D",
      timezone: "Africa/Lagos",
      theme: "light",
      style: ${JSON.stringify(style)},
      locale: "en",
      toolbar_bg: "#F4F6F5",
      enable_publishing: false,
      allow_symbol_change: true,
      hide_side_toolbar: true,
      withdateranges: true,
      details: false,
      save_image: false,
      studies: [],
      container_id: "tv"
    });
  } catch (e) {}
</script>
</body></html>`;

  return (
    <View style={[styles.wrap, { height }]}>
      <View style={styles.loading} pointerEvents="none">
        <ActivityIndicator color={C.green} />
        <Text style={styles.loadingText}>Loading live chart…</Text>
      </View>
      <WebView
        key={`${symbol}-${style}`}
        source={{ html }}
        originWhitelist={['*']}
        javaScriptEnabled
        domStorageEnabled
        style={styles.web}
        renderLoading={undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: 16,
    overflow: 'hidden',
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
  web: {
    flex: 1,
    backgroundColor: C.white,
  },
});
