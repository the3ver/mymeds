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
  const mountComponent = (entry = {}) => {
    return mount(CalendarEntryDialog, {
      props: {
        modelValue: true,
        entry: {
          type: 'doctor',
          date: '2026-10-15',
          title: 'Facharztbesuch',
          ...entry
        }
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

  it('should not default needsReferral to true for non-doctor entry types', () => {
    const wrapper = mountComponent({ type: 'vaccination', title: 'Impfung' });
    expect(wrapper.vm.localEntry.needsReferral).toBeUndefined();
  });
});
