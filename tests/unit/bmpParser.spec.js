import { describe, it, expect } from 'vitest';
import { deflateSync } from 'fflate';
import { parseBmpData } from '../../src/modules/meds/utils/bmpParser';

describe('bmpParser', () => {
  it('should parse simple uncompressed BMP XML correctly', () => {
    const xml = `
      <MP v="025" U="12345678-1234-1234-1234-123456789012" l="de-DE">
        <P f="Mustermann" g="Max" b="19800101"/>
        <A n="Dr. med. Hausarzt" c="Berlin"/>
        <S c="411" t="Dauermedikation">
          <M a="Ramipril 5mg" w="Ramipril" s="5 mg" m="1" d="0" v="1" h="0" p="01234567" i="Vor dem Essen" r="Bluthochdruck"/>
        </S>
      </MP>
    `;

    const result = parseBmpData(xml);
    expect(result.success).toBe(true);
    expect(result.metadata.patient.firstName).toBe('Max');
    expect(result.metadata.patient.lastName).toBe('Mustermann');
    expect(result.metadata.patient.birthDate).toBe('1980-01-01');
    expect(result.metadata.doctor.name).toBe('Dr. med. Hausarzt');
    expect(result.metadata.doctor.city).toBe('Berlin');
    expect(result.meds).toHaveLength(1);
    expect(result.meds[0].name).toBe('Ramipril 5mg');
    expect(result.meds[0].ingredient).toBe('Ramipril');
    expect(result.meds[0].dose).toBe('1-0-1');
    expect(result.meds[0].pzn).toBe('01234567');
    expect(result.meds[0].instructions).toBe('Vor dem Essen');
    expect(result.meds[0].reason).toBe('Bluthochdruck');
    expect(result.meds[0].color).toBeTruthy();
  });

  it('should decompress and parse ZLIB-compressed BMP binary data', () => {
    const xml = `
      <MP v="025" U="98765432-1234-1234-1234-123456789012" l="de-DE">
        <P f="Schmidt" g="Anna" b="19551120"/>
        <A n="Praxis Dr. Weber" c="München"/>
        <S c="411" t="Dauermedikation">
          <M a="Bisoprolol 2.5mg" w="Bisoprololhemifumarat" s="2.5 mg" m="1" d="0" v="0" h="0" p="09876543" i="Morgens nüchtern" r="Blutdruck"/>
        </S>
      </MP>
    `;

    const encoder = new TextEncoder();
    const encodedBytes = encoder.encode(xml);
    const compressedBytes = deflateSync(encodedBytes);

    const result = parseBmpData(compressedBytes);
    expect(result.success).toBe(true);
    expect(result.metadata.patient.firstName).toBe('Anna');
    expect(result.metadata.patient.lastName).toBe('Schmidt');
    expect(result.meds).toHaveLength(1);
    expect(result.meds[0].name).toBe('Bisoprolol 2.5mg');
    expect(result.meds[0].dose).toBe('1-0-0');
  });

  it('should parse Base64-encoded compressed BMP string', () => {
    const xml = `
      <MP v="025" U="11112222-3333-4444-5555-666677778888" l="de-DE">
        <P f="Bauer" g="Hans" b="19600515"/>
        <S c="411" t="Dauermedikation">
          <M a="Torasemid 10mg" w="Torasemid" s="10 mg" m="1" d="0" v="0" h="0" p="04445555"/>
        </S>
      </MP>
    `;

    const encoder = new TextEncoder();
    const compressedBytes = deflateSync(encoder.encode(xml));
    let binaryStr = '';
    for (let i = 0; i < compressedBytes.length; i++) {
      binaryStr += String.fromCharCode(compressedBytes[i]);
    }
    const base64Str = btoa(binaryStr);

    const result = parseBmpData(base64Str);
    expect(result.success).toBe(true);
    expect(result.metadata.patient.firstName).toBe('Hans');
    expect(result.metadata.patient.lastName).toBe('Bauer');
    expect(result.meds[0].name).toBe('Torasemid 10mg');
  });

  it('should parse complex dosages, night doses, fractions, freetext and multiple ingredients', () => {
    const xml = `
      <MP v="025" U="aaaa-bbbb-cccc-dddd" l="de-DE">
        <S c="411" t="Dauermedikation">
          <!-- Multi-ingredient with 4-slot dosage including fraction -->
          <M a="Co-Diovan 160/25mg" s="160/25 mg" m="1" d="1/2" v="0" h="1" p="01122334">
            <W w="Valsartan" s="160 mg"/>
            <W w="Hydrochlorothiazid" s="25 mg"/>
          </M>
          <!-- Freetext dosage -->
          <M a="Methotrexat 15mg" w="Methotrexat" s="15 mg" t="1x wöchentlich freitags" p="05566778" i="Mit reichlich Wasser"/>
          <!-- Name derived from w and s when a is missing -->
          <M w="L-Thyroxin" s="75 µg" m="1" d="0" v="0" h="0" r="Schilddrüse"/>
        </S>
      </MP>
    `;

    const result = parseBmpData(xml);
    expect(result.success).toBe(true);
    expect(result.meds).toHaveLength(3);

    // Med 1: Multi-ingredient & 4-slot dose
    expect(result.meds[0].name).toBe('Co-Diovan 160/25mg');
    expect(result.meds[0].ingredient).toBe('Valsartan + Hydrochlorothiazid');
    expect(result.meds[0].dose).toBe('1-1/2-0-1');

    // Med 2: Freetext dosage
    expect(result.meds[1].name).toBe('Methotrexat 15mg');
    expect(result.meds[1].dose).toBe('1x wöchentlich freitags');
    expect(result.meds[1].instructions).toBe('Mit reichlich Wasser');

    // Med 3: Derived name from w + s
    expect(result.meds[2].name).toBe('L-Thyroxin 75 µg');
    expect(result.meds[2].dose).toBe('1-0-0');
    expect(result.meds[2].reason).toBe('Schilddrüse');
  });

  it('should gracefully handle empty or invalid data', () => {
    expect(parseBmpData('').success).toBe(false);
    expect(parseBmpData(null).success).toBe(false);
    expect(parseBmpData('<invalid>xml</invalid>').success).toBe(false);
    expect(parseBmpData('<MP><broken').success).toBe(false);
  });

  it('should parse JSON medication list as a flexible fallback', () => {
    const jsonStr = JSON.stringify({
      meds: [
        { name: 'Ibuprofen 400mg', dose: '1-0-1', count: 20, ingredient: 'Ibuprofen' }
      ]
    });

    const result = parseBmpData(jsonStr);
    expect(result.success).toBe(true);
    expect(result.meds).toHaveLength(1);
    expect(result.meds[0].name).toBe('Ibuprofen 400mg');
    expect(result.meds[0].dose).toBe('1-0-1');
  });
});
