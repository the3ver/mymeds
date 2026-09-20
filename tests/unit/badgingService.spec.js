import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as badgingService from '../../src/modules/common/utils/badgingService';

describe('badgingService', () => {
  const originalSetAppBadge = navigator.setAppBadge;
  const originalClearAppBadge = navigator.clearAppBadge;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    Object.defineProperty(navigator, 'setAppBadge', {
      value: originalSetAppBadge,
      configurable: true,
      writable: true,
    });
    Object.defineProperty(navigator, 'clearAppBadge', {
      value: originalClearAppBadge,
      configurable: true,
      writable: true,
    });
  });

  describe('isBadgingSupported', () => {
    it('returns true if setAppBadge and clearAppBadge are present on navigator, false otherwise', () => {
      Object.defineProperty(navigator, 'setAppBadge', {
        value: vi.fn(),
        configurable: true,
        writable: true,
      });
      Object.defineProperty(navigator, 'clearAppBadge', {
        value: vi.fn(),
        configurable: true,
        writable: true,
      });

      expect(badgingService.isBadgingSupported()).toBe(true);

      Object.defineProperty(navigator, 'setAppBadge', {
        value: undefined,
        configurable: true,
        writable: true,
      });
      expect(badgingService.isBadgingSupported()).toBe(false);
    });
  });

  describe('setBadge and clearBadge', () => {
    it('sets app badge when count > 0 and clears when count <= 0', async () => {
      const setSpy = vi.fn().mockResolvedValue(undefined);
      const clearSpy = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, 'setAppBadge', { value: setSpy, configurable: true, writable: true });
      Object.defineProperty(navigator, 'clearAppBadge', { value: clearSpy, configurable: true, writable: true });

      await badgingService.setBadge(3);
      expect(setSpy).toHaveBeenCalledWith(3);
      expect(clearSpy).not.toHaveBeenCalled();

      setSpy.mockClear();
      await badgingService.setBadge(0);
      expect(clearSpy).toHaveBeenCalledTimes(1);
      expect(setSpy).not.toHaveBeenCalled();

      clearSpy.mockClear();
      await badgingService.clearBadge();
      expect(clearSpy).toHaveBeenCalledTimes(1);
    });

    it('gracefully handles errors or unsupported environment', async () => {
      Object.defineProperty(navigator, 'setAppBadge', { value: undefined, configurable: true, writable: true });
      Object.defineProperty(navigator, 'clearAppBadge', { value: undefined, configurable: true, writable: true });

      await expect(badgingService.setBadge(5)).resolves.not.toThrow();
      await expect(badgingService.clearBadge()).resolves.not.toThrow();
    });
  });

  describe('updateCriticalMedsBadge', () => {
    it('sets badge to number of meds at or below red limit and clears badge if zero', async () => {
      const setSpy = vi.fn().mockResolvedValue(undefined);
      const clearSpy = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, 'setAppBadge', { value: setSpy, configurable: true, writable: true });
      Object.defineProperty(navigator, 'clearAppBadge', { value: clearSpy, configurable: true, writable: true });

      const meds = [
        { name: 'Med A', dose: '1', count: 3 }, // 3 days remaining (<= 7) -> CRITICAL
        { name: 'Med B', dose: '2', count: 4 }, // 2 days remaining (<= 7) -> CRITICAL
        { name: 'Med C', dose: '1', count: 30 }, // 30 days remaining (> 7) -> OK
        { name: 'Med D', dose: '0', count: 10 }, // dose 0 (null days) -> IGNORED
      ];

      const count = await badgingService.updateCriticalMedsBadge(meds, 7);
      expect(count).toBe(2);
      expect(setSpy).toHaveBeenCalledWith(2);

      // When no meds are critical
      setSpy.mockClear();
      const okMeds = [
        { name: 'Med C', dose: '1', count: 30 },
      ];
      const countOk = await badgingService.updateCriticalMedsBadge(okMeds, 7);
      expect(countOk).toBe(0);
      expect(clearSpy).toHaveBeenCalled();
    });
  });
});
