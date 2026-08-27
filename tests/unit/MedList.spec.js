import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createVuetify } from 'vuetify';
import { createI18n } from 'vue-i18n';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import { messages } from '../../src/i18n';
import MedList from '../../src/modules/meds/components/MedList.vue';
import * as dataService from '../../src/modules/common/utils/dataService';

vi.mock('../../src/modules/common/utils/dataService', () => ({
  getSettings: vi.fn().mockResolvedValue({
    sortMode: 'added',
    yellowLimit: 21,
    redLimit: 7,
  }),
}));

const vuetify = createVuetify({ components, directives });
const i18n = createI18n({ legacy: false, locale: 'de', fallbackLocale: 'en', messages });

describe('MedList.vue', () => {
  const sampleMeds = [
    { name: 'Z-Medikament', count: 30, dose: '1', packageSize: 30 }, // 30 days
    { name: 'A-Medikament', count: 6, dose: '1', packageSize: 10 },  // 6 days (red limit)
    { name: 'M-Medikament', count: 14, dose: '1', packageSize: 20 }, // 14 days (yellow limit)
  ];

  const mountComponent = (props = {}) => {
    return mount(MedList, {
      props: {
        items: sampleMeds,
        deductions: {},
        ...props,
      },
      global: {
        plugins: [vuetify, i18n],
      },
    });
  };

  beforeEach(() => {
    dataService.getSettings.mockResolvedValue({
      sortMode: 'added',
      yellowLimit: 21,
      redLimit: 7,
    });
  });

  it('should show "no meds" placeholder when items array is empty', () => {
    const wrapper = mountComponent({ items: [] });
    expect(wrapper.text()).toContain('Noch keine Medikamente hinzugefügt');
  });

  it('should render all medication cards when items are provided', () => {
    const wrapper = mountComponent();
    expect(wrapper.text()).toContain('Z-Medikament');
    expect(wrapper.text()).toContain('A-Medikament');
    expect(wrapper.text()).toContain('M-Medikament');
  });

  it('should show critical overview banner when earliest med runs out in <= 7 days', () => {
    const wrapper = mountComponent();
    // A-Medikament has 6 days remaining (<= 7 red limit)
    expect(wrapper.text()).toContain('6 Tage');
  });

  it('should sort alphabetically when sortMode is "name"', async () => {
    dataService.getSettings.mockResolvedValue({
      sortMode: 'name',
      yellowLimit: 21,
      redLimit: 7,
    });

    const wrapper = mountComponent();
    await new Promise(resolve => setTimeout(resolve, 20));
    await wrapper.vm.$nextTick();

    const titles = wrapper.findAll('.v-card-title').map(el => el.text());
    expect(titles[0]).toContain('A-Medikament');
    expect(titles[1]).toContain('M-Medikament');
    expect(titles[2]).toContain('Z-Medikament');
  });

  it('should sort by remaining days ascending when sortMode is "days"', async () => {
    dataService.getSettings.mockResolvedValue({
      sortMode: 'days',
      yellowLimit: 21,
      redLimit: 7,
    });

    const wrapper = mountComponent();
    await new Promise(resolve => setTimeout(resolve, 20));
    await wrapper.vm.$nextTick();

    const titles = wrapper.findAll('.v-card-title').map(el => el.text());
    // Days order: A (6 days), M (14 days), Z (30 days)
    expect(titles[0]).toContain('A-Medikament');
    expect(titles[1]).toContain('M-Medikament');
    expect(titles[2]).toContain('Z-Medikament');
  });
});
