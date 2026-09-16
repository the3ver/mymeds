import { describe, it, expect, vi, beforeEach } from 'vitest';
import { isBarcodeDetectorSupported, decodeImageData } from '../../src/modules/meds/utils/bmpScannerService';

describe('bmpScannerService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should detect if BarcodeDetector is supported in the current environment', () => {
    // In JSDOM by default BarcodeDetector is undefined
    expect(isBarcodeDetectorSupported()).toBe(false);

    // Mock BarcodeDetector
    globalThis.BarcodeDetector = class MockBarcodeDetector {
      static async getSupportedFormats() {
        return ['data_matrix', 'qr_code'];
      }
    };
    expect(isBarcodeDetectorSupported()).toBe(true);
    delete globalThis.BarcodeDetector;
  });

  it('should decode using mock BarcodeDetector when available', async () => {
    const mockRawValue = '<MP v="025"><S><M a="TestMed" m="1"/></S></MP>';
    globalThis.BarcodeDetector = class MockBarcodeDetector {
      async detect() {
        return [{ rawValue: mockRawValue, format: 'data_matrix' }];
      }
    };

    const mockCanvas = document.createElement('canvas');
    const result = await decodeImageData(mockCanvas);
    expect(result).toBe(mockRawValue);

    delete globalThis.BarcodeDetector;
  });
});
