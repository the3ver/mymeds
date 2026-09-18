import { deflateSync } from 'fflate';
import { DataMatrixWriter, BarcodeFormat } from '@zxing/library';

let dataMatrixWriter = null;

function getDataMatrixWriter() {
  if (!dataMatrixWriter) {
    dataMatrixWriter = new DataMatrixWriter();
  }
  return dataMatrixWriter;
}

/**
 * Generates an ECC 200 DataMatrix BitMatrix (1:1 module matrix).
 */
export function generateBmpBitMatrix(payload, options = {}) {
  const writer = getDataMatrixWriter();
  // Using 0, 0 returns the pure 1:1 module matrix, avoiding floating-point rounding issues in ZXing
  return writer.encode(payload, BarcodeFormat.DATA_MATRIX, 0, 0);
}

/**
 * Generates a clean, scalable SVG string of the DataMatrix code.
 */
export function generateBmpSvg(payload, options = {}) {
  const margin = options.margin !== undefined ? options.margin : 2;
  const matrix = generateBmpBitMatrix(payload, options);
  const matrixWidth = matrix.getWidth();
  const matrixHeight = matrix.getHeight();

  const totalWidth = matrixWidth + margin * 2;
  const totalHeight = matrixHeight + margin * 2;

  let rects = '';
  for (let y = 0; y < matrixHeight; y++) {
    for (let x = 0; x < matrixWidth; x++) {
      if (matrix.get(x, y)) {
        rects += `<rect x="${x + margin}" y="${y + margin}" width="1" height="1" fill="#000000"/>`;
      }
    }
  }

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalWidth} ${totalHeight}" shape-rendering="crispEdges">` +
    `<rect width="${totalWidth}" height="${totalHeight}" fill="#ffffff"/>` +
    rects +
    `</svg>`
  );
}

/**
 * Renders the DataMatrix code directly onto an HTML Canvas element.
 */
export function renderBmpToCanvas(canvas, payload, options = {}) {
  if (!canvas) return;
  const size = options.size || 300;
  const margin = options.margin !== undefined ? options.margin : 2;
  const matrix = generateBmpBitMatrix(payload, options);
  const matrixWidth = matrix.getWidth();
  const matrixHeight = matrix.getHeight();

  const totalModulesX = matrixWidth + margin * 2;
  const totalModulesY = matrixHeight + margin * 2;

  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, size, size);

  const moduleSize = size / Math.max(totalModulesX, totalModulesY);
  const offsetX = (size - totalModulesX * moduleSize) / 2 + margin * moduleSize;
  const offsetY = (size - totalModulesY * moduleSize) / 2 + margin * moduleSize;

  ctx.fillStyle = '#000000';
  for (let y = 0; y < matrixHeight; y++) {
    for (let x = 0; x < matrixWidth; x++) {
      if (matrix.get(x, y)) {
        ctx.fillRect(
          Math.floor(offsetX + x * moduleSize),
          Math.floor(offsetY + y * moduleSize),
          Math.ceil(moduleSize),
          Math.ceil(moduleSize)
        );
      }
    }
  }
}

/**
 * Returns a PNG Data URL of the generated DataMatrix code.
 */
export function generateBmpDataUrl(payload, options = {}) {
  if (typeof document === 'undefined') return '';
  const canvas = document.createElement('canvas');
  renderBmpToCanvas(canvas, payload, options);
  return canvas.toDataURL ? canvas.toDataURL('image/png') : '';
}

/**
 * Converts a raw XML string to a BMP payload.
 * When compress is true, compresses with ZLIB/Deflate.
 */
export function generateBmpPayload(xml, options = { compress: true }) {
  if (!xml || typeof xml !== 'string') return '';
  if (!options?.compress) {
    return xml;
  }

  const encoder = new TextEncoder();
  const bytes = encoder.encode(xml);
  const compressedBytes = deflateSync(bytes);

  let binaryStr = '';
  for (let i = 0; i < compressedBytes.length; i++) {
    binaryStr += String.fromCharCode(compressedBytes[i]);
  }
  return binaryStr;
}

/**
 * Escapes XML attribute values.
 */
