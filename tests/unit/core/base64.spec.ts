import { describe, it, expect } from 'vitest';
import { bufferToBase64, base64ToBuffer } from '../../../src/core/crypto/base64';

describe('core/crypto/base64', () => {
  it('converts Uint8Array to Base64 and back accurately', () => {
    const original = new Uint8Array([0, 1, 2, 255, 128, 64, 32, 16, 8, 4]);
    const base64 = bufferToBase64(original);
    expect(typeof base64).toBe('string');
    expect(base64.length).toBeGreaterThan(0);

    const restored = base64ToBuffer(base64);
    expect(restored).toEqual(original);
  });

  it('handles empty or null inputs gracefully', () => {
    expect(bufferToBase64(null)).toBe('');
    expect(bufferToBase64(undefined)).toBe('');
    expect(base64ToBuffer('')).toEqual(new Uint8Array(0));
    expect(base64ToBuffer(null)).toEqual(new Uint8Array(0));
  });

  it('converts ArrayBuffer cleanly', () => {
    const uint8 = new Uint8Array([65, 66, 67]); // 'ABC'
    const base64 = bufferToBase64(uint8.buffer);
    expect(base64).toBe('QUJD');
    expect(base64ToBuffer('QUJD')).toEqual(uint8);
  });
});
