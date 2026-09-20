/**
 * Service for managing PWA Storage Persistence & Storage Quota
 */

/**
 * Checks whether the StorageManager Persistence API is available.
 * @returns {boolean}
 */
export function isPersistenceSupported() {
  return typeof navigator !== 'undefined' &&
    'storage' in navigator &&
    Boolean(navigator.storage) &&
    typeof navigator.storage.persist === 'function' &&
    typeof navigator.storage.persisted === 'function';
}

/**
 * Checks whether storage persistence has already been granted by the browser.
 * @returns {Promise<boolean>}
 */
export async function isStoragePersisted() {
  if (!isPersistenceSupported()) {
    return false;
  }
  try {
    return await navigator.storage.persisted();
  } catch (err) {
    console.warn('[storagePersistenceService] Error checking persisted state:', err);
    return false;
  }
}

/**
 * Requests persistent storage from the browser.
 * @returns {Promise<boolean>} Whether persistence was granted.
 */
export async function requestPersistence() {
  if (!isPersistenceSupported()) {
    return false;
  }
  try {
    return await navigator.storage.persist();
  } catch (err) {
    console.warn('[storagePersistenceService] Error requesting persistence:', err);
    return false;
  }
}

/**
 * Formats a byte number into human-readable string (B, KB, MB, GB).
 * @param {number} bytes
 * @returns {string}
 */
export function formatBytes(bytes) {
  if (!bytes || bytes <= 0 || isNaN(bytes)) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const unitIndex = Math.min(i, units.length - 1);
  const val = bytes / Math.pow(1024, unitIndex);
  // If whole number, format without decimal, otherwise up to 1 decimal place
  const formatted = val % 1 === 0 ? val.toString() : parseFloat(val.toFixed(1)).toString();
  return `${formatted} ${units[unitIndex]}`;
}

/**
 * Retrieves storage usage and quota estimate.
 * @returns {Promise<{supported: boolean, usage: number, quota: number, usageFormatted: string, quotaFormatted: string, percentUsed: number}>}
 */
export async function getStorageEstimate() {
  const isSupported = typeof navigator !== 'undefined' &&
    'storage' in navigator &&
    Boolean(navigator.storage) &&
    typeof navigator.storage.estimate === 'function';

  if (!isSupported) {
    return {
      supported: false,
      usage: 0,
      quota: 0,
      usageFormatted: '0 B',
      quotaFormatted: '0 B',
      percentUsed: 0,
    };
  }

  try {
    const estimate = await navigator.storage.estimate();
    const usage = estimate.usage || 0;
    const quota = estimate.quota || 0;
    const percentUsed = quota > 0 ? Math.round((usage / quota) * 100) : 0;

    return {
      supported: true,
      usage,
      quota,
      usageFormatted: formatBytes(usage),
      quotaFormatted: formatBytes(quota),
      percentUsed,
    };
  } catch (err) {
    console.warn('[storagePersistenceService] Error querying storage estimate:', err);
    return {
      supported: false,
      usage: 0,
      quota: 0,
      usageFormatted: '0 B',
      quotaFormatted: '0 B',
      percentUsed: 0,
    };
  }
}

/**
 * Automatically requests storage persistence if not yet persistent.
 * Safe to be called on app init / unlock.
 * @returns {Promise<boolean>}
 */
export async function autoRequestPersistence() {
  if (!isPersistenceSupported()) {
    return false;
  }
  const alreadyPersisted = await isStoragePersisted();
  if (alreadyPersisted) {
    return true;
  }
  return await requestPersistence();
}




