import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { state, unlock, lock } from '../../src/app-state';
import * as dataService from '../../src/modules/common/utils/dataService';

vi.mock('../../src/modules/common/utils/dataService', () => ({
  saveAndLockDatabase: vi.fn().mockResolvedValue(true),
}));

describe('app-state', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    await lock();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('unlock', () => {
    it('should set state properties, increment version and unlock app', () => {
      const mockData = {
        meds: [{ name: 'Aspirin', count: 10, dose: '1' }],
        calendar: [{ title: 'Termin', date: '2026-10-01' }],
        lastDoseUpdate: '2026-08-27',
      };
      const deductions = { Aspirin: 1 };
      const initialVersion = state.decryptedData.version;

      unlock(1, 'super-secret', mockData, deductions);

      expect(state.isLocked).toBe(false);
      expect(state.activeDatabaseId).toBe(1);
      expect(state.activeDatabasePassword).toBe('super-secret');
      expect(state.decryptedData.meds).toEqual(mockData.meds);
      expect(state.decryptedData.calendar).toEqual(mockData.calendar);
      expect(state.decryptedData.lastDoseUpdate).toBe('2026-08-27');
      expect(state.deductions).toEqual(deductions);
      expect(state.decryptedData.version).toBe(initialVersion + 1);
    });

    it('should handle empty/fallback data on unlock', () => {
      unlock(2, 'password', {});

      expect(state.isLocked).toBe(false);
      expect(state.decryptedData.meds).toEqual([]);
      expect(state.decryptedData.calendar).toEqual([]);
      expect(state.deductions).toEqual({});
    });
  });

  describe('lock', () => {
    it('should clear sensitive data and lock app', async () => {
      unlock(1, 'password', {
        meds: [{ name: 'Med 1' }],
        calendar: [{ title: 'Event 1' }],
        lastDoseUpdate: '2026-08-27',
      });

      await lock();

      expect(state.isLocked).toBe(true);
      expect(state.activeDatabaseId).toBeNull();
      expect(state.activeDatabasePassword).toBeNull();
      expect(state.decryptedData.meds).toEqual([]);
      expect(state.decryptedData.calendar).toEqual([]);
      expect(state.decryptedData.lastDoseUpdate).toBeNull();
      expect(state.deductions).toEqual({});
    });
  });

  describe('auto-save watcher', () => {
    it('should trigger debounced save when decryptedData changes while unlocked', async () => {
      unlock(1, 'password', { meds: [] });
      vi.clearAllMocks();

      state.decryptedData.meds.push({ name: 'Neues Medikament', count: 20 });

      // Fast forward less than debounce timeout
      vi.advanceTimersByTime(200);
      expect(dataService.saveAndLockDatabase).not.toHaveBeenCalled();

      // Fast forward past debounce timeout (500ms)
      vi.advanceTimersByTime(350);
      await vi.runAllTimersAsync();

      expect(dataService.saveAndLockDatabase).toHaveBeenCalledWith(
        1,
        'password',
        expect.objectContaining({
          meds: expect.arrayContaining([expect.objectContaining({ name: 'Neues Medikament' })]),
        })
      );
    });
  });
});
