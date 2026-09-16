import { inflateSync, strFromU8 } from 'fflate';

const DEFAULT_COLORS = [
  'red', 'pink', 'purple', 'indigo', 'blue',
  'cyan', 'teal', 'green', 'orange', 'blue-grey'
];

/**
 * Normalizes birthdate string from YYYYMMDD to YYYY-MM-DD
 */
export function formatBirthDate(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return '';
  const clean = dateStr.trim();
  if (/^\d{8}$/.test(clean)) {
    return `${clean.slice(0, 4)}-${clean.slice(4, 6)}-${clean.slice(6, 8)}`;
  }
  return clean;
}

/**
 * Formats dosage fields from BMP into a MyMeds dose string.
 * Supports m (morgens), d (mittags), v (abends), h (zur Nacht) and t (Freitext).
 */
export function formatBmpDose(m, d, v, h, t) {
  const morning = (m || '').trim();
  const noon = (d || '').trim();
  const evening = (v || '').trim();
  const night = (h || '').trim();
  const freeText = (t || '').trim();

  const hasSlotValues = morning !== '' || noon !== '' || evening !== '' || night !== '';

  if (hasSlotValues) {
    const mVal = morning || '0';
    const dVal = noon || '0';
    const vVal = evening || '0';

    if (night && night !== '0') {
      return `${mVal}-${dVal}-${vVal}-${night}`;
    }
    return `${mVal}-${dVal}-${vVal}`;
  }

  if (freeText) {
    return freeText;
  }

  return '1-0-0';
}

/**
 * Extracts and decompresses raw BMP payload if needed.
 */
export function decompressBmpPayload(rawData) {
  if (!rawData) return '';

  if (typeof rawData === 'string') {
    const trimmed = rawData.trim();

    // Plain XML check
    if (trimmed.startsWith('<MP') || trimmed.startsWith('<?xml')) {
      return trimmed;
    }

    // Base64 check
    try {
      if (/^[A-Za-z0-9+/=]+$/.test(trimmed) && trimmed.length > 20) {
        const binaryStr = atob(trimmed);
        const bytes = new Uint8Array(binaryStr.length);
        for (let i = 0; i < binaryStr.length; i++) {
          bytes[i] = binaryStr.charCodeAt(i);
        }
        return decompressBytes(bytes);
      }
    } catch {
      // Not valid base64, proceed
    }

    // Binary string (each char is a byte)
    const bytes = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; i++) {
      bytes[i] = rawData.charCodeAt(i) & 0xff;
    }
    return decompressBytes(bytes);
  }

  if (rawData instanceof Uint8Array || rawData instanceof ArrayBuffer) {
    const bytes = rawData instanceof ArrayBuffer ? new Uint8Array(rawData) : rawData;
    return decompressBytes(bytes);
  }

  return String(rawData);
}

function decompressBytes(bytes) {
  // Check if uncompressed UTF-8 / XML
  try {
    const text = strFromU8(bytes);
    if (text.startsWith('<MP') || text.startsWith('<?xml') || text.includes('<MP')) {
      return text;
    }
  } catch {
    // Continue to decompression
  }

  // Decompress with fflate
  try {
    const decompressed = inflateSync(bytes);
    try {
      return strFromU8(decompressed);
    } catch {
      // Fallback for ISO-8859-15 / Latin1
      let str = '';
      for (let i = 0; i < decompressed.length; i++) {
        str += String.fromCharCode(decompressed[i]);
      }
      return str;
    }
  } catch (err) {
    // If inflate failed, try raw text conversion as fallback
    try {
      return strFromU8(bytes);
    } catch {
      return '';
    }
  }
}

/**
 * Parses a BMP payload (XML string, zlib compressed bytes or Base64) into structured MyMeds data.
 */
