import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  checkForAppUpdates,
  applyUpdateAndReload,
  onServiceWorkerUpdate
} from '../../src/modules/common/utils/updateService';

describe('updateService', () => {
  const originalNavigator = global.navigator;
  const originalWindow = global.window;

  afterEach(() => {
    global.navigator = originalNavigator;
    global.window = originalWindow;
    vi.restoreAllMocks();
  });

  describe('checkForAppUpdates', () => {
    it('returns supported: false if serviceWorker is not in navigator', async () => {
      global.navigator = {};
      const result = await checkForAppUpdates();
      expect(result.supported).toBe(false);
      expect(result.status).toBe('no_registration');
    });

    it('returns status: no_registration if getRegistration returns null', async () => {
      global.navigator = {
        serviceWorker: {
          getRegistration: vi.fn().mockResolvedValue(null)
        }
      };
      const result = await checkForAppUpdates();
      expect(result.supported).toBe(true);
      expect(result.status).toBe('no_registration');
    });

    it('returns status: update_ready if worker is already waiting', async () => {
      const mockReg = {
        waiting: { postMessage: vi.fn() },
        update: vi.fn().mockResolvedValue(undefined)
      };
      global.navigator = {
        serviceWorker: {
          getRegistration: vi.fn().mockResolvedValue(mockReg)
        }
      };
      const result = await checkForAppUpdates();
      expect(result.status).toBe('update_ready');
      expect(result.registration).toBe(mockReg);
      expect(mockReg.update).not.toHaveBeenCalled();
    });

    it('triggers registration.update and returns update_ready if worker starts waiting', async () => {
      const mockReg = {
        waiting: null,
        update: vi.fn().mockImplementation(async function () {
          this.waiting = { postMessage: vi.fn() };
        })
      };
      global.navigator = {
        serviceWorker: {
          getRegistration: vi.fn().mockResolvedValue(mockReg)
        }
      };
      const result = await checkForAppUpdates();
      expect(result.status).toBe('update_ready');
      expect(mockReg.update).toHaveBeenCalled();
    });

    it('triggers registration.update and returns update_found if worker is installing', async () => {
      const mockReg = {
        waiting: null,
        installing: null,
        update: vi.fn().mockImplementation(async function () {
          this.installing = { state: 'installing' };
        })
      };
      global.navigator = {
        serviceWorker: {
          getRegistration: vi.fn().mockResolvedValue(mockReg)
        }
      };
      const result = await checkForAppUpdates();
      expect(result.status).toBe('update_found');
    });

    it('triggers registration.update and returns up_to_date if nothing waiting or installing', async () => {
      const mockReg = {
        waiting: null,
        installing: null,
        update: vi.fn().mockResolvedValue(undefined)
      };
      global.navigator = {
        serviceWorker: {
          getRegistration: vi.fn().mockResolvedValue(mockReg)
        }
      };
      const result = await checkForAppUpdates();
      expect(result.status).toBe('up_to_date');
    });

    it('returns status: offline when update fails and navigator is offline', async () => {
      const mockReg = {
        waiting: null,
        update: vi.fn().mockRejectedValue(new Error('Network error'))
      };
      global.navigator = {
        onLine: false,
        serviceWorker: {
          getRegistration: vi.fn().mockResolvedValue(mockReg)
        }
      };
      const result = await checkForAppUpdates();
      expect(result.status).toBe('offline');
      expect(result.error).toBeDefined();
    });

    it('returns status: error when update fails and navigator is online', async () => {
      const mockReg = {
        waiting: null,
        update: vi.fn().mockRejectedValue(new Error('Internal error'))
      };
      global.navigator = {
        onLine: true,
        serviceWorker: {
          getRegistration: vi.fn().mockResolvedValue(mockReg)
        }
      };
      const result = await checkForAppUpdates();
      expect(result.status).toBe('error');
    });
  });

  describe('applyUpdateAndReload', () => {
    it('sends SKIP_WAITING to waiting worker and reloads on controllerchange', () => {
      const postMessage = vi.fn();
      const mockReg = {
        waiting: { postMessage }
      };
      const reload = vi.fn();
      global.window = { location: { reload } };

      let controllerChangeHandler = null;
      global.navigator = {
        serviceWorker: {
          addEventListener: vi.fn((event, handler) => {
            if (event === 'controllerchange') {
              controllerChangeHandler = handler;
            }
          }),
          getRegistration: vi.fn().mockResolvedValue(mockReg)
        }
      };

      applyUpdateAndReload(mockReg);

      expect(postMessage).toHaveBeenCalledWith({ type: 'SKIP_WAITING' });
      // Should NOT reload immediately before controllerchange
      expect(reload).not.toHaveBeenCalled();

      // Trigger controllerchange
      expect(controllerChangeHandler).toBeDefined();
      controllerChangeHandler();

      expect(reload).toHaveBeenCalledTimes(1);

      // Should not reload a second time if controllerchange fires again
      controllerChangeHandler();
      expect(reload).toHaveBeenCalledTimes(1);
    });

    it('falls back to reload if controllerchange does not fire within timeout', () => {
      vi.useFakeTimers();
      const postMessage = vi.fn();
      const mockReg = {
        waiting: { postMessage }
      };
      const reload = vi.fn();
      global.window = { location: { reload } };

      global.navigator = {
        serviceWorker: {
          addEventListener: vi.fn(),
          getRegistration: vi.fn().mockResolvedValue(mockReg)
        }
      };

      applyUpdateAndReload(mockReg);

      expect(reload).not.toHaveBeenCalled();

      // Advance time by 2500ms
      vi.advanceTimersByTime(2500);

      expect(reload).toHaveBeenCalledTimes(1);
      vi.useRealTimers();
    });

    it('waits for installing worker to become installed before sending SKIP_WAITING', () => {
      const postMessage = vi.fn();
      let stateChangeHandler = null;
      const mockInstalling = {
        state: 'installing',
        postMessage,
        addEventListener: vi.fn((event, handler) => {
          if (event === 'statechange') {
            stateChangeHandler = handler;
          }
        })
      };
      const mockReg = {
        waiting: null,
        installing: mockInstalling
      };
      const reload = vi.fn();
      global.window = { location: { reload } };

      let controllerChangeHandler = null;
      global.navigator = {
        serviceWorker: {
          addEventListener: vi.fn((event, handler) => {
            if (event === 'controllerchange') {
              controllerChangeHandler = handler;
            }
          }),
          getRegistration: vi.fn().mockResolvedValue(mockReg)
        }
      };

      applyUpdateAndReload(mockReg);

      expect(postMessage).not.toHaveBeenCalled();
      expect(mockInstalling.addEventListener).toHaveBeenCalledWith('statechange', expect.any(Function));

      // Transition installing worker to installed
      mockInstalling.state = 'installed';
      stateChangeHandler();

      expect(postMessage).toHaveBeenCalledWith({ type: 'SKIP_WAITING' });
      expect(reload).not.toHaveBeenCalled();

      // Trigger controllerchange
      controllerChangeHandler();
      expect(reload).toHaveBeenCalledTimes(1);
    });

    it('queries navigator.serviceWorker.getRegistration if registration argument is omitted', async () => {
      const postMessage = vi.fn();
      const mockReg = {
        waiting: { postMessage }
      };
      const reload = vi.fn();
      global.window = { location: { reload } };

      let controllerChangeHandler = null;
      global.navigator = {
        serviceWorker: {
          addEventListener: vi.fn((event, handler) => {
            if (event === 'controllerchange') {
              controllerChangeHandler = handler;
            }
          }),
          getRegistration: vi.fn().mockResolvedValue(mockReg)
        }
      };

      applyUpdateAndReload();

      await Promise.resolve(); // let getRegistration promise resolve

      expect(postMessage).toHaveBeenCalledWith({ type: 'SKIP_WAITING' });
      expect(reload).not.toHaveBeenCalled();

      controllerChangeHandler();
      expect(reload).toHaveBeenCalledTimes(1);
    });
  });

  describe('onServiceWorkerUpdate', () => {
    it('registers controllerchange event listener and cleans up', () => {
      const addEventListener = vi.fn();
      const removeEventListener = vi.fn();
      global.navigator = {
        serviceWorker: {
          addEventListener,
          removeEventListener,
          getRegistration: vi.fn()
        }
      };

      const cleanup = onServiceWorkerUpdate(vi.fn());
      expect(addEventListener).toHaveBeenCalledWith('controllerchange', expect.any(Function));

      cleanup();
      expect(removeEventListener).toHaveBeenCalledWith('controllerchange', expect.any(Function));
    });

    it('notifies callback immediately if worker is already waiting', async () => {
      const callback = vi.fn();
      const mockReg = {
        waiting: { postMessage: vi.fn() },
        addEventListener: vi.fn(),
        removeEventListener: vi.fn()
      };
      global.navigator = {
        serviceWorker: {
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          getRegistration: vi.fn().mockResolvedValue(mockReg)
        }
      };

      onServiceWorkerUpdate(callback);

      await Promise.resolve(); // let getRegistration resolve

      expect(callback).toHaveBeenCalledWith(mockReg);
    });

    it('listens for updatefound and notifies callback when installing worker is installed', async () => {
      const callback = vi.fn();
      let updateFoundHandler = null;
      let stateChangeHandler = null;
      const mockInstalling = {
        state: 'installing',
        addEventListener: vi.fn((event, handler) => {
          if (event === 'statechange') stateChangeHandler = handler;
        })
      };
      const mockReg = {
        waiting: null,
        installing: mockInstalling,
        addEventListener: vi.fn((event, handler) => {
          if (event === 'updatefound') updateFoundHandler = handler;
        }),
        removeEventListener: vi.fn()
      };
      global.navigator = {
        serviceWorker: {
          controller: {},
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          getRegistration: vi.fn().mockResolvedValue(mockReg)
        }
      };

      onServiceWorkerUpdate(callback);

      await Promise.resolve(); // let getRegistration resolve

      expect(mockReg.addEventListener).toHaveBeenCalledWith('updatefound', expect.any(Function));
      expect(callback).not.toHaveBeenCalled();

      // Trigger updatefound
      updateFoundHandler();
      expect(mockInstalling.addEventListener).toHaveBeenCalledWith('statechange', expect.any(Function));

      // Worker transitions to installed
      mockInstalling.state = 'installed';
      stateChangeHandler();

      expect(callback).toHaveBeenCalledWith(mockReg);
    });
  });
});
