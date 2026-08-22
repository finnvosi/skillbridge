// Local notification support (blueprint §7 must-ship: push + in-app center).
//
// Real push requires EAS credentials + APNs/FCM and is out of scope for the
// local prototype. This wires the in-app notification handler and lets the app
// raise local notifications on native devices; every call is a safe no-op on
// web (expo-notifications is native-only).
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

/** Request permission lazily (e.g. when the worker first applies). */
export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  } catch {
    return false;
  }
}

/** Fire a local notification (no-op on web / when permission denied). */
export async function showLocalNotification(
  title: string,
  body: string,
): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    await Notifications.scheduleNotificationAsync({
      content: { title, body },
      trigger: null,
    });
  } catch {
    // non-fatal
  }
}
