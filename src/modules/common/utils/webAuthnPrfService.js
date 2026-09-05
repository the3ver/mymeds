/**
 * Re-exported from @core/crypto for application use.
 */
export {
  isWebAuthnAvailable,
  isPrfSupported,
  deriveAesKeyFromPrfOutput,
  wrapPassword,
  unwrapPassword,
  createPrfCredential,
  getPrfKey
} from '../../../core/crypto/webAuthnPrfService';
