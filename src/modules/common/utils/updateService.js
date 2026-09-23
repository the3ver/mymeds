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
 * Tells the waiting Service Worker to skip waiting and safely reloads the active client
 * once the new Service Worker has taken control (controllerchange).
 * @param {ServiceWorkerRegistration} [registration]
 */
export function applyUpdateAndReload(registration) {
  if (typeof window === 'undefined') return;

  const hasSW = typeof navigator !== 'undefined' && 'serviceWorker' in navigator;
  if (!hasSW) {
    window.location.reload();
    return;
  }

  let reloaded = false;
  const reloadOnce = () => {
    if (!reloaded) {
      reloaded = true;
      window.location.reload();
    }
  };

  // Wait for the newly activated Service Worker to claim the client before reloading.
  navigator.serviceWorker.addEventListener('controllerchange', reloadOnce, { once: true });

  // Fallback safety timeout: reload anyway if controllerchange does not fire within 2.5s.
  setTimeout(reloadOnce, 2500);

  const waitingWorker = registration?.waiting;
  const installingWorker = registration?.installing;

  if (waitingWorker) {
    waitingWorker.postMessage({ type: 'SKIP_WAITING' });
  } else if (installingWorker) {
    installingWorker.addEventListener('statechange', () => {
      if (installingWorker.state === 'installed') {
        installingWorker.postMessage({ type: 'SKIP_WAITING' });
      }
    });
  } else {
    // If no worker waiting or installing, check current registration or trigger reload
    Promise.resolve(navigator.serviceWorker.getRegistration?.()).then((reg) => {
      if (reg?.waiting) {
        reg.waiting.postMessage({ type: 'SKIP_WAITING' });
      } else if (!reg?.installing) {
        reloadOnce();
      }
    }).catch(() => {
      reloadOnce();
    });
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

  let cleanupUpdateFound = () => {};

  const handleControllerChange = async () => {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      callback(registration);
    }
  };

  navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);

  // Check if an update is already waiting or installing in background
  Promise.resolve(navigator.serviceWorker.getRegistration?.()).then((registration) => {
    if (!registration) return;

    if (registration.waiting) {
      callback(registration);
      return;
    }

    const handleUpdateFound = () => {
      const installing = registration.installing;
      if (!installing) return;
      installing.addEventListener('statechange', () => {
        if (installing.state === 'installed' && navigator.serviceWorker.controller) {
          callback(registration);
        }
      });
    };

    if (registration.addEventListener) {
      registration.addEventListener('updatefound', handleUpdateFound);
      cleanupUpdateFound = () => {
        if (registration.removeEventListener) {
          registration.removeEventListener('updatefound', handleUpdateFound);
        }
      };
    }
  }).catch(() => {});

  return () => {
    navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
    cleanupUpdateFound();
  };
}
