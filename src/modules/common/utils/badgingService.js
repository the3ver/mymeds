/**
 * Service for managing App Badging API (navigator.setAppBadge / clearAppBadge)
 */
import { calculateDaysRemaining } from '../../meds/utils/medUtils';

/**
 * Checks whether the Badging API is supported by the current environment.
 * @returns {boolean}
 */
export function isBadgingSupported() {
  return typeof navigator !== 'undefined' &&
    'setAppBadge' in navigator &&
    typeof navigator.setAppBadge === 'function' &&
    'clearAppBadge' in navigator &&
    typeof navigator.clearAppBadge === 'function';
}

/**
 * Sets the app badge to the specified count or clears it if count <= 0.
 * @param {number} [count]
 * @returns {Promise<void>}
 */
export async function setBadge(count) {
  if (!isBadgingSupported()) {
    return;
  }
  try {
    if (typeof count === 'number' && count > 0) {
      await navigator.setAppBadge(Math.floor(count));
    } else {
      await navigator.clearAppBadge();
    }
  } catch (err) {
    console.warn('[badgingService] Error setting app badge:', err);
  }
}

/**
 * Clears the app badge.
 * @returns {Promise<void>}
 */
export async function clearBadge() {
  if (!isBadgingSupported()) {
    return;
  }
  try {
    await navigator.clearAppBadge();
  } catch (err) {
    console.warn('[badgingService] Error clearing app badge:', err);
  }
}

/**
 * Updates the app badge based on the number of medications at or below the critical red limit.
 * @param {Array<Object>} meds
 * @param {number} [redLimit=7]
 * @returns {Promise<number>}
 */
export async function updateCriticalMedsBadge(meds, redLimit = 7) {
  if (!Array.isArray(meds) || meds.length === 0) {
    await clearBadge();
    return 0;
  }

  let criticalCount = 0;
  for (const med of meds) {
    const days = calculateDaysRemaining(med);
    if (days !== null && days <= redLimit) {
      criticalCount++;
    }
  }

  if (criticalCount > 0) {
    await setBadge(criticalCount);
  } else {
    await clearBadge();
  }

  return criticalCount;
}


