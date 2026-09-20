import { getSetting, setSetting } from './indexedDbAdapter';

let hapticsEnabled = true;

// Initialize setting from IndexedDB asynchronously if available
if (typeof indexedDB !== 'undefined') {
  try {
    getSetting('hapticFeedback', true).then((val) => {
      hapticsEnabled = val !== false;
    }).catch(() => {});
  } catch (e) {
    // Ignore in non-browser/unit-test environments without full IndexedDB
  }
}

/**
 * Checks whether haptic feedback is currently enabled by user preference.
 * @returns {boolean}
 */
export function isHapticsEnabled() {
  return hapticsEnabled;
}

/**
 * Sets user preference for haptic feedback and persists it in settings.
 * @param {boolean} enabled
 */
export function setHapticsEnabled(enabled) {
  hapticsEnabled = Boolean(enabled);
  try {
    setSetting('hapticFeedback', hapticsEnabled).catch(() => {});
  } catch (e) {}
}

/**
 * Checks whether the Vibration API is supported in the current environment.
 * @returns {boolean}
 */
export function isHapticsSupported() {
  return typeof navigator !== 'undefined' &&
    'vibrate' in navigator &&
    typeof navigator.vibrate === 'function';
}

/**
 * Triggers a vibration pattern if supported and enabled.
 * @param {number|number[]} pattern Milliseconds to vibrate or vibration/pause sequence.
 * @returns {boolean} Whether the vibration call was dispatched.
 */
export function vibrate(pattern) {
  if (!isHapticsSupported() || !isHapticsEnabled()) {
    return false;
  }
  try {
    return navigator.vibrate(pattern);
  } catch (err) {
    console.warn('[hapticService] Vibration failed:', err);
    return false;
  }
}

/**
 * Short crisp vibration for successful actions (e.g. barcode scan).
 */
export function vibrateSuccess() {
  return vibrate(40);
}

/**
 * Double-pulse vibration for warnings or cautionary actions.
 */
export function vibrateWarning() {
  return vibrate([40, 60, 40]);
}

/**
 * Distinct vibration pattern for errors or destructive actions.
 */
export function vibrateError() {
  return vibrate([80, 50, 80]);
}

