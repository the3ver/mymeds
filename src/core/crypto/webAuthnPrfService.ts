import { generateSalt, generateIv } from './cryptoService';
import { bufferToBase64, base64ToBuffer } from './base64';

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function getSubtleCrypto(): SubtleCrypto {
  const cryptoObj = typeof window !== 'undefined' ? window.crypto : (globalThis as any).crypto;
  if (!cryptoObj || !cryptoObj.subtle) {
    throw new Error('Web Cryptography API (crypto.subtle) is not available in this environment.');
  }
  return cryptoObj.subtle;
}

/**
 * Checks whether WebAuthn is available in the current environment.
 */
export function isWebAuthnAvailable(): boolean {
  return typeof window !== 'undefined' && typeof window.PublicKeyCredential !== 'undefined';
}

/**
 * Checks whether the WebAuthn PRF (Pseudo-Random Function) extension is supported
 * by the browser and platform authenticator.
 */
export async function isPrfSupported(): Promise<boolean> {
  if (!isWebAuthnAvailable()) {
    return false;
  }

  try {
    // Check modern getClientCapabilities API if supported
    if (typeof (window.PublicKeyCredential as any).getClientCapabilities === 'function') {
      const caps = await (window.PublicKeyCredential as any).getClientCapabilities();
      if (caps && typeof caps.prf === 'boolean') {
        return caps.prf;
      }
    }

    // Check if platform authenticator is available
    if (typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function') {
      const isAvailable = await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      return isAvailable;
    }
  } catch (err) {
    console.warn('[webAuthnPrfService] Capability check failed:', err);
  }

  return false;
}

/**
 * Derives a 256-bit AES-GCM CryptoKey from authenticator PRF output via HKDF (SHA-256).
 * @param prfOutput The 32-byte secret output returned by WebAuthn PRF evaluation.
 * @param salt Cryptographic salt used for HKDF extraction.
 */
export async function deriveAesKeyFromPrfOutput(
  prfOutput: ArrayBuffer | Uint8Array,
  salt: Uint8Array
): Promise<CryptoKey> {
  const subtle = getSubtleCrypto();

  const keyBytes = prfOutput instanceof Uint8Array ? prfOutput : new Uint8Array(prfOutput);
  const saltBytes = salt instanceof Uint8Array ? salt : new Uint8Array(salt);

  const hkdfKey = await subtle.importKey(
    'raw',
    keyBytes as BufferSource,
    { name: 'HKDF' },
    false,
    ['deriveKey']
  );

  return subtle.deriveKey(
    {
      name: 'HKDF',
      hash: 'SHA-256',
      salt: saltBytes as BufferSource,
      info: encoder.encode('MyMeds-Biometric-Session-SWK'),
    },
    hkdfKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Wraps (encrypts) the user's master password using the PRF-derived Session-Wrapping-Key.
 */
export async function wrapPassword(
  password: string,
  key: CryptoKey
): Promise<{ wrappedPassword: ArrayBuffer; iv: Uint8Array }> {
  const subtle = getSubtleCrypto();
  const iv = generateIv(12);

  const wrappedPassword = await subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv as BufferSource,
    },
    key,
    encoder.encode(password)
  );

  return { wrappedPassword, iv };
}

/**
 * Unwraps (decrypts) the user's master password using the PRF-derived Session-Wrapping-Key.
 */
export async function unwrapPassword(
  wrappedPassword: ArrayBuffer | Uint8Array,
  iv: ArrayBuffer | Uint8Array,
  key: CryptoKey
): Promise<string> {
  const subtle = getSubtleCrypto();

  const wrappedBytes = wrappedPassword instanceof Uint8Array ? wrappedPassword : new Uint8Array(wrappedPassword);
  const ivBytes = iv instanceof Uint8Array ? iv : new Uint8Array(iv);

  const decryptedBuffer = await subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: ivBytes as BufferSource,
    },
    key,
    wrappedBytes as BufferSource
  );

  return decoder.decode(decryptedBuffer);
}

export interface PrfCredentialResult {
  credentialId: string;
  rawId: Uint8Array;
  prfEnabled: boolean;
  initialPrfKey?: CryptoKey;
}

/**
 * Registers a new hardware-bound WebAuthn credential requesting PRF capabilities.
 */
export async function createPrfCredential(
  rpName = 'MyMeds',
  userName = 'MyMeds Vault User',
  prfSalt?: Uint8Array
): Promise<PrfCredentialResult> {
  if (!isWebAuthnAvailable()) {
    throw new Error('WebAuthn is not supported on this platform.');
  }

  const challenge = generateSalt(32);
  const userId = generateSalt(16);
  const rpId = (typeof window !== 'undefined' && window.location?.hostname)
    ? window.location.hostname
    : 'localhost';

  const extensions: any = {
    prf: prfSalt ? { eval: { first: prfSalt } } : {}
  };

  const credential = await navigator.credentials.create({
    publicKey: {
      challenge: challenge as BufferSource,
      rp: { name: rpName, id: rpId },
      user: {
        id: userId as BufferSource,
        name: userName,
        displayName: userName,
      },
      pubKeyCredParams: [
        { alg: -7, type: 'public-key' },  // ES256
        { alg: -257, type: 'public-key' } // RS256
      ],
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        userVerification: 'required',
        residentKey: 'preferred',
      },
      timeout: 60000,
      attestation: 'none',
      extensions,
    },
  }) as PublicKeyCredential | null;

  if (!credential) {
    throw new Error('Biometric registration was cancelled or failed.');
  }

  const rawId = new Uint8Array(credential.rawId);
  const credentialId = bufferToBase64(rawId);

  const extResults = credential.getClientExtensionResults ? credential.getClientExtensionResults() : {};
  const prfEnabled = !!(extResults as any).prf?.enabled;

  let initialPrfKey: CryptoKey | undefined;
  const firstPrfResult = (extResults as any).prf?.results?.first;
  if (firstPrfResult && prfSalt) {
    initialPrfKey = await deriveAesKeyFromPrfOutput(firstPrfResult, prfSalt);
  }

  return {
    credentialId,
    rawId,
    prfEnabled,
    initialPrfKey,
  };
}

/**
 * Prompts user for biometrics via navigator.credentials.get and evaluates PRF.
 * Returns the derived AES-GCM session key.
 */
export async function getPrfKey(
  credentialId: string | Uint8Array,
  prfSalt: Uint8Array
): Promise<CryptoKey> {
  if (!isWebAuthnAvailable()) {
    throw new Error('WebAuthn is not supported on this platform.');
  }

  const challenge = generateSalt(32);
  const rawCredId = typeof credentialId === 'string' ? base64ToBuffer(credentialId) : credentialId;

  const assertion = await navigator.credentials.get({
    publicKey: {
      challenge: challenge as BufferSource,
      allowCredentials: [
        {
          id: rawCredId as BufferSource,
          type: 'public-key',
          transports: ['internal'],
        },
      ],
      userVerification: 'required',
      timeout: 60000,
      extensions: {
        prf: {
          eval: {
            first: prfSalt as BufferSource,
          },
        },
      },
    },
  }) as PublicKeyCredential | null;

  if (!assertion) {
    throw new Error('Biometric authentication was cancelled or failed.');
  }

  const extResults = assertion.getClientExtensionResults ? assertion.getClientExtensionResults() : {};
  const prfResult = (extResults as any).prf?.results?.first;

  if (!prfResult) {
    throw new Error('PRF result not returned by authenticator.');
  }

  return deriveAesKeyFromPrfOutput(prfResult, prfSalt);
}
