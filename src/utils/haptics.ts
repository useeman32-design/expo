import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

/**
 * Cross-platform haptics: iOS uses the Taptic engine, Android falls back to
 * the vibration patterns expo-haptics provides, web is a silent no-op.
 * Every helper is fire-and-forget and never throws.
 */

const enabled = Platform.OS === 'ios' || Platform.OS === 'android';

/** successful transaction (buy/sell filled, deposit, bill paid…) */
export function hapticSuccess() {
  if (!enabled) return;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
}

/** failed transaction (rejected order, insufficient funds…) */
export function hapticError() {
  if (!enabled) return;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
}

/** soft warning (rule triggered, something needs attention) */
export function hapticWarning() {
  if (!enabled) return;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
}

/** light tap feedback for toggles and small controls */
export function hapticTap() {
  if (!enabled) return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
}
