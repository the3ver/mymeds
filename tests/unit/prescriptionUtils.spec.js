import { describe, it, expect } from 'vitest';
import {
  calculatePrescriptionNeeds,
  groupIntoPrescriptions,
  formatPrescriptionText
} from '../../src/modules/meds/utils/prescriptionUtils';

const today = new Date(2026, 0, 5, 9, 0); // Monday
const inDays = (days) => new Date(2026, 0, 5 + days);

describe('calculatePrescriptionNeeds', () => {
  it('rounds the missing units up to whole packages', () => {
    // 2 per day for 60 + 7 days = 134, stock 40 -> 94 missing -> 2 x 50
    const meds = [{ name: 'Prograf', dose: '1-0-1', count: 40, packageSize: 50 }];
    const [line] = calculatePrescriptionNeeds(meds, inDays(60), { today, bufferDays: 7 });
    expect(line).toMatchObject({ name: 'Prograf', packages: 2, packageSize: 50, missingUnits: 94 });
  });

  it('leaves out medications whose stock lasts until target date plus buffer', () => {
    const meds = [{ name: 'Enough', dose: '1', count: 37, packageSize: 100 }];
    expect(calculatePrescriptionNeeds(meds, inDays(30), { today, bufferDays: 7 })).toEqual([]);
    expect(calculatePrescriptionNeeds(meds, inDays(31), { today, bufferDays: 7 })).toHaveLength(1);
  });

  it('follows weekly and interval schedules', () => {
    const meds = [
      { name: 'Weekly', dose: '1', count: 0, packageSize: 10, schedule: { type: 'weekly', days: [1] } },
      { name: 'Interval', dose: '2', count: 0, packageSize: 10, schedule: { type: 'interval', intervalDays: 14 } }
    ];
    // 28 days, no buffer: 4 Mondays; 28 / 14 = 2 intakes x 2
    const lines = calculatePrescriptionNeeds(meds, inDays(28), { today, bufferDays: 0 });
    expect(lines.find((l) => l.name === 'Weekly').missingUnits).toBe(4);
    expect(lines.find((l) => l.name === 'Interval').missingUnits).toBe(4);
  });

  it('adds up half doses without float noise', () => {
    const meds = [{ name: 'Half', dose: '1/2', count: 0, packageSize: 5 }];
    // 10 x 0.5 = 5 -> exactly one package, not two
    expect(calculatePrescriptionNeeds(meds, inDays(10), { today, bufferDays: 0 })[0].packages).toBe(1);
  });

  it('reports units instead of packages when the package size is missing', () => {
    const meds = [{ name: 'NoSize', dose: '1', count: 0, packageSize: '' }];
    const [line] = calculatePrescriptionNeeds(meds, inDays(10), { today, bufferDays: 0 });
    expect(line).toMatchObject({ packages: null, packageSize: null, missingUnits: 10 });
  });

  it('skips medications without a regular dose', () => {
    const meds = [{ name: 'AsNeeded', dose: '0-0-0', count: 0, packageSize: 20 }];
    expect(calculatePrescriptionNeeds(meds, inDays(30), { today })).toEqual([]);
  });

  it('orders lines by urgency and keeps the index into the med list', () => {
    const meds = [
      { name: 'Later', dose: '1', count: 20, packageSize: 50 },
      { name: 'Empty', dose: '1', count: 0, packageSize: 50 },
      { name: 'Soon', dose: '1', count: 5, packageSize: 50 }
    ];
    const lines = calculatePrescriptionNeeds(meds, inDays(30), { today });
    expect(lines.map((l) => l.name)).toEqual(['Empty', 'Soon', 'Later']);
    expect(lines.map((l) => l.index)).toEqual([1, 2, 0]);
  });

  it('uses a buffer of 7 days by default', () => {
    const meds = [{ name: 'A', dose: '1', count: 0, packageSize: 1 }];
    expect(calculatePrescriptionNeeds(meds, inDays(10), { today })[0].missingUnits).toBe(17);
  });
});

describe('groupIntoPrescriptions', () => {
  it.each([
    [0, []],
    [3, [3]],
    [4, [3, 1]],
    [6, [3, 3]],
    [7, [3, 3, 1]]
  ])('splits %i lines into prescriptions of at most 3', (count, sizes) => {
    const lines = Array.from({ length: count }, (_, i) => ({ name: `M${i}` }));
    expect(groupIntoPrescriptions(lines).map((p) => p.length)).toEqual(sizes);
  });
});

describe('formatPrescriptionText', () => {
  const t = (key, p) =>
    ({
      'prescription.heading': `Rezept ${p?.number}`,
      'prescription.line': `${p?.packages} x ${p?.name} (${p?.size} St.)`,
      'prescription.lineNoPackage': `${p?.name}: ${p?.units} St.`
    })[key];

  it('lists each prescription with its lines', () => {
    const text = formatPrescriptionText(
      [
        [
          { name: 'Prograf', packages: 2, packageSize: 50 },
          { name: 'NoSize', packages: null, missingUnits: 12 }
        ],
        [{ name: 'Ramipril', packages: 1, packageSize: 100 }]
      ],
      t
    );
    expect(text).toBe('Rezept 1\n- 2 x Prograf (50 St.)\n- NoSize: 12 St.\n\nRezept 2\n- 1 x Ramipril (100 St.)');
  });
});
