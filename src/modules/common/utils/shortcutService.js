/**
 * Service for handling PWA App Shortcuts and Launch Intents
 */

/**
 * Parses URL search string for shortcut intents.
 * Supported intents:
 * - tab: 'meds' | 'calendar'
 * - action: 'scan'
 * @param {string} [searchStr]
 * @returns {{ tab: string|null, action: string|null }}
 */
export function parseShortcutIntent(searchStr) {
  if (!searchStr) {
    return { tab: null, action: null };
  }

  const query = searchStr.startsWith('?') ? searchStr.slice(1) : searchStr;
  const params = new URLSearchParams(query);

  const rawTab = params.get('tab');
  const rawAction = params.get('action');

  const validTabs = ['meds', 'calendar'];
  const validActions = ['scan'];

  const tab = validTabs.includes(rawTab) ? rawTab : null;
  const action = validActions.includes(rawAction) ? rawAction : null;

  return { tab, action };
}

/**
 * Checks window.location.search for shortcut intents, cleans up the URL, and returns the intent.
 * @returns {{ tab: string|null, action: string|null }}
 */
export function consumeShortcutIntent() {
  if (typeof window === 'undefined' || !window.location) {
    return { tab: null, action: null };
  }

  const { tab, action } = parseShortcutIntent(window.location.search);

  if (tab || action) {
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('tab');
      url.searchParams.delete('action');
      const cleanUrl = url.pathname + (url.searchParams.toString() ? '?' + url.searchParams.toString() : '') + url.hash;
      if (window.history && typeof window.history.replaceState === 'function') {
        window.history.replaceState(null, '', cleanUrl);
      }
    } catch (err) {
      console.warn('[shortcutService] Error cleaning URL parameters:', err);
    }
  }

  return { tab, action };
}

