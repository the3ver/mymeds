import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as storageService from '../../src/modules/common/utils/storagePersistenceService';

describe('storagePersistenceService', () => {
  const originalStorage = navigator.storage;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    Object.defineProperty(navigator, 'storage', {
      value: originalStorage,
      configurable: true,
      writable: true,
    });
  });

  describe('isPersistenceSupported', () => {
    it('returns true when navigator.storage.persist and persisted exist, false otherwise', () => {
      Object.defineProperty(navigator, 'storage', {
        value: {
          persist: vi.fn(),
          persisted: vi.fn(),
          estimate: vi.fn(),
        },
        configurable: true,
        writable: true,
      });
      expect(storageService.isPersistenceSupported()).toBe(true);

      Object.defineProperty(navigator, 'storage', {
        value: undefined,
        configurable: true,
        writable: true,
      });
      expect(storageService.isPersistenceSupported()).toBe(false);
    });
  });

  describe('isStoragePersisted', () => {
    it('returns true if navigator.storage.persisted resolves true, false if false or unsupported', async () => {
      const persistedMock = vi.fn().mockResolvedValue(true);
      Object.defineProperty(navigator, 'storage', {
        value: {
          persist: vi.fn(),
          persisted: persistedMock,
        },
        configurable: true,
        writable: true,
      });

      const res = await storageService.isStoragePersisted();
      expect(res).toBe(true);
      expect(persistedMock).toHaveBeenCalledTimes(1);

      persistedMock.mockResolvedValue(false);
      expect(await storageService.isStoragePersisted()).toBe(false);

      // Graceful degradation when unsupported
      Object.defineProperty(navigator, 'storage', {
        value: undefined,
        configurable: true,
        writable: true,
      });
      expect(await storageService.isStoragePersisted()).toBe(false);
    });
  });

  describe('requestPersistence', () => {
    it('calls navigator.storage.persist() and returns the resulting boolean', async () => {
      const persistMock = vi.fn().mockResolvedValue(true);
      Object.defineProperty(navigator, 'storage', {
        value: {
          persist: persistMock,
          persisted: vi.fn().mockResolvedValue(false),
        },
        configurable: true,
        writable: true,
      });

      const res = await storageService.requestPersistence();
      expect(res).toBe(true);
      expect(persistMock).toHaveBeenCalledTimes(1);

      persistMock.mockResolvedValue(false);
      expect(await storageService.requestPersistence()).toBe(false);

      // Throws error
      persistMock.mockRejectedValue(new Error('Permission denied'));
      expect(await storageService.requestPersistence()).toBe(false);

      // Unsupported
      Object.defineProperty(navigator, 'storage', {
        value: undefined,
        configurable: true,
        writable: true,
      });
      expect(await storageService.requestPersistence()).toBe(false);
    });
  });

  describe('formatBytes', () => {
    it('formats bytes into human readable units', () => {
      expect(storageService.formatBytes(0)).toBe('0 B');
      expect(storageService.formatBytes(512)).toBe('512 B');
      expect(storageService.formatBytes(1024)).toBe('1 KB');
      expect(storageService.formatBytes(1536)).toBe('1.5 KB');
      expect(storageService.formatBytes(1048576)).toBe('1 MB');
      expect(storageService.formatBytes(1073741824)).toBe('1 GB');
    });
  });

  describe('getStorageEstimate', () => {
    it('returns formatted usage, quota and percentage when supported', async () => {
      const estimateMock = vi.fn().mockResolvedValue({
        usage: 2097152, // 2 MB
        quota: 209715200, // 200 MB
      });
      Object.defineProperty(navigator, 'storage', {
        value: {
          estimate: estimateMock,
          persist: vi.fn(),
          persisted: vi.fn(),
        },
        configurable: true,
        writable: true,
      });

      const est = await storageService.getStorageEstimate();
      expect(est.supported).toBe(true);
      expect(est.usage).toBe(2097152);
      expect(est.quota).toBe(209715200);
      expect(est.usageFormatted).toBe('2 MB');
      expect(est.quotaFormatted).toBe('200 MB');
      expect(est.percentUsed).toBe(1);

      // Handle unsupported gracefully
      Object.defineProperty(navigator, 'storage', {
        value: undefined,
        configurable: true,
        writable: true,
      });
      const fallback = await storageService.getStorageEstimate();
      expect(fallback.supported).toBe(false);
      expect(fallback.usage).toBe(0);
      expect(fallback.quota).toBe(0);
    });
  });

  describe('autoRequestPersistence', () => {
    it('does not call persist if already persisted', async () => {
      const persistMock = vi.fn().mockResolvedValue(true);
      const persistedMock = vi.fn().mockResolvedValue(true);
      Object.defineProperty(navigator, 'storage', {
        value: {
          persist: persistMock,
          persisted: persistedMock,
        },
        configurable: true,
        writable: true,
      });

      const res = await storageService.autoRequestPersistence();
      expect(res).toBe(true);
      expect(persistedMock).toHaveBeenCalled();
      expect(persistMock).not.toHaveBeenCalled();
    });

    it('calls persist if not already persisted', async () => {
      const persistMock = vi.fn().mockResolvedValue(true);
      const persistedMock = vi.fn().mockResolvedValue(false);
      Object.defineProperty(navigator, 'storage', {
        value: {
          persist: persistMock,
          persisted: persistedMock,
        },
        configurable: true,
        writable: true,
      });

      const res = await storageService.autoRequestPersistence();
      expect(res).toBe(true);
      expect(persistedMock).toHaveBeenCalled();
      expect(persistMock).toHaveBeenCalledTimes(1);
    });
  });
});
