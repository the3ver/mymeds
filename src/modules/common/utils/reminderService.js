import { getReminderSettings, saveReminderSettings } from './dataService';

export const PERIODIC_SYNC_TAG = 'daily-med-reminder';
export const LOOKBACK_MINUTES = 120; // Allow trigger within 2 hours of scheduled time

/**
 * Checks whether the app is running in a Trusted Web Activity (TWA) / WebAPK on Android,
 * or if a testing override is active.
 * @returns {boolean}
 */
export function isTwaEnvironment() {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false;
  }

  // Debug / testing override via URL parameter or localStorage
  try {
    const urlParams = new URLSearchParams(window.location.search);
    if (
      urlParams.get('twa') === '1' ||
      urlParams.get('debug_reminders') === '1' ||
      localStorage.getItem('force_enable_reminders') === 'true'
    ) {
      return true;
    }
  } catch (e) {
    // Ignore storage/URL errors
  }

  // Check referrer on initial launch from Android package
  try {
    if (document.referrer && document.referrer.startsWith('android-app://')) {
      sessionStorage.setItem('is_twa', 'true');
      return true;
    }
    if (sessionStorage.getItem('is_twa') === 'true') {
      return true;
    }
  } catch (e) {
    // Ignore storage errors
  }

  // Check Android OS
  const isAndroid = /android/i.test(navigator.userAgent || '');
  if (!isAndroid) {
    return false;
  }

  // Check standalone mode (PWA installed as WebAPK / TWA)
  const isStandalone = typeof window.matchMedia === 'function' && window.matchMedia('(display-mode: standalone)').matches;
  return isStandalone;
}

/**
 * Checks if the full reminder feature is supported in the current environment.
 * Requires TWA/Android and browser API support (Notification & PeriodicSync).
 * @returns {boolean}
 */
export function isReminderSupported() {
  if (!isTwaEnvironment()) {
    return false;
  }

  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false;
  }

  // Debug override check: allow desktop testing if explicitly requested
  try {
    const urlParams = new URLSearchParams(window.location.search);
    if (
      urlParams.get('twa') === '1' ||
      urlParams.get('debug_reminders') === '1' ||
      localStorage.getItem('force_enable_reminders') === 'true'
    ) {
      return 'Notification' in window;
    }
  } catch (e) {
    // Ignore
  }

  const hasSW = 'serviceWorker' in navigator;
  const hasNotification = 'Notification' in window;
  const hasPeriodicSync =
    typeof ServiceWorkerRegistration !== 'undefined' &&
    'periodicSync' in ServiceWorkerRegistration.prototype;

  return hasSW && hasNotification && hasPeriodicSync;
}

/**
 * Generates an array of all 48 time strings in 30-minute intervals ('00:00' to '23:30').
 * @returns {string[]}
 */
export function generateHalfHourOptions() {
  const options = [];
  for (let h = 0; h < 24; h++) {
    const hh = String(h).padStart(2, '0');
    options.push(`${hh}:00`);
    options.push(`${hh}:30`);
  }
  return options;
}

/**
 * Helper to parse 'HH:mm' time string into minutes since midnight.
 * @param {string} timeStr
 * @returns {number}
 */
export function parseTimeToMinutes(timeStr) {
  if (!timeStr || typeof timeStr !== 'string') return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

/**
 * Pure function: Evaluates which configured slots are currently due for notification.
 * 
 * @param {Object} reminderSettings
 * @param {Date} [now=new Date()]
 * @param {number} [lookbackMinutes=LOOKBACK_MINUTES]
 * @returns {{ dueSlots: Array, updatedLastNotified: Object, hasChanges: boolean }}
 */
export function evaluateDueReminders(reminderSettings, now = new Date(), lookbackMinutes = LOOKBACK_MINUTES) {
  if (!reminderSettings || !reminderSettings.enabled || !Array.isArray(reminderSettings.slots)) {
    return { dueSlots: [], updatedLastNotified: reminderSettings?.lastNotified || {}, hasChanges: false };
  }

  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const existingLastNotified = { ...(reminderSettings.lastNotified || {}) };
  const updatedLastNotified = { ...existingLastNotified };
  const dueSlots = [];

  for (const slot of reminderSettings.slots) {
    if (!slot.enabled || !slot.time) continue;

    const slotKey = `${todayStr}_${slot.id}`;
    if (updatedLastNotified[slotKey]) {
      // Already notified today for this slot
      continue;
    }

    const slotMinutes = parseTimeToMinutes(slot.time);
    const diff = currentMinutes - slotMinutes;

    // Slot is due if current time is past slot time, but within the lookback window
    if (diff >= 0 && diff <= lookbackMinutes) {
      dueSlots.push(slot);
      updatedLastNotified[slotKey] = now.getTime();
    }
  }

  // Prune entries older than 7 days from lastNotified
  const cutoffTime = now.getTime() - 7 * 24 * 60 * 60 * 1000;
  for (const key of Object.keys(updatedLastNotified)) {
    if (updatedLastNotified[key] < cutoffTime) {
      delete updatedLastNotified[key];
    }
  }

  return {
    dueSlots,
    updatedLastNotified,
    hasChanges: dueSlots.length > 0,
  };
}

/**
 * Requests Notification permission from the user.
 * @returns {Promise<NotificationPermission>}
 */
export async function requestNotificationPermission() {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }
  return Notification.requestPermission();
}

/**
 * Registers the periodic background sync task if supported.
 * @returns {Promise<boolean>}
 */
export async function registerPeriodicSync() {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    if ('periodicSync' in registration) {
      await registration.periodicSync.register(PERIODIC_SYNC_TAG, {
        minInterval: 60 * 60 * 1000, // 1 hour minimum interval
      });
      return true;
    }
  } catch (err) {
    console.warn('[reminderService] Could not register periodicSync:', err);
  }
  return false;
}

/**
 * Unregisters the periodic background sync task.
 * @returns {Promise<boolean>}
 */
export async function unregisterPeriodicSync() {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    if ('periodicSync' in registration) {
      await registration.periodicSync.unregister(PERIODIC_SYNC_TAG);
      return true;
    }
  } catch (err) {
    console.warn('[reminderService] Could not unregister periodicSync:', err);
  }
  return false;
}

/**
 * Sends a test notification to verify notification permissions and display.
 * @param {string} title
 * @param {string} body
 * @returns {Promise<boolean>}
 */
export async function sendTestNotification(title = 'MyMeds', body = 'Erinnerung: Zeit für deine Medikamente') {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  let permission = Notification.permission;
  if (permission !== 'granted') {
    permission = await requestNotificationPermission();
  }

  if (permission !== 'granted') {
    return false;
  }

  try {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      if (registration && 'showNotification' in registration) {
        await registration.showNotification(title, {
          body,
          icon: '/mymeds/pwa-192x192.svg',
          badge: '/mymeds/favicon.ico',
          tag: 'med-reminder-test',
        });
        return true;
      }
    }
    // Fallback if no SW ready
    new Notification(title, { body, icon: '/mymeds/pwa-192x192.svg' });
    return true;
  } catch (err) {
    console.error('[reminderService] Failed to send test notification:', err);
    return false;
  }
}