export function escapeXml(str) {
  if (str === undefined || str === null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Converts a date string (YYYY-MM-DD or YYYYMMDD) to BMP format YYYYMMDD.
 */
export function cleanDateToBmp(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return '';
  return dateStr.replace(/[^0-9]/g, '').slice(0, 8);
}

/**
 * Converts MyMeds dose string into BMP dosage attributes (m, d, v, h or t).
 */
export function parseDoseToBmpAttributes(doseStr) {
  if (!doseStr || typeof doseStr !== 'string') {
    return { m: '1', d: '0', v: '0', h: '0' };
  }

  const trimmed = doseStr.trim();

  // Pattern with hyphens: "1-0-1", "1-0-0-1", "1/2-0-1"
  if (trimmed.includes('-')) {
    const parts = trimmed.split('-').map((p) => p.trim());
    return {
      m: parts[0] || '0',
      d: parts[1] || '0',
      v: parts[2] || '0',
      h: parts[3] || '0'
    };
  }

  // Single number or fraction: "1", "2", "0.5", "1/2"
  if (/^(\d+(\.\d+)?|\d+\/\d+)$/.test(trimmed)) {
    return {
      m: trimmed,
      d: '0',
      v: '0',
      h: '0'
    };
  }

  // Freetext dose: "1x wöchentlich sonntags", "bei Bedarf"
  return {
    t: trimmed
  };
}

/**
 * Generates a standard UUID v4.
 */
export function generateUUID() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Generates official KBV Bundesmedikationsplan (BMP) XML (Ultrakurzformat / UKF).
 */
export function generateBmpXml({
  meds = [],
  patient = {},
  doctor = {},
  planId,
  date
} = {}) {
  const uuid = planId || generateUUID();
  const timestamp = date || new Date().toISOString();

  let xml = `<MP v="026" U="${escapeXml(uuid)}" l="de-DE">`;

  const pat = patient || {};
  const doc = doctor || {};

  // Patient tag (if any patient info is present)
  const pAttrs = [];
  if (pat.lastName) pAttrs.push(`f="${escapeXml(pat.lastName)}"`);
  if (pat.firstName) pAttrs.push(`g="${escapeXml(pat.firstName)}"`);
  if (pat.birthDate) pAttrs.push(`b="${escapeXml(cleanDateToBmp(pat.birthDate))}"`);
  if (pat.insuranceNumber) pAttrs.push(`egk="${escapeXml(pat.insuranceNumber)}"`);

  if (pAttrs.length > 0) {
    xml += `<P ${pAttrs.join(' ')}/>`;
  }

  // Author / App tag
  const aAttrs = [`t="${escapeXml(timestamp)}"`, `n="${escapeXml(doc.name || 'MyMeds')}"`];
  if (doc.street) aAttrs.push(`s="${escapeXml(doc.street)}"`);
  if (doc.zip) aAttrs.push(`z="${escapeXml(doc.zip)}"`);
  if (doc.city) aAttrs.push(`c="${escapeXml(doc.city)}"`);
  if (doc.phone) aAttrs.push(`p="${escapeXml(doc.phone)}"`);
  xml += `<A ${aAttrs.join(' ')}/>`;

  // Section tag (Dauermedikation)
  xml += `<S c="411" t="Dauermedikation">`;

  // Medication tags
  for (const med of meds) {
    if (!med || !med.name) continue;

    const mAttrs = [`a="${escapeXml(med.name)}"`];

    if (med.ingredient) {
      mAttrs.push(`w="${escapeXml(med.ingredient)}"`);
    }

    if (med.pzn) {
      mAttrs.push(`p="${escapeXml(med.pzn)}"`);
    }

    if (med.form) {
      mAttrs.push(`f="${escapeXml(med.form)}"`);
    }

    if (med.unit) {
      mAttrs.push(`du="${escapeXml(med.unit)}"`);
    }

    // Dosage attributes
    const doseAttrs = parseDoseToBmpAttributes(med.dose);
    if (doseAttrs.t) {
      mAttrs.push(`t="${escapeXml(doseAttrs.t)}"`);
    } else {
      mAttrs.push(`m="${escapeXml(doseAttrs.m)}"`);
      mAttrs.push(`d="${escapeXml(doseAttrs.d)}"`);
      mAttrs.push(`v="${escapeXml(doseAttrs.v)}"`);
      mAttrs.push(`h="${escapeXml(doseAttrs.h)}"`);
    }

    if (med.instructions) {
      mAttrs.push(`i="${escapeXml(med.instructions)}"`);
    }

    if (med.reason) {
      mAttrs.push(`r="${escapeXml(med.reason)}"`);
    }

    xml += `<M ${mAttrs.join(' ')}/>`;
  }

  xml += `</S>`;
  xml += `</MP>`;

  return xml;
}
