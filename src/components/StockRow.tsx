import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import type { Stock } from '@/types';
import { price } from '@/utils';
import { C, F, S } from '@/theme';
import { ChangePill, StockLogo } from '@/components/primitives';
import { Chart } from '@/components/Chart';

export function StockRow({
  stock,
  last = false,
  showSpark = true,
}: {
  stock: Stock;
  last?: boolean;
  showSpark?: boolean;
}) {
  const router = useRouter();
  const up = stock.changePct >= 0;
  return (
    <Pressable
      onPress={() => router.push(`/stock/${stock.id}`)}
      style={({ pressed }) => [
        styles.row,
        !last && styles.divider,
        pressed && { opacity: 0.6 },
      ]}
    >
      <StockLogo ticker={stock.ticker} color={stock.color} size={42} />
      <View style={styles.info}>
        <Text style={styles.ticker}>{stock.ticker}</Text>
        <Text style={styles.name} numberOfLines={1}>
          {stock.name}
        </Text>
      </View>

      {showSpark ? (
        <View style={styles.spark}>
          <Chart
            data={stock.spark}
            width={50}
            height={26}
            stroke={up ? C.positive : C.negative}
            strokeWidth={1.6}
            fill={false}
          />
        </View>
      ) : null}

      <View style={styles.right}>
        <Text style={styles.price}>{price(stock.price, stock.currency === 'NGN' ? '₦' : '$')}</Text>
        <ChangePill value={stock.changePct} />
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
    borderBottomColor: C.hairlineSoft,
  },
  info: { flex: 1, gap: 2 },
  ticker: {
    color: C.ink,
    fontFamily: F.sans,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  name: {
    color: C.muted,
    fontFamily: F.sans,
    fontSize: 12.5,
  },
  spark: { width: 50, alignItems: 'center' },
  right: { alignItems: 'flex-end', gap: 3, minWidth: 78 },
  price: {
    color: C.ink,
    fontFamily: F.mono,
    fontSize: 14.5,
    fontWeight: '700',
  },
});
