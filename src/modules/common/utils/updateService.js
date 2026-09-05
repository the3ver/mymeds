/**
 * Service Worker update management for MyMeds PWA.
 * Interacts with W3C Service Worker API for on-demand update checks and lifecycle events.
 */

/**
 * @typedef {Object} UpdateCheckResult
 * @property {boolean} supported
 * @property {'up_to_date' | 'update_found' | 'update_ready' | 'no_registration' | 'offline' | 'error'} status
 * @property {ServiceWorkerRegistration} [registration]
 * @property {any} [error]
 */

/**
 * Explicitly triggers a network check for Service Worker updates.
 * @returns {Promise<UpdateCheckResult>}
 */
export async function checkForAppUpdates() {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
    return { supported: false, status: 'no_registration' };
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) {
      return { supported: true, status: 'no_registration' };
    }

    // Check if an updated service worker is already waiting in background
    if (registration.waiting) {
      return { supported: true, status: 'update_ready', registration };
    }

    // Trigger update request to server
    await registration.update();

    if (registration.waiting) {
      return { supported: true, status: 'update_ready', registration };
    }

    if (registration.installing) {
      return { supported: true, status: 'update_found', registration };
    }

    return { supported: true, status: 'up_to_date', registration };
  } catch (err) {
    console.warn('[updateService] Update check failed:', err);
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return { supported: true, status: 'offline', error: err };
    }
    return { supported: true, status: 'error', error: err };
  }
}

/**
 * Tells the waiting Service Worker to skip waiting and reloads the active client.
 * @param {ServiceWorkerRegistration} [registration]
 */
export function applyUpdateAndReload(registration) {
  if (registration?.waiting) {
    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
  }
  if (typeof window !== 'undefined') {
    window.location.reload();
  }
}

/**
 * Listens for background Service Worker updates and controller changes.
 * @param {(registration: ServiceWorkerRegistration) => void} callback
 * @returns {() => void} Cleanup unsubscribe function
 */
export function onServiceWorkerUpdate(callback) {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
    return () => {};
  }

  const handleControllerChange = async () => {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      callback(registration);
    }
  };

  navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);

  return () => {
    navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
  };
}
