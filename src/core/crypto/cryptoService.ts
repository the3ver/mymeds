const encoder = new TextEncoder();
const decoder = new TextDecoder();

function getSubtleCrypto(): SubtleCrypto {
  const cryptoObj = typeof window !== 'undefined' ? window.crypto : (globalThis as any).crypto;
  if (!cryptoObj || !cryptoObj.subtle) {
    throw new Error('Web Cryptography API (crypto.subtle) is not available in this environment.');
  }
  return cryptoObj.subtle;
}

function getRandomValues<T extends ArrayBufferView | null>(array: T): T {
  const cryptoObj = typeof window !== 'undefined' ? window.crypto : (globalThis as any).crypto;
  if (!cryptoObj || !cryptoObj.getRandomValues) {
    throw new Error('Web Cryptography API (crypto.getRandomValues) is not available.');
  }
  return cryptoObj.getRandomValues(array);
}

/**
 * Generates a cryptographically secure random salt.
 * @param byteLength Default is 16 bytes (128-bit).
 */
export function generateSalt(byteLength = 16): Uint8Array {
  return getRandomValues(new Uint8Array(byteLength));
}

/**
 * Generates a cryptographically secure random IV for AES-GCM.
 * @param byteLength Default is 12 bytes (96-bit, recommended for AES-GCM).
 */
export function generateIv(byteLength = 12): Uint8Array {
  return getRandomValues(new Uint8Array(byteLength));
}

/**
 * Derives a 256-bit AES-GCM key from a user password and salt using PBKDF2.
 * @param password The user password string.
 * @param salt Cryptographic salt.
 * @param iterations PBKDF2 iterations (default: 100,000).
 */
export async function deriveKeyFromPassword(
  password: string,
  salt: ArrayBuffer | Uint8Array,
  iterations = 100000
): Promise<CryptoKey> {
  const subtle = getSubtleCrypto();

  const importedKey = await subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as BufferSource,
      iterations,
      hash: 'SHA-256',
    },
    importedKey,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts a JSON-serializable object using AES-GCM.
 * Generates a fresh random 12-byte IV for each encryption.
 */
export async function encryptData<T = unknown>(
  data: T,
  key: CryptoKey
): Promise<{ iv: Uint8Array; encryptedData: ArrayBuffer }> {
  const subtle = getSubtleCrypto();
  const iv = generateIv(12);
  const jsonString = JSON.stringify(data);

  const encryptedData = await subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv as BufferSource,
    },
    key,
    encoder.encode(jsonString)
  );

  return { iv, encryptedData };
}

/**
 * Decrypts an AES-GCM encrypted payload (ArrayBuffer or Uint8Array) back into the original typed object.
 */
export async function decryptData<T = unknown>(
  encryptedData: ArrayBuffer | Uint8Array,
  iv: ArrayBuffer | Uint8Array,
  key: CryptoKey
): Promise<T> {
  const subtle = getSubtleCrypto();

  const decryptedBuffer = await subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: iv as BufferSource,
    },
    key,
    encryptedData as BufferSource
  );

  return JSON.parse(decoder.decode(decryptedBuffer)) as T;
}
