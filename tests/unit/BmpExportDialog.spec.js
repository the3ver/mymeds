import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import BmpExportDialog from '../../src/modules/meds/components/BmpExportDialog.vue';
import { messages } from '../../src/i18n';
import { state as appState } from '../../src/app-state';

const vuetify = createVuetify({ components, directives });
const i18n = createI18n({
  legacy: false,
  locale: 'de',
  messages
});

describe('BmpExportDialog.vue', () => {
  beforeEach(() => {
    appState.decryptedData.meds = [
      { name: 'Aspirin 100mg', dose: '1-0-0', count: 50, notes: 'morgens', pzn: '01234567' }
    ];
  });

  it('renders correctly with title and datamatrix preview when open', async () => {
    const wrapper = mount(BmpExportDialog, {
      props: {
        modelValue: true,
        meds: appState.decryptedData.meds
      },
      global: {
        plugins: [vuetify, i18n]
      }
    });
    await wrapper.vm.$nextTick();

    expect(document.body.textContent).toContain('Bundesmedikationsplan (BMP)');
    expect(document.body.querySelector('.bmp-matrix-preview')).not.toBeNull();
    expect(document.body.querySelector('.bmp-matrix-preview svg')).not.toBeNull();
  });

  it('switches format between compressed and uncompressed XML', async () => {
    const wrapper = mount(BmpExportDialog, {
      props: {
        modelValue: true,
        meds: appState.decryptedData.meds
      },
      global: {
        plugins: [vuetify, i18n]
      }
    });
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.format).toBe('standard');
    expect(wrapper.vm.bmpPayload.startsWith('<MP')).toBe(false);

    wrapper.vm.format = 'xml';
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.bmpPayload.startsWith('<MP')).toBe(true);
  });

  it('updates XML and preview when medications are selected or deselected', async () => {
    const wrapper = mount(BmpExportDialog, {
      props: {
        modelValue: true,
        meds: [
          { name: 'Med 1', dose: '1-0-0' },
          { name: 'Med 2', dose: '0-1-0' }
        ]
      },
      global: {
        plugins: [vuetify, i18n]
      }
    });
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.activeMeds).toHaveLength(2);
    expect(wrapper.vm.bmpXml).toContain('Med 1');
    expect(wrapper.vm.bmpXml).toContain('Med 2');

    // Deselect all
    wrapper.vm.deselectAll();
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.activeMeds).toHaveLength(0);
    expect(wrapper.vm.bmpXml).toBe('');
    expect(document.body.textContent).toContain('Keine Medikamente zur Anzeige ausgewählt');

    // Select all
    wrapper.vm.selectAll();
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.activeMeds).toHaveLength(2);
    expect(wrapper.vm.bmpXml).toContain('Med 1');
  });

  it('includes patient information in XML when entered', async () => {
    const wrapper = mount(BmpExportDialog, {
      props: {
        modelValue: true,
        meds: [{ name: 'Ibuprofen 400', dose: '1-0-1' }]
      },
      global: {
        plugins: [vuetify, i18n]
      }
    });
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.bmpXml).not.toContain('<P ');

    wrapper.vm.patient.firstName = 'Max';
    wrapper.vm.patient.lastName = 'Mustermann';
    wrapper.vm.patient.birthDate = '1980-01-15';
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.bmpXml).toContain('g="Max"');
    expect(wrapper.vm.bmpXml).toContain('f="Mustermann"');
    expect(wrapper.vm.bmpXml).toContain('b="19800115"');
  });

  it('copies XML to clipboard and sets snackbar', async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock
      }
    });

    const wrapper = mount(BmpExportDialog, {
      props: {
        modelValue: true,
        meds: [{ name: 'Ibuprofen 400', dose: '1-0-1' }]
      },
      global: {
        plugins: [vuetify, i18n]
      }
    });
    await wrapper.vm.$nextTick();

    await wrapper.vm.copyXml();

    expect(writeTextMock).toHaveBeenCalledWith(wrapper.vm.bmpXml);
    expect(wrapper.vm.snackbar).toBe(true);
  });

  it('triggers PNG download on downloadPng call', async () => {
    const clickSpy = vi.fn();
    const origCreateElement = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tag) => {
      const el = origCreateElement(tag);
      if (tag === 'a') {
        el.click = clickSpy;
      }
      return el;
    });

    const wrapper = mount(BmpExportDialog, {
      props: {
        modelValue: true,
        meds: [{ name: 'Ibuprofen 400', dose: '1-0-1' }]
      },
      global: {
        plugins: [vuetify, i18n]
      }
    });
    await wrapper.vm.$nextTick();

    await wrapper.vm.downloadPng();

    expect(clickSpy).toHaveBeenCalled();
    vi.restoreAllMocks();
  });
});
