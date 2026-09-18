import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import MainPage from '../../src/MainPage.vue';
import { messages } from '../../src/i18n';
import { state as appState } from '../../src/app-state';

const vuetify = createVuetify({ components, directives });
const i18n = createI18n({
  legacy: false,
  locale: 'de',
  messages
});

describe('MainPage.vue', () => {
  beforeEach(() => {
    appState.decryptedData = {
      meds: [{ name: 'Test Med', dose: '1-0-0', count: 10 }],
      calendar: [],
      version: 1
    };
    appState.deductions = {};
  });

  it('renders BMP scan and BMP export buttons in meds tab', async () => {
    const wrapper = mount({
      template: `
        <v-layout>
          <MainPage />
        </v-layout>
      `,
      components: { MainPage }
    }, {
      global: {
        plugins: [vuetify, i18n],
        stubs: {
          CalendarPage: { template: '<div class="calendar-stub"></div>' }
        }
      }
    });
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain('Arztplan einscannen (BMP)');
    expect(wrapper.text()).toContain('Plan als BMP anzeigen (DataMatrix)');
  });
});
