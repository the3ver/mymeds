import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import BmpScanDialog from '../../src/modules/meds/components/BmpScanDialog.vue';
import { messages } from '../../src/i18n';
import { state as appState } from '../../src/app-state';

const vuetify = createVuetify({ components, directives });
const i18n = createI18n({
  legacy: false,
  locale: 'de',
  messages
});

describe('BmpScanDialog.vue', () => {
  beforeEach(() => {
    appState.decryptedData.meds = [];
    appState.decryptedData.version = 1;
  });

  it('renders correctly when opened', async () => {
    const wrapper = mount(BmpScanDialog, {
      props: {
        modelValue: true
      },
      global: {
        plugins: [vuetify, i18n]
      }
    });
    await wrapper.vm.$nextTick();

    expect(document.body.textContent).toContain('Medikationsplan (BMP) einscannen');
  });

  it('parses pasted BMP XML code and displays preview', async () => {
    const wrapper = mount(BmpScanDialog, {
      props: {
        modelValue: true
      },
      global: {
        plugins: [vuetify, i18n]
      }
    });

    const xml = `
      <MP v="025" U="1234-5678" l="de-DE">
        <P f="Mustermann" g="Erika" b="19750510"/>
        <A n="Praxis Dr. Schmidt" c="Köln"/>
        <S c="411" t="Dauermedikation">
          <M a="Amlodipin 5mg" w="Amlodipin" s="5 mg" m="1" d="0" v="0" h="0" p="01234567" r="Blutdruck"/>
        </S>
      </MP>
    `;

    // Process code manually via helper method
    await wrapper.vm.processRawBmpData(xml);
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.step).toBe('preview');
    expect(document.body.textContent).toContain('Erika Mustermann');
    expect(document.body.textContent).toContain('Amlodipin 5mg');
    expect(wrapper.vm.detectedMeds).toHaveLength(1);
    expect(wrapper.vm.detectedMeds[0].selected).toBe(true);
  });

  it('imports selected medications into appState in append mode', async () => {
    appState.decryptedData.meds = [
      { name: 'Existing Med', dose: '1-0-0', count: 10, color: 'blue' }
    ];

    const wrapper = mount(BmpScanDialog, {
      props: {
        modelValue: true
      },
      global: {
        plugins: [vuetify, i18n]
      }
    });

    const xml = `
      <MP v="025" U="1234-5678" l="de-DE">
        <S c="411" t="Dauermedikation">
          <M a="Simvastatin 20mg" w="Simvastatin" s="20 mg" m="0" d="0" v="1" h="0" p="08889999"/>
        </S>
      </MP>
    `;

    await wrapper.vm.processRawBmpData(xml);
    wrapper.vm.detectedMeds[0].count = 50;
    wrapper.vm.importMode = 'append';

    await wrapper.vm.confirmImport();

    expect(appState.decryptedData.meds).toHaveLength(2);
    expect(appState.decryptedData.meds[0].name).toBe('Simvastatin 20mg');
    expect(appState.decryptedData.meds[0].count).toBe(50);
    expect(appState.decryptedData.meds[1].name).toBe('Existing Med');
  });

  it('replaces medications when replace mode is selected', async () => {
    appState.decryptedData.meds = [
      { name: 'Old Med 1', dose: '1-0-0', count: 10 },
      { name: 'Old Med 2', dose: '0-1-0', count: 20 }
    ];

    const wrapper = mount(BmpScanDialog, {
      props: {
        modelValue: true
      },
      global: {
        plugins: [vuetify, i18n]
      }
    });

    const xml = `
      <MP v="025" U="1234-5678" l="de-DE">
        <S c="411" t="Dauermedikation">
          <M a="Pantoprazol 40mg" w="Pantoprazol" s="40 mg" m="1" d="0" v="0" h="0" p="02223333"/>
        </S>
      </MP>
    `;

    await wrapper.vm.processRawBmpData(xml);
    wrapper.vm.importMode = 'replace';

    await wrapper.vm.confirmImport();

    expect(appState.decryptedData.meds).toHaveLength(1);
    expect(appState.decryptedData.meds[0].name).toBe('Pantoprazol 40mg');
  });
});
