import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as reminderService from '../../src/modules/common/utils/reminderService';

describe('reminderService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    sessionStorage.clear();
    localStorage.clear();
  });

  describe('generateHalfHourOptions', () => {
    it('generates 48 time strings from 00:00 to 23:30', () => {
      const options = reminderService.generateHalfHourOptions();
      expect(options).toHaveLength(48);
      expect(options[0]).toBe('00:00');
      expect(options[1]).toBe('00:30');
      expect(options[16]).toBe('08:00');
      expect(options[47]).toBe('23:30');
    });
  });

  describe('parseTimeToMinutes', () => {
    it('correctly converts HH:mm to minutes from midnight', () => {
      expect(reminderService.parseTimeToMinutes('00:00')).toBe(0);
      expect(reminderService.parseTimeToMinutes('00:30')).toBe(30);
      expect(reminderService.parseTimeToMinutes('08:00')).toBe(480);
      expect(reminderService.parseTimeToMinutes('12:30')).toBe(750);
      expect(reminderService.parseTimeToMinutes('23:30')).toBe(1410);
      expect(reminderService.parseTimeToMinutes('')).toBe(0);
    });
  });

  describe('isTwaEnvironment & isReminderSupported', () => {
    const originalUserAgent = navigator.userAgent;
    const originalReferrer = document.referrer;

    afterEach(() => {
      Object.defineProperty(navigator, 'userAgent', {
        value: originalUserAgent,
        configurable: true,
      });
      delete window.PeriodicSyncManager;
    });

    it('returns true when debug override url param is present', () => {
      delete window.location;
      window.location = new URL('https://example.com/mymeds/?debug_reminders=1');
      window.Notification = { permission: 'default' };

      expect(reminderService.isTwaEnvironment()).toBe(true);
      expect(reminderService.isReminderSupported()).toBe(true);
    });

    it('returns false on standard desktop browser without standalone or android', () => {
      delete window.location;
      window.location = new URL('https://example.com/mymeds/');

      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
        configurable: true,
      });

      expect(reminderService.isTwaEnvironment()).toBe(false);
      expect(reminderService.isReminderSupported()).toBe(false);
    });

    it('returns true when referrer starts with android-app://', () => {
      delete window.location;
      window.location = new URL('https://example.com/mymeds/');

      Object.defineProperty(document, 'referrer', {
        value: 'android-app://org.mymeds.twa',
        configurable: true,
      });

      expect(reminderService.isTwaEnvironment()).toBe(true);
      expect(sessionStorage.getItem('is_twa')).toBe('true');
    });

    it('returns true on Android in standalone mode with periodicSync supported', () => {
      delete window.location;
      window.location = new URL('https://example.com/mymeds/');

      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/120.0.0.0 Mobile Safari/537.36',
        configurable: true,
      });

      Object.defineProperty(navigator, 'serviceWorker', {
        value: {},
        configurable: true,
      });

      window.Notification = { permission: 'default' };
      globalThis.ServiceWorkerRegistration = class {};
      ServiceWorkerRegistration.prototype.periodicSync = {};

      window.matchMedia = vi.fn().mockImplementation((query) => ({
        matches: query === '(display-mode: standalone)',
      }));

      expect(reminderService.isTwaEnvironment()).toBe(true);
      expect(reminderService.isReminderSupported()).toBe(true);
    });
  });

  describe('evaluateDueReminders', () => {
    it('returns no due slots if reminders are disabled', () => {
      const settings = {
        enabled: false,
        slots: [{ id: 'morning', time: '08:00', enabled: true }],
      };
      const result = reminderService.evaluateDueReminders(settings, new Date('2026-09-06T08:15:00'));
      expect(result.dueSlots).toHaveLength(0);
      expect(result.hasChanges).toBe(false);
    });

    it('returns due slot when current time is past slot time within lookback window', () => {
      const settings = {
        enabled: true,
        slots: [
          { id: 'morning', time: '08:00', enabled: true },
          { id: 'noon', time: '12:00', enabled: true },
        ],
        lastNotified: {},
      };

      const testDate = new Date('2026-09-06T08:15:00');
      const result = reminderService.evaluateDueReminders(settings, testDate);

      expect(result.dueSlots).toHaveLength(1);
      expect(result.dueSlots[0].id).toBe('morning');
      expect(result.hasChanges).toBe(true);
      expect(result.updatedLastNotified['2026-09-06_morning']).toBe(testDate.getTime());
    });

    it('does not return slot if already notified today', () => {
      const settings = {
        enabled: true,
        slots: [{ id: 'morning', time: '08:00', enabled: true }],
        lastNotified: {
          '2026-09-06_morning': 1725609600000,
        },
      };

      const testDate = new Date('2026-09-06T08:15:00');
      const result = reminderService.evaluateDueReminders(settings, testDate);

      expect(result.dueSlots).toHaveLength(0);
      expect(result.hasChanges).toBe(false);
    });

    it('does not trigger if slot time is in the future', () => {
      const settings = {
        enabled: true,
        slots: [{ id: 'morning', time: '08:00', enabled: true }],
        lastNotified: {},
      };

      const testDate = new Date('2026-09-06T07:45:00');
      const result = reminderService.evaluateDueReminders(settings, testDate);

      expect(result.dueSlots).toHaveLength(0);
      expect(result.hasChanges).toBe(false);
    });

    it('does not trigger if slot is past the lookback window (e.g. > 120 minutes ago)', () => {
      const settings = {
        enabled: true,
        slots: [{ id: 'morning', time: '08:00', enabled: true }],
        lastNotified: {},
      };

      // 08:00 is 180 minutes ago at 11:00
      const testDate = new Date('2026-09-06T11:00:00');
      const result = reminderService.evaluateDueReminders(settings, testDate);

      expect(result.dueSlots).toHaveLength(0);
      expect(result.hasChanges).toBe(false);
    });

    it('handles multiple slots and prunes entries older than 7 days', () => {
      const oldDate = new Date('2026-08-20T08:00:00').getTime();
      const settings = {
        enabled: true,
        slots: [
          { id: 'morning', time: '08:00', enabled: true },
          { id: 'noon', time: '12:00', enabled: true },
          { id: 'custom_1', time: '12:30', enabled: true },
        ],
        lastNotified: {
          '2026-08-20_morning': oldDate,
        },
      };

      const testDate = new Date('2026-09-06T12:35:00');
      const result = reminderService.evaluateDueReminders(settings, testDate);

      // noon (12:00) and custom_1 (12:30) are both within 120 mins of 12:35
      expect(result.dueSlots.map(s => s.id)).toEqual(['noon', 'custom_1']);
      // Old date pruned
      expect(result.updatedLastNotified['2026-08-20_morning']).toBeUndefined();
      expect(result.updatedLastNotified['2026-09-06_noon']).toBeDefined();
      expect(result.updatedLastNotified['2026-09-06_custom_1']).toBeDefined();
    });
  });
});
