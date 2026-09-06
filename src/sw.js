import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';

cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);

// Handle manual update triggers from updateService.js
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Periodic Background Sync: triggers intake reminders
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'daily-med-reminder') {
    event.waitUntil(handlePeriodicReminder());
  }
});

// Notification Click: bring app to foreground
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow('./');
      }
    })
  );
});

// --- IndexedDB Helper Functions inside Service Worker ---

function openMyMedsDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('MyMedsDB', 4);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings');
      }
    };
  });
}

function getFromSettings(db, key) {
  return new Promise((resolve) => {
    try {
      const tx = db.transaction('settings', 'readonly');
      const store = tx.objectStore('settings');
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    } catch (e) {
      resolve(null);
    }
  });
}

function putInSettings(db, key, value) {
  return new Promise((resolve, reject) => {
    try {
      const tx = db.transaction('settings', 'readwrite');
      const store = tx.objectStore('settings');
      const req = store.put(value, key);
      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    } catch (e) {
      reject(e);
    }
  });
}

/**
 * Handles periodic sync: checks if any reminder slot is due today and shows a generic notification.
 */
async function handlePeriodicReminder() {
  try {
    const db = await openMyMedsDB();
    const reminderSettings = await getFromSettings(db, 'reminderSettings');

    if (!reminderSettings || !reminderSettings.enabled || !Array.isArray(reminderSettings.slots)) {
      db.close();
      return;
    }

    const locale = (await getFromSettings(db, 'locale')) || 'de';
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const lookbackMinutes = 120; // 2 hours

    const lastNotified = { ...(reminderSettings.lastNotified || {}) };
    let dueCount = 0;

    for (const slot of reminderSettings.slots) {
      if (!slot.enabled || !slot.time) continue;

      const slotKey = `${todayStr}_${slot.id}`;
      if (lastNotified[slotKey]) continue;

      const [h, m] = slot.time.split(':').map(Number);
      const slotMinutes = (h || 0) * 60 + (m || 0);
      const diff = currentMinutes - slotMinutes;

      if (diff >= 0 && diff <= lookbackMinutes) {
        dueCount++;
        lastNotified[slotKey] = now.getTime();
      }
    }

    if (dueCount > 0) {
      // Clean up entries older than 7 days
      const cutoff = now.getTime() - 7 * 24 * 60 * 60 * 1000;
      for (const k of Object.keys(lastNotified)) {
        if (lastNotified[k] < cutoff) {
          delete lastNotified[k];
        }
      }

      reminderSettings.lastNotified = lastNotified;
      await putInSettings(db, 'reminderSettings', reminderSettings);

      const title = 'MyMeds';
      const body = locale === 'de'
        ? 'Erinnerung: Zeit für deine Medikamente.'
        : 'Reminder: Time for your medication.';

      await self.registration.showNotification(title, {
        body,
        icon: './pwa-192x192.svg',
        badge: './favicon.ico',
        tag: 'med-reminder',
      });
    }

    db.close();
  } catch (err) {
    console.error('[SW] Periodic reminder execution error:', err);
  }
}
