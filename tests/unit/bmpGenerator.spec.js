import { describe, it, expect } from 'vitest';
import {
  generateBmpXml,
  generateBmpPayload,
  generateBmpBitMatrix,
  generateBmpSvg,
  renderBmpToCanvas
} from '../../src/modules/meds/utils/bmpGenerator';
import { parseBmpData } from '../../src/modules/meds/utils/bmpParser';

describe('bmpGenerator', () => {
  it('should generate valid BMP XML structure from medications and metadata', () => {
    const meds = [
      {
        name: 'Ramipril 5mg',
        ingredient: 'Ramipril',
        packageSize: '100',
        dose: '1-0-1',
        pzn: '01234567',
        instructions: 'Vor dem Essen',
        reason: 'Bluthochdruck'
      }
    ];

    const patient = {
      firstName: 'Max',
      lastName: 'Mustermann',
      birthDate: '1980-01-01'
    };

    const xml = generateBmpXml({ meds, patient });

    expect(xml).toContain('<MP v="026"');
    expect(xml).toContain('l="de-DE"');
    expect(xml).toContain('<P f="Mustermann" g="Max" b="19800101"/>');
    expect(xml).toContain('<A');
    expect(xml).toContain('n="MyMeds"');
    expect(xml).toContain('<S c="411" t="Dauermedikation">');
    expect(xml).toContain('<M a="Ramipril 5mg"');
    expect(xml).toContain('w="Ramipril"');
    expect(xml).toContain('m="1" d="0" v="1" h="0"');
    expect(xml).toContain('p="01234567"');
    expect(xml).toContain('i="Vor dem Essen"');
    expect(xml).toContain('r="Bluthochdruck"');
    expect(xml).toContain('</S>');
    expect(xml).toContain('</MP>');
  });

  it('should correctly format dosage variations including 4-slots, fractions and freetext', () => {
    const meds = [
      { name: 'Med 1', dose: '1-1/2-0-1' },
      { name: 'Med 2', dose: '1x wöchentlich freitags' },
      { name: 'Med 3', dose: '0.5' }
    ];

    const xml = generateBmpXml({ meds });

    // Med 1: 4-slot with fraction
    expect(xml).toContain('<M a="Med 1" m="1" d="1/2" v="0" h="1"/>');

    // Med 2: Freetext dose
    expect(xml).toContain('<M a="Med 2" t="1x wöchentlich freitags"/>');

    // Med 3: Single decimal dose
    expect(xml).toContain('<M a="Med 3" m="0.5" d="0" v="0" h="0"/>');
  });

  it('should properly escape XML special characters in all fields', () => {
    const meds = [
      {
        name: 'Med & Co. <Special> "Double"',
        ingredient: "Drug 'A' & 'B'",
        instructions: 'Take with <water> & food',
        reason: 'Condition "X"'
      }
    ];

    const xml = generateBmpXml({ meds });

    expect(xml).toContain('a="Med &amp; Co. &lt;Special&gt; &quot;Double&quot;"');
    expect(xml).toContain('w="Drug &apos;A&apos; &amp; &apos;B&apos;"');
    expect(xml).toContain('i="Take with &lt;water&gt; &amp; food"');
    expect(xml).toContain('r="Condition &quot;X&quot;"');
  });

  it('should generate compressed payload that can be parsed back by parseBmpData (roundtrip)', () => {
    const meds = [
      {
        name: 'Metoprolol 47,5 succ',
        ingredient: 'Metoprololsuccinat',
        dose: '1-0-1',
        pzn: '01234567',
        instructions: 'Morgens vor dem Essen',
        reason: 'Hypertonie'
      }
    ];

    const patient = {
      firstName: 'Sabine',
      lastName: 'Musterfrau',
      birthDate: '1965-12-24'
    };

    const xml = generateBmpXml({ meds, patient });

    // 1. Test uncompressed payload
    const uncompressedPayload = generateBmpPayload(xml, { compress: false });
    expect(typeof uncompressedPayload).toBe('string');
    const parsedUncompressed = parseBmpData(uncompressedPayload);
    expect(parsedUncompressed.success).toBe(true);
    expect(parsedUncompressed.meds[0].name).toBe('Metoprolol 47,5 succ');

    // 2. Test compressed payload
    const compressedPayload = generateBmpPayload(xml, { compress: true });
    const parsedCompressed = parseBmpData(compressedPayload);
    expect(parsedCompressed.success).toBe(true);
    expect(parsedCompressed.metadata.patient.firstName).toBe('Sabine');
    expect(parsedCompressed.metadata.patient.lastName).toBe('Musterfrau');
    expect(parsedCompressed.meds).toHaveLength(1);
    expect(parsedCompressed.meds[0].name).toBe('Metoprolol 47,5 succ');
    expect(parsedCompressed.meds[0].dose).toBe('1-0-1');
  });

  it('should generate BitMatrix, SVG string and render to Canvas', () => {
    const xml = generateBmpXml({
      meds: [{ name: 'Aspirin 100mg', dose: '1-0-0' }]
    });
    const payload = generateBmpPayload(xml, { compress: true });

    // 1. BitMatrix
    const bitMatrix = generateBmpBitMatrix(payload, { size: 200 });
    expect(bitMatrix).toBeDefined();
    expect(bitMatrix.getWidth()).toBeGreaterThan(10);
    expect(bitMatrix.getHeight()).toBeGreaterThan(10);

    // 2. SVG string
    const svg = generateBmpSvg(payload, { size: 300, margin: 2 });
    expect(typeof svg).toBe('string');
    expect(svg).toContain('<svg');
    expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"');
    expect(svg).toContain('viewBox=');
    expect(svg).toContain('fill="#000000"');
    expect(svg).toContain('</svg>');

    // 3. Canvas rendering
    const canvas = document.createElement('canvas');
    renderBmpToCanvas(canvas, payload, { size: 250, margin: 2 });
    expect(canvas.width).toBe(250);
    expect(canvas.height).toBe(250);
  });
});
