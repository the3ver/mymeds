import {
  BrowserMultiFormatReader,
  BarcodeFormat,
  DecodeHintType
} from '@zxing/library';

let zxingReaderInstance = null;

function getZxingReader() {
  if (!zxingReaderInstance) {
    const hints = new Map();
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [
      BarcodeFormat.DATA_MATRIX,
      BarcodeFormat.QR_CODE,
      BarcodeFormat.AZTEC,
      BarcodeFormat.CODE_128
    ]);
    hints.set(DecodeHintType.TRY_HARDER, true);
    zxingReaderInstance = new BrowserMultiFormatReader(hints);
  }
  return zxingReaderInstance;
}

/**
 * Checks whether native BarcodeDetector API is available.
 */
export function isBarcodeDetectorSupported() {
  return typeof globalThis !== 'undefined' && 'BarcodeDetector' in globalThis;
}

/**
 * Decodes barcode from an image source (HTMLCanvasElement, HTMLImageElement, HTMLVideoElement, or Blob).
 */
export async function decodeImageData(imageSource) {
  if (!imageSource) return null;

  // 1. Try native BarcodeDetector if available
  if (isBarcodeDetectorSupported()) {
    try {
      const detector = new globalThis.BarcodeDetector({
        formats: ['data_matrix', 'qr_code', 'aztec', 'code_128', 'code_39']
      });
      const results = await detector.detect(imageSource);
      if (results && results.length > 0 && results[0].rawValue) {
        return results[0].rawValue;
      }
    } catch (err) {
      // Fall through to ZXing
      console.warn('[bmpScannerService] BarcodeDetector failed, falling back to ZXing:', err);
    }
  }

  // 2. Fallback to ZXing
  try {
    const reader = getZxingReader();
    if (imageSource instanceof HTMLImageElement || imageSource instanceof HTMLCanvasElement || imageSource instanceof HTMLVideoElement) {
      const result = await reader.decode(imageSource);
      if (result && result.getText()) {
        return result.getText();
      }
    }
  } catch (err) {
    // No code detected in this frame / image
  }

  return null;
}

/**
 * Reads a File/Blob as an image element and scans it for barcodes.
 */
export async function scanBarcodeFromFile(file) {
  if (!file) return null;

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const img = new Image();
      img.onload = async () => {
        try {
          // First attempt direct decode
          const result = await decodeImageData(img);
          if (result) {
            resolve(result);
            return;
          }

          // If direct decode failed, try rendering to canvas (can help with orientation/sizing)
          const canvas = document.createElement('canvas');
          const maxDim = 1600;
          let width = img.naturalWidth || img.width;
          let height = img.naturalHeight || img.height;

          if (width > maxDim || height > maxDim) {
            const ratio = Math.min(maxDim / width, maxDim / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const canvasResult = await decodeImageData(canvas);
            resolve(canvasResult || null);
            return;
          }
          resolve(null);
        } catch {
          resolve(null);
        }
      };
      img.onerror = () => resolve(null);
      img.src = e.target.result;
    };
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
}

/**
 * Starts continuous live camera scanning on the provided HTMLVideoElement.
 */
export function startCameraScanner({
  videoElement,
  onResult,
  onError,
  facingMode = 'environment'
}) {
  let isStopped = false;
  let stream = null;
  let animationFrameId = null;
  let scanIntervalId = null;

  const stop = () => {
    isStopped = true;
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
    if (scanIntervalId) {
      clearInterval(scanIntervalId);
      scanIntervalId = null;
    }
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      stream = null;
    }
    if (videoElement) {
      videoElement.srcObject = null;
    }
  };

  const initCamera = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API not available in this browser');
      }

      const constraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };

      stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (isStopped) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      videoElement.srcObject = stream;
      await videoElement.play();

      // Start scanning loop
      let isScanningFrame = false;
      const scanFrame = async () => {
        if (isStopped) return;

        if (!isScanningFrame && videoElement.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
          isScanningFrame = true;
          try {
            const text = await decodeImageData(videoElement);
            if (text && !isStopped) {
              onResult(text);
              return;
            }
          } catch {
            // Ignore scan errors between frames
          } finally {
            isScanningFrame = false;
          }
        }

        if (!isStopped) {
          scanIntervalId = setTimeout(scanFrame, 200);
        }
      };

      scanFrame();
    } catch (err) {
      if (!isStopped && onError) {
        onError(err);
      }
    }
  };

  initCamera();

  return {
    stop,
    toggleTorch: async (enable) => {
      if (!stream) return false;
      const track = stream.getVideoTracks()[0];
      if (track && typeof track.applyConstraints === 'function') {
        try {
          await track.applyConstraints({
            advanced: [{ torch: enable }]
          });
          return true;
        } catch {
          return false;
        }
      }
      return false;
    }
  };
}
