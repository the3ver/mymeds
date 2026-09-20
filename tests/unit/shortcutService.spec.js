import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as shortcutService from '../../src/modules/common/utils/shortcutService';

describe('shortcutService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('parseShortcutIntent', () => {
    it('correctly parses tab and action from query string', () => {
      expect(shortcutService.parseShortcutIntent('?tab=calendar')).toEqual({
        tab: 'calendar',
        action: null,
      });

      expect(shortcutService.parseShortcutIntent('?action=scan')).toEqual({
        tab: null,
        action: 'scan',
      });

      expect(shortcutService.parseShortcutIntent('?tab=meds&action=scan')).toEqual({
        tab: 'meds',
        action: 'scan',
      });

      expect(shortcutService.parseShortcutIntent('')).toEqual({
        tab: null,
        action: null,
      });

      expect(shortcutService.parseShortcutIntent('?foo=bar')).toEqual({
        tab: null,
        action: null,
      });
    });
  });

  describe('consumeShortcutIntent', () => {
    it('consumes shortcut intent and cleans up url parameters', () => {
      delete window.location;
      window.location = new URL('https://example.com/mymeds/?tab=calendar&action=scan&keep=1');
      const replaceSpy = vi.spyOn(window.history, 'replaceState').mockImplementation(() => {});

      const intent = shortcutService.consumeShortcutIntent();
      expect(intent).toEqual({
        tab: 'calendar',
        action: 'scan',
      });

      // replaceState should have been called removing tab and action but keeping other params
      expect(replaceSpy).toHaveBeenCalledTimes(1);
      const newUrl = replaceSpy.mock.calls[0][2];
      expect(newUrl).toContain('keep=1');
      expect(newUrl).not.toContain('tab=');
      expect(newUrl).not.toContain('action=');
    });

    it('does not call replaceState if no shortcut intent was present', () => {
      delete window.location;
      window.location = new URL('https://example.com/mymeds/?other=1');
      const replaceSpy = vi.spyOn(window.history, 'replaceState').mockImplementation(() => {});

      const intent = shortcutService.consumeShortcutIntent();
      expect(intent).toEqual({
        tab: null,
        action: null,
      });
      expect(replaceSpy).not.toHaveBeenCalled();
    });
  });
});
