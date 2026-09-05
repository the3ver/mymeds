import QRCode, { type QRCodeToDataURLOptions } from 'qrcode';

export interface QrCodeOptions {
  width?: number;
  margin?: number;
  darkColor?: string;
  lightColor?: string;
}

/**
 * Generates a QR Code as a Data URL (PNG base64).
 */
export async function generateQrCodeDataUrl(text: string, options: QrCodeOptions = {}): Promise<string> {
  const qrOptions: QRCodeToDataURLOptions = {
    width: options.width ?? 280,
    margin: options.margin ?? 1,
    color: {
      dark: options.darkColor ?? '#1e293b',
      light: options.lightColor ?? '#ffffff',
    },
  };

  return QRCode.toDataURL(text, qrOptions);
}
