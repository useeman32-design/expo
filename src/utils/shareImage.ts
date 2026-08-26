import { Platform } from 'react-native';
import type { RefObject } from 'react';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';

/**
 * Capture a view as a JPG and hand it to the user — the native share
 * sheet on iOS/Android, a file download on web. Returns how it went so
 * callers can fall back (e.g. copy details to clipboard) on failure.
 */
export async function shareViewAsJpg(
  ref: RefObject<unknown>,
  filename: string,
): Promise<'shared' | 'downloaded' | 'failed'> {
  try {
    if (Platform.OS === 'web') {
      const dataUri = await captureRef(ref as never, {
        format: 'jpg',
        quality: 0.95,
        result: 'data-uri',
      });
      const a = document.createElement('a');
      a.href = dataUri as string;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      return 'downloaded';
    }
    const uri = await captureRef(ref as never, {
      format: 'jpg',
      quality: 0.95,
      result: 'tmpfile',
    });
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, { mimeType: 'image/jpeg', dialogTitle: 'Share' });
      return 'shared';
    }
    return 'failed';
  } catch {
    return 'failed';
  }
}
