const SYNC_CHARS = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // Excludes ambiguous chars (0, O, 1, I)

/**
 * Generates an alphanumeric, human-friendly pairing code.
 * @param length Defaults to 6 characters.
 */
export function generateSyncCode(length = 6): string {
  let code = '';
  for (let i = 0; i < length; i++) {
    code += SYNC_CHARS.charAt(Math.floor(Math.random() * SYNC_CHARS.length));
  }
  return code;
}

/**
 * Normalizes user-entered sync code by stripping whitespace/hyphens and uppercasing.
 */
export function normalizeSyncCode(code: string | null | undefined): string {
  if (!code || typeof code !== 'string') return '';
  return code.replace(/[^0-9A-Za-z]/g, '').toUpperCase();
}
