import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createVuetify } from 'vuetify';
import { createI18n } from 'vue-i18n';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import { messages } from '../../src/i18n';
import PrescriptionDialog from '../../src/modules/meds/components/PrescriptionDialog.vue';
import * as dataService from '../../src/modules/common/utils/dataService';

vi.mock('../../src/modules/common/utils/dataService', () => ({
  getSettings: vi.fn(),
  savePrescriptionBufferDays: vi.fn().mockResolvedValue(undefined)
}));

const vuetify = createVuetify({ components, directives });
const i18n = createI18n({ legacy: false, locale: 'de', fallbackLocale: 'en', messages });

// Monday 2026-01-05; daily dose 1, so a med with count N lasts N days
const meds = [
  { name: 'Later', dose: '1', count: 30, packageSize: 50 },
  { name: 'Empty', dose: '1', count: 0, packageSize: 20 },
  { name: 'Soon', dose: '1', count: 5, packageSize: 20 },
  { name: 'NoSize', dose: '1', count: 0, packageSize: '' },
  { name: 'Plenty', dose: '1', count: 500, packageSize: 20 }
];
const calendarEntries = [
  { type: 'doctor', date: '2026-02-04', title: 'Hausarzt' }, // in 30 days
  { type: 'doctor', date: '2026-01-01', title: 'Vergangen' },
  { type: 'vaccination', date: '2026-01-10', title: 'Impfung' },
  { type: 'doctor', date: '2026-03-06', title: 'Klinik' }
];

const mountDialog = (props = {}) =>
  mount(PrescriptionDialog, {
    props: { modelValue: true, meds, calendarEntries, ...props },
    global: { plugins: [vuetify, i18n] },
    attachTo: document.body
  });

const cards = () => [...document.querySelectorAll('[data-testid="prescription-card"]')];
const lineNames = (card) =>
  [...card.querySelectorAll('[data-testid="prescription-line"] .v-list-item-title')].map((el) => el.textContent.trim());

describe('PrescriptionDialog.vue', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 0, 5, 9, 0));
    dataService.getSettings.mockResolvedValue({ prescriptionBufferDays: 7 });
    dataService.savePrescriptionBufferDays.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
    document.body.innerHTML = '';
  });

  it('preselects the next doctor appointment and lists only upcoming doctor appointments', async () => {
    mountDialog();
    await flushPromises();

    expect(document.querySelector('[data-testid="prescription-date"] input').value).toBe('2026-02-04');
    const chips = [...document.querySelectorAll('[data-testid="prescription-appointment"]')].map((c) => c.textContent);
    expect(chips).toHaveLength(2);
    expect(chips[0]).toContain('Hausarzt');
    expect(chips[1]).toContain('Klinik');
  });

  it('splits the needed meds into prescriptions of three, most urgent first', async () => {
    mountDialog();
    await flushPromises();

    // 30 + 7 days: Empty, NoSize, Soon, Later need more; Plenty lasts
    expect(cards()).toHaveLength(2);
    expect(lineNames(cards()[0])).toEqual(['Empty', 'NoSize', 'Soon']);
    expect(lineNames(cards()[1])).toEqual(['Later']);
    const packages = [...document.querySelectorAll('[data-testid="prescription-packages"]')].map((el) =>
      el.textContent.replace(/\s/g, '')
    );
    // Empty 37/20 -> 2, Soon 32/20 -> 2, Later 7/50 -> 1
    expect(packages).toEqual(['2×', '2×', '1×']);
    expect(cards()[0].textContent).toContain('37 St. fehlen');
  });

  it('moves a line to "not requested" at zero packages and regroups', async () => {
    mountDialog();
    await flushPromises();

    const fewer = document.querySelector('button[aria-label="Eine Packung weniger Empty"]');
    fewer.click();
    await flushPromises();
    fewer.click();
    await flushPromises();

    expect(cards()).toHaveLength(1);
    expect(lineNames(cards()[0])).toEqual(['NoSize', 'Soon', 'Later']);
    expect(document.querySelector('[data-testid="prescription-excluded"]').textContent).toContain('Empty');
  });

  it('says so when every medication lasts until the date', async () => {
    mountDialog({ meds: [meds[4]] });
    await flushPromises();

    expect(cards()).toHaveLength(0);
    expect(document.querySelector('[data-testid="prescription-none"]')).not.toBeNull();
  });

  it('uses the remembered buffer and saves a changed one', async () => {
    dataService.getSettings.mockResolvedValue({ prescriptionBufferDays: 0 });
    mountDialog();
    await flushPromises();

    // No buffer: within 30 days only Empty, NoSize, Soon run out
    expect(cards()).toHaveLength(1);
    expect(dataService.savePrescriptionBufferDays).not.toHaveBeenCalled();

    const buffer = document.querySelector('[data-testid="prescription-buffer"] input');
    buffer.value = '14';
    buffer.dispatchEvent(new Event('input'));
    await flushPromises();
    expect(dataService.savePrescriptionBufferDays).toHaveBeenCalledWith(14);
    expect(cards()).toHaveLength(2);
  });

  it('copies the prescriptions as text', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    mountDialog();
    await flushPromises();

    document.querySelector('[data-testid="prescription-copy"]').click();
    await flushPromises();

    expect(writeText).toHaveBeenCalledWith(
      'Rezept 1\n- 2 x Empty (20 St.)\n- NoSize: 37 St. (Packungsgröße nicht hinterlegt)\n- 2 x Soon (20 St.)\n\n' +
        'Rezept 2\n- 1 x Later (50 St.)'
    );
  });
});
