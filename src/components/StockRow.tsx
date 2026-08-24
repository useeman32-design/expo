import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Stock } from '@/data/stocks';
import { price } from '@/utils';
import { C, FONT, S } from '@/theme';
import { ChangePill, HalalBadge, StockLogo } from '@/components/ui';
import { Sparkline } from '@/components/Sparkline';

export function StockRow({
  stock,
  showHalal = false,
  last = false,
}: {
  stock: Stock;
  showHalal?: boolean;
  last?: boolean;
}) {
  const router = useRouter();
  const up = stock.changePct >= 0;
  return (
    <Pressable
      onPress={() => router.push(`/stock/${stock.id}`)}
      style={({ pressed }) => [
        styles.row,
        !last && styles.divider,
        pressed && { opacity: 0.7 },
      ]}
    >
      <StockLogo ticker={stock.ticker} color={stock.color} size={42} />
      <View style={styles.info}>
        <View style={styles.tickerRow}>
          <Text style={styles.ticker} numberOfLines={1}>
            {stock.ticker}
          </Text>
          {showHalal ? <HalalBadge compliant={stock.sharia} small /> : null}
        </View>
        <Text style={styles.name} numberOfLines={1}>
          {stock.name}
        </Text>
      </View>
      <View style={styles.sparkWrap}>
        <Sparkline data={stock.spark} positive={up} width={56} height={28} fill={false} />
      </View>
      <View style={styles.right}>
        <Text style={styles.price}>{price(stock.price, stock.currency)}</Text>
        <ChangePill value={stock.changePct} style={{ alignSelf: 'flex-end' }} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: S.md,
    gap: 12,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  tickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ticker: {
    color: C.text,
    fontFamily: FONT.sans,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  name: {
    color: C.textMuted,
    fontFamily: FONT.sans,
    fontSize: 12,
  },
  sparkWrap: {
    width: 56,
    alignItems: 'center',
  },
  right: {
    alignItems: 'flex-end',
    gap: 4,
    minWidth: 86,
  },
  price: {
    color: C.text,
    fontFamily: FONT.mono,
    fontSize: 14,
    fontWeight: '700',
  },
});
