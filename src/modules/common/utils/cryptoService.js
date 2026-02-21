const encoder = new TextEncoder();
const decoder = new TextDecoder();

/**
 * Generates a cryptographically secure random salt.
 * @returns {Uint8Array} A 16-byte salt.
 */
export function generateSalt() {
  return window.crypto.getRandomValues(new Uint8Array(16));
}

/**
 * Derives a cryptographic key from a password and a salt using PBKDF2.
 * @param {string} password - The user's password.
 * @param {Uint8Array} salt - The salt.
 * @returns {Promise<CryptoKey>} The derived key.
 */
export async function deriveKeyFromPassword(password, salt) {
  const importedKey = await window.crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    importedKey,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts data using AES-GCM.
 * @param {object} data - The JSON-serializable data to encrypt.
 * @param {CryptoKey} key - The encryption key.
 * @returns {Promise<{iv: Uint8Array, encryptedData: ArrayBuffer}>} The encrypted payload.
 */
export async function encryptData(data, key) {
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const dataString = JSON.stringify(data);

  const encryptedData = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    key,
    encoder.encode(dataString)
  );

  return { iv, encryptedData };
}

/**
 * Decrypts data using AES-GCM.
 * @param {ArrayBuffer} encryptedData - The encrypted data.
 * @param {Uint8Array} iv - The initialization vector.
 * @param {CryptoKey} key - The decryption key.
 * @returns {Promise<object>} The decrypted data as a JavaScript object.
 */
export async function decryptData(encryptedData, iv, key) {
  const decryptedData = await window.crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    key,
    encryptedData
  );

  return JSON.parse(decoder.decode(decryptedData));
}
