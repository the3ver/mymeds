import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import CreateDatabaseDialog from '../../src/modules/common/components/CreateDatabaseDialog.vue';
import { messages } from '../../src/i18n';

const vuetify = createVuetify({ components, directives });
const i18n = createI18n({ legacy: false, locale: 'de', messages });

describe('CreateDatabaseDialog.vue', () => {
  const mountComponent = () =>
    mount(CreateDatabaseDialog, {
      props: { modelValue: true },
      global: { plugins: [vuetify, i18n] }
    });
  const isPersistent = (wrapper) => wrapper.findComponent({ name: 'VDialog' }).props('persistent');

  it('is dismissable while the form is empty', async () => {
    const wrapper = mountComponent();
    await wrapper.vm.$nextTick();
    expect(isPersistent(wrapper)).toBe(false);
  });

  it('stays open once the user has typed something', async () => {
    const wrapper = mountComponent();
    wrapper.vm.password = 'geheim';
    await wrapper.vm.$nextTick();
    expect(isPersistent(wrapper)).toBe(true);
  });
});
