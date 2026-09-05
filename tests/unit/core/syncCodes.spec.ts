import { describe, it, expect } from 'vitest';
import { generateSyncCode, normalizeSyncCode } from '../../../src/core/sync/syncCodes';

describe('core/sync/syncCodes', () => {
  it('generates a 6-character code by default', () => {
    const code = generateSyncCode();
    expect(code).toHaveLength(6);
    expect(/^[2-9A-HJ-NP-Z]{6}$/.test(code)).toBe(true);
  });

  it('excludes ambiguous characters (0, O, 1, I)', () => {
    for (let i = 0; i < 50; i++) {
      const code = generateSyncCode();
      expect(code).not.toMatch(/[0O1I]/);
    }
  });

  it('normalizes codes with spaces, dashes, and lowercase', () => {
    expect(normalizeSyncCode(' ab-34 cd ')).toBe('AB34CD');
    expect(normalizeSyncCode('k-7-m-9-q-r')).toBe('K7M9QR');
    expect(normalizeSyncCode('')).toBe('');
    expect(normalizeSyncCode(null)).toBe('');
  });
});
