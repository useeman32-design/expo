import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Modal, Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { C, F, R, S, registerStyles } from '@/theme';
import { money } from '@/utils';
import { hapticSuccess } from '@/utils/haptics';

/**
 * Payment simulation: a focused modal that walks the three real-world
 * stages of a bill payment (contacting provider → debiting wallet →
 * confirming), then lands on an animated success state. Used by the
 * bills screens instead of a receipt — the confirmation reads like a
 * live payment, not paperwork.
 */
export function PaymentSim({
  visible,
  onClose,
  amount,
  provider,
  reference,
  fieldMask,
}: {
  visible: boolean;
  onClose: () => void;
  amount: number;
  provider: string;
  reference: string;
  /** e.g. MTN · 0803 ••• 4567 */
  fieldMask?: string;
}) {
  const [step, setStep] = useState(0); // 0..2 processing, 3 success
  const pop = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) {
      setStep(0);
      pop.setValue(0);
      return;
    }
    const timers = [
      setTimeout(() => setStep(1), 850),
      setTimeout(() => setStep(2), 1700),
      setTimeout(() => {
        setStep(3);
        hapticSuccess();
        Animated.spring(pop, { toValue: 1, friction: 5, useNativeDriver: true }).start();
      }, 2600),
    ];
    return () => timers.forEach(clearTimeout);
  }, [visible, pop]);

  const stages = ['Contacting provider', 'Debiting your wallet', 'Confirming payment'];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        style={styles.backdrop}
        onPress={step === 3 ? onClose : undefined}
      >
        <Pressable style={styles.card} onPress={step === 3 ? onClose : undefined} disabled={step < 3}>
          {step < 3 ? (
            <>
              <View style={styles.spinnerWrap}>
                <ActivityIndicator size="large" color={C.green} />
              </View>
              <Text style={styles.title}>Processing payment</Text>
              <Text style={styles.subtitle}>{money(amount)} · {provider}</Text>
              <View style={styles.stageList}>
                {stages.map((label, i) => {
                  const done = step > i;
                  const active = step === i;
                  return (
                    <View key={label} style={styles.stageRow}>
                      {done ? (
                        <View style={styles.stageCheck}>
                          <Ionicons name="checkmark" size={13} color={C.white} />
                        </View>
                      ) : active ? (
                        <ActivityIndicator size="small" color={C.green} />
                      ) : (
                        <View style={styles.stageDot} />
                      )}
                      <Text style={[styles.stageText, active && { color: C.ink }, done && { color: C.ink2 }]}>
                        {label}
                      </Text>
                    </View>
                  );
                })}
              </View>
              <Text style={styles.dontClose}>Keep the app open…</Text>
            </>
          ) : (
            <>
              <Animated.View style={[styles.successCircle, { transform: [{ scale: pop }] }]}>
                <Ionicons name="checkmark" size={44} color={C.white} />
              </Animated.View>
              <Text style={styles.title}>Payment successful</Text>
              <Text style={styles.amount}>{money(amount)}</Text>
              <Text style={styles.subtitle}>{provider}{fieldMask ? ` · ${fieldMask}` : ''}</Text>

              <View style={styles.refRow}>
                <Text style={styles.refLabel}>Reference</Text>
                <Text style={styles.refValue}>{reference}</Text>
              </View>

              <View style={styles.tapHintWrap}>
                <Text style={styles.tapHint}>Tap anywhere to continue</Text>
              </View>
            </>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const makeStyles = () =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(6,10,8,0.62)',
      alignItems: 'center',
      justifyContent: 'center',
      padding: S.xl,
    },
    card: {
      width: '100%',
      maxWidth: 360,
      backgroundColor: C.surface,
      borderRadius: R.xl,
      padding: S.xl,
      alignItems: 'center',
    } as ViewStyle,
    spinnerWrap: {
      width: 74,
      height: 74,
      borderRadius: 37,
      backgroundColor: C.canvasAlt,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: S.lg,
    },
    successCircle: {
      width: 74,
      height: 74,
      borderRadius: 37,
      backgroundColor: C.green,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: S.lg,
      shadowColor: C.green,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.35,
      shadowRadius: 14,
      elevation: 8,
    },
    title: { color: C.ink, fontFamily: F.display, fontSize: 20, fontWeight: '800' },
    amount: {
      color: C.green,
      fontFamily: F.display,
      fontSize: 34,
      fontWeight: '800',
      marginTop: 6,
      letterSpacing: -1,
    },
    subtitle: { color: C.muted, fontFamily: F.sans, fontSize: 13.5, marginTop: 4, textAlign: 'center' },
    stageList: { alignSelf: 'stretch', marginTop: S.lg, gap: S.md },
    stageRow: { flexDirection: 'row', alignItems: 'center', gap: 11 },
    stageCheck: {
      width: 21,
      height: 21,
      borderRadius: 11,
      backgroundColor: C.green,
      alignItems: 'center',
      justifyContent: 'center',
    },
    stageDot: { width: 21, height: 21, borderRadius: 11, backgroundColor: C.canvasAlt },
    stageText: { color: C.faint, fontFamily: F.sans, fontSize: 13.5, fontWeight: '600' },
    dontClose: { color: C.faint, fontFamily: F.sans, fontSize: 11.5, marginTop: S.lg },
    refRow: {
      alignSelf: 'stretch',
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: S.lg,
      paddingTop: S.md,
      borderTopWidth: 1,
      borderTopColor: C.hairlineSoft,
    },
    refLabel: { color: C.muted, fontFamily: F.sans, fontSize: 12.5 },
    refValue: { color: C.ink2, fontFamily: F.sans, fontSize: 12.5, fontWeight: '700' },
    tapHintWrap: {
      marginTop: S.xl,
      alignSelf: 'stretch',
      alignItems: 'center',
      paddingVertical: 9,
      borderRadius: R.pill,
      backgroundColor: C.canvasAlt,
    },
    tapHint: { color: C.muted, fontFamily: F.sans, fontSize: 12, fontWeight: '700' },
  });

let styles = makeStyles();
registerStyles(() => {
  styles = makeStyles();
});
