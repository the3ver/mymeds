/**
 * Converts an ArrayBuffer or Uint8Array to a Base64 string.
 */
export function bufferToBase64(buffer: Uint8Array | ArrayBuffer | null | undefined): string {
  if (!buffer) return '';
  const uint8 = buffer instanceof Uint8Array
    ? new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength)
    : new Uint8Array(buffer);
  let binary = '';
  const len = uint8.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(uint8[i]);
  }
  return btoa(binary);
}

/**
 * Converts a Base64 string to a Uint8Array.
 */
export function base64ToBuffer(base64: string | null | undefined): Uint8Array {
  if (!base64 || typeof base64 !== 'string') return new Uint8Array(0);
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}
