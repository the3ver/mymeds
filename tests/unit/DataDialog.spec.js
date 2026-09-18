import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import DataDialog from '../../src/modules/common/components/DataDialog.vue';
import { messages } from '../../src/i18n';
import { state as appState } from '../../src/app-state';

const vuetify = createVuetify({ components, directives });
const i18n = createI18n({
  legacy: false,
  locale: 'de',
  messages
});

describe('DataDialog.vue', () => {
  beforeEach(() => {
    appState.decryptedData = {
      meds: [{ name: 'Test Med', dose: '1-0-0' }],
      calendar: [],
      version: 1
    };
  });

  it('renders scan BMP and show BMP export buttons', async () => {
    const wrapper = mount(DataDialog, {
      props: {
        modelValue: true
      },
      global: {
        plugins: [vuetify, i18n]
      }
    });
    await wrapper.vm.$nextTick();

    expect(document.body.textContent).toContain('Arztplan einscannen (BMP)');
    expect(document.body.textContent).toContain('Plan als BMP anzeigen (DataMatrix)');
  });
});
