import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { createVuetify } from 'vuetify';
import { createI18n } from 'vue-i18n';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import { messages } from '../../src/i18n';
import MedCard from '../../src/modules/meds/components/MedCard.vue';

const vuetify = createVuetify({ components, directives });
const i18n = createI18n({ legacy: false, locale: 'de', fallbackLocale: 'en', messages });

describe('MedCard.vue', () => {
  const defaultItem = {
    name: 'Ibuprofen',
    ingredient: 'Ibuprofenum',
    count: 20,
    dose: '1-0-1',
    packageSize: 50,
    color: '#1976D2',
    notes: 'Nach dem Essen',
  };

  const mountComponent = (props = {}) => {
    return mount(MedCard, {
      props: {
        item: defaultItem,
        deduction: 0,
        ...props,
      },
      global: {
        plugins: [vuetify, i18n],
      },
    });
  };

  it('should render medication name and formatted schedule', () => {
    const wrapper = mountComponent();

    expect(wrapper.text()).toContain('Ibuprofen');
    expect(wrapper.text()).toContain('(Ibuprofenum)');
    expect(wrapper.text()).toContain('1-0-1');
  });

  it('should display count and pills unit in default pills display mode', () => {
    localStorage.setItem('myMedsDisplayMode', 'pills');
    const wrapper = mountComponent();

    expect(wrapper.text()).toContain('20');
  });

  it('should display remaining days when display mode is set to days', async () => {
    localStorage.setItem('myMedsDisplayMode', 'days');
    const wrapper = mountComponent({
      item: { ...defaultItem, count: 20, dose: '2' }, // 20 / 2 = 10 days
    });

    // Dispatch event to trigger setting update listener
    window.dispatchEvent(new Event('storage-display-mode-changed'));
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain('10');
  });

  it('should emit edit event when clicking edit button after expanding', async () => {
    const wrapper = mountComponent();

    // Click card to expand
    await wrapper.findComponent(components.VCard).trigger('click');

    const editBtn = wrapper.findAllComponents(components.VBtn).find(btn => btn.props('prependIcon') === 'mdi-pencil');
    expect(editBtn).toBeDefined();

    await editBtn.trigger('click');

    expect(wrapper.emitted('edit')).toBeDefined();
    expect(wrapper.emitted('edit').length).toBe(1);
  });

  it('should emit delete event when clicking delete button after expanding', async () => {
    const wrapper = mountComponent();

    // Click card to expand
    await wrapper.findComponent(components.VCard).trigger('click');

    const deleteBtn = wrapper.findAllComponents(components.VBtn).find(btn => btn.props('prependIcon') === 'mdi-delete');
    expect(deleteBtn).toBeDefined();

    await deleteBtn.trigger('click');

    expect(wrapper.emitted('delete')).toBeDefined();
    expect(wrapper.emitted('delete').length).toBe(1);
  });
});
