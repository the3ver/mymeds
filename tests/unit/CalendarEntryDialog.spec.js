import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { createVuetify } from 'vuetify';
import { createI18n } from 'vue-i18n';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import { messages } from '../../src/i18n';
import CalendarEntryDialog from '../../src/modules/calendar/components/CalendarEntryDialog.vue';

const vuetify = createVuetify({ components, directives });
const i18n = createI18n({ legacy: false, locale: 'de', fallbackLocale: 'en', messages });

describe('CalendarEntryDialog.vue - Referral tracking', () => {
  const mountComponent = (entry = {}, extraProps = {}) => {
    return mount(CalendarEntryDialog, {
      props: {
        modelValue: true,
        entry: {
          type: 'doctor',
          date: '2026-10-15',
          title: 'Facharztbesuch',
          ...entry
        },
        ...extraProps
      },
      global: {
        plugins: [vuetify, i18n]
      }
    });
  };

  it('should default needsReferral to true and referralStatus to needed for a new doctor entry', () => {
    const wrapper = mountComponent();
    expect(wrapper.vm.localEntry.needsReferral).toBe(true);
    expect(wrapper.vm.localEntry.referralStatus).toBe('needed');
  });

  it('should preserve needsReferral: false when provided explicitly', () => {
    const wrapper = mountComponent({ needsReferral: false });
    expect(wrapper.vm.localEntry.needsReferral).toBe(false);
  });

  it('should default needsReferral to false when editing a legacy doctor entry without needsReferral attribute', () => {
    const legacyEntry = { type: 'doctor', title: 'Alter Arzttermin' };
    const wrapper = mountComponent(legacyEntry, { isEdit: true });
    expect(wrapper.vm.localEntry.needsReferral).toBe(false);
  });

  it('should not default needsReferral to true for non-doctor entry types', () => {
    const wrapper = mountComponent({ type: 'vaccination', title: 'Impfung' });
    expect(wrapper.vm.localEntry.needsReferral).toBeUndefined();
  });

  it('should default time to empty string for entries without time', () => {
    const wrapper = mountComponent();
    expect(wrapper.vm.localEntry.time).toBe('');
  });

  it('should render a time input and emit the entered time on save', async () => {
    const wrapper = mountComponent({ type: 'illness', title: 'Fieber' });
    await wrapper.vm.$nextTick();
    // v-dialog teleports its content to document.body
    // earlier tests leave dialogs mounted, so take the latest one
    const input = [...document.body.querySelectorAll('[data-testid="entry-time"] input')].at(-1);
    expect(input.getAttribute('type')).toBe('time');
    input.value = '09:30';
    input.dispatchEvent(new Event('input'));
    await wrapper.vm.$nextTick();
    wrapper.vm.save();
    expect(wrapper.emitted('confirm')[0][0].time).toBe('09:30');
  });
});