export function parseBmpData(rawData) {
  const xmlString = decompressBmpPayload(rawData);

  if (!xmlString || typeof xmlString !== 'string') {
    return {
      success: false,
      error: 'Empty or invalid BMP data',
      meds: [],
      metadata: {}
    };
  }

  // Check if string is JSON fallback
  const trimmed = xmlString.trim();
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      const parsedJson = JSON.parse(trimmed);
      const rawMeds = Array.isArray(parsedJson) ? parsedJson : (parsedJson.meds || []);
      if (Array.isArray(rawMeds) && rawMeds.length > 0) {
        const meds = rawMeds.map((item, idx) => ({
          name: item.name || 'Unbekannt',
          ingredient: item.ingredient || '',
          dose: item.dose || '1-0-0',
          count: parseFloat(item.count) || 0,
          packageSize: item.packageSize || '',
          color: item.color || DEFAULT_COLORS[idx % DEFAULT_COLORS.length],
          pzn: item.pzn || '',
          form: item.form || '',
          unit: item.unit || '',
          instructions: item.instructions || '',
          reason: item.reason || '',
          section: item.section || ''
        }));
        return {
          success: true,
          metadata: {
            version: 'JSON',
            patient: parsedJson.patient || {},
            doctor: parsedJson.doctor || {}
          },
          sections: [],
          meds
        };
      }
    } catch {
      // Fall through to XML parsing
    }
  }

  let doc;
  try {
    const parser = new DOMParser();
    doc = parser.parseFromString(xmlString, 'application/xml');
    const parserError = doc.querySelector('parsererror');
    if (parserError) {
      return {
        success: false,
        error: `XML Parser Error: ${parserError.textContent}`,
        meds: [],
        metadata: {}
      };
    }
  } catch (err) {
    return {
      success: false,
      error: err.message || 'Failed to parse XML',
      meds: [],
      metadata: {}
    };
  }

  const mpEl = doc.querySelector('MP');
  if (!mpEl) {
    return {
      success: false,
      error: 'Missing root <MP> element',
      meds: [],
      metadata: {}
    };
  }

  // Metadata
  const version = mpEl.getAttribute('v') || '';
  const planId = mpEl.getAttribute('U') || '';
  const language = mpEl.getAttribute('l') || 'de-DE';

  // Patient
  const pEl = mpEl.querySelector('P');
  const patient = {
    firstName: pEl?.getAttribute('g') || '',
    lastName: pEl?.getAttribute('f') || '',
    birthDate: formatBirthDate(pEl?.getAttribute('b') || ''),
    insuranceNumber: pEl?.getAttribute('egk') || ''
  };

  // Doctor / Author
  const aEl = mpEl.querySelector('A');
  const doctor = {
    name: aEl?.getAttribute('n') || '',
    street: aEl?.getAttribute('s') || '',
    zip: aEl?.getAttribute('z') || '',
    city: aEl?.getAttribute('c') || '',
    phone: aEl?.getAttribute('p') || '',
    email: aEl?.getAttribute('e') || '',
    timestamp: aEl?.getAttribute('t') || ''
  };

  // Sections and Meds
  const meds = [];
  const sections = [];
  const sectionEls = mpEl.querySelectorAll('S');

  let colorIndex = 0;

  const processMedicationElement = (mEl, sectionTitle = '') => {
    const name = mEl.getAttribute('a') ||
      ([mEl.getAttribute('w'), mEl.getAttribute('s')].filter(Boolean).join(' ')) ||
      'Unbekannt';

    // Collect ingredients: attribute 'w' and any child <W> tags
    const ingredients = [];
    if (mEl.getAttribute('w')) {
      ingredients.push(mEl.getAttribute('w'));
    }
    const subIngredientEls = mEl.querySelectorAll('W');
    subIngredientEls.forEach((wEl) => {
      const subW = wEl.getAttribute('w');
      if (subW && !ingredients.includes(subW)) {
        ingredients.push(subW);
      }
    });
    const ingredient = ingredients.join(' + ');

    const dose = formatBmpDose(
      mEl.getAttribute('m'),
      mEl.getAttribute('d'),
      mEl.getAttribute('v'),
      mEl.getAttribute('h'),
      mEl.getAttribute('t')
    );

    const color = DEFAULT_COLORS[colorIndex % DEFAULT_COLORS.length];
    colorIndex++;

    return {
      name,
      ingredient,
      dose,
      count: 0,
      packageSize: '',
      color,
      pzn: mEl.getAttribute('p') || '',
      form: mEl.getAttribute('fd') || mEl.getAttribute('f') || '',
      unit: mEl.getAttribute('dud') || mEl.getAttribute('du') || '',
      instructions: mEl.getAttribute('i') || '',
      reason: mEl.getAttribute('r') || '',
      section: sectionTitle
    };
  };

  if (sectionEls.length > 0) {
    sectionEls.forEach((sEl) => {
      const sectionCode = sEl.getAttribute('c') || '';
      const sectionTitle = sEl.getAttribute('t') || '';
      const sectionMeds = [];

      const medEls = sEl.querySelectorAll('M');
      medEls.forEach((mEl) => {
        const parsedMed = processMedicationElement(mEl, sectionTitle);
        sectionMeds.push(parsedMed);
        meds.push(parsedMed);
      });

      sections.push({
        code: sectionCode,
        title: sectionTitle,
        meds: sectionMeds
      });
    });
  } else {
    // Top-level meds without sections
    const medEls = mpEl.querySelectorAll('M');
    medEls.forEach((mEl) => {
      const parsedMed = processMedicationElement(mEl);
      meds.push(parsedMed);
    });
  }

  return {
    success: true,
    metadata: {
      version,
      planId,
      language,
      patient,
      doctor
    },
    sections,
    meds
  };
}
