import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as hapticService from '../../src/modules/common/utils/hapticService';

describe('hapticService', () => {
  const originalVibrate = navigator.vibrate;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    Object.defineProperty(navigator, 'vibrate', {
      value: originalVibrate,
      configurable: true,
      writable: true,
    });
  });

  describe('isHapticsSupported', () => {
    it('returns true when navigator.vibrate is a function, false otherwise', () => {
      Object.defineProperty(navigator, 'vibrate', {
        value: vi.fn(),
        configurable: true,
        writable: true,
      });
      expect(hapticService.isHapticsSupported()).toBe(true);

      Object.defineProperty(navigator, 'vibrate', {
        value: undefined,
        configurable: true,
        writable: true,
      });
      expect(hapticService.isHapticsSupported()).toBe(false);
    });
  });

  describe('vibrate and patterns', () => {
    it('triggers navigator.vibrate with given pattern', () => {
      const vibrateSpy = vi.fn().mockReturnValue(true);
      Object.defineProperty(navigator, 'vibrate', {
        value: vibrateSpy,
        configurable: true,
        writable: true,
      });

      hapticService.vibrate(50);
      expect(vibrateSpy).toHaveBeenCalledWith(50);

      hapticService.vibrateSuccess();
      expect(vibrateSpy).toHaveBeenCalledWith(40);

      hapticService.vibrateWarning();
      expect(vibrateSpy).toHaveBeenCalledWith([40, 60, 40]);

      hapticService.vibrateError();
      expect(vibrateSpy).toHaveBeenCalledWith([80, 50, 80]);
    });

    it('gracefully handles missing vibrate or exceptions', () => {
      const throwingVibrate = vi.fn().mockImplementation(() => {
        throw new Error('Not allowed by user gesture');
      });
      Object.defineProperty(navigator, 'vibrate', {
        value: throwingVibrate,
        configurable: true,
        writable: true,
      });

      expect(() => hapticService.vibrate(40)).not.toThrow();
    });
  });

  describe('user preference setting', () => {
    it('respects hapticFeedback setting and does not vibrate when disabled', async () => {
      const vibrateSpy = vi.fn().mockReturnValue(true);
      Object.defineProperty(navigator, 'vibrate', {
        value: vibrateSpy,
        configurable: true,
        writable: true,
      });

      hapticService.setHapticsEnabled(false);
      expect(hapticService.isHapticsEnabled()).toBe(false);

      hapticService.vibrateSuccess();
      expect(vibrateSpy).not.toHaveBeenCalled();

      hapticService.setHapticsEnabled(true);
      expect(hapticService.isHapticsEnabled()).toBe(true);

      hapticService.vibrateSuccess();
      expect(vibrateSpy).toHaveBeenCalledWith(40);
    });
  });
});
