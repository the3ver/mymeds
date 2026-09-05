import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createVuetify } from 'vuetify';
import { createI18n } from 'vue-i18n';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import { messages } from '../../src/i18n';
import DatabaseUnlockDialog from '../../src/modules/common/components/DatabaseUnlockDialog.vue';
import * as dataService from '../../src/modules/common/utils/dataService';
import * as biometricService from '../../src/modules/common/utils/biometricSessionService';

const vuetify = createVuetify({ components, directives });
const i18n = createI18n({ legacy: false, locale: 'de', fallbackLocale: 'en', messages });

describe('DatabaseUnlockDialog.vue', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const mountDialog = (props = {}) => {
    return mount(DatabaseUnlockDialog, {
      props: {
        modelValue: true,
        database: { id: 1, name: 'Mein Medikamenten-Tresor' },
        ...props,
      },
      global: {
        plugins: [vuetify, i18n],
      },
      attachTo: document.body,
    });
  };

  it('renders password input and biometric checkbox when biometrics is supported but not yet enrolled', async () => {
    vi.spyOn(biometricService, 'hasBiometricSession').mockResolvedValue(false);
    vi.spyOn(biometricService, 'isPrfSupported').mockResolvedValue(true);

    const wrapper = mountDialog();
    await wrapper.vm.$nextTick();
    await new Promise((r) => setTimeout(r, 20));

    const text = document.body.textContent;
    expect(text).toContain('Mein Medikamenten-Tresor');
    expect(text).toContain('Auf diesem Gerät mit Biometrie merken');
  });

  it('renders prominent biometric fingerprint prompt when biometric session exists', async () => {
    vi.spyOn(biometricService, 'hasBiometricSession').mockResolvedValue(true);
    vi.spyOn(biometricService, 'isPrfSupported').mockResolvedValue(true);

    const wrapper = mountDialog();
    await wrapper.vm.$nextTick();
    await new Promise((r) => setTimeout(r, 20));

    const text = document.body.textContent;
    expect(text).toContain('Biometrisches Entsperren');
    expect(text).toContain('Mit Biometrie entsperren');
    expect(text).toContain('Stattdessen Passwort eingeben');
  });

  it('switches to password mode when user clicks "Stattdessen Passwort eingeben"', async () => {
    vi.spyOn(biometricService, 'hasBiometricSession').mockResolvedValue(true);
    vi.spyOn(biometricService, 'isPrfSupported').mockResolvedValue(true);

    const wrapper = mountDialog();
    await wrapper.vm.$nextTick();
    await new Promise((r) => setTimeout(r, 20));

    const switchBtn = wrapper.findAllComponents(components.VBtn).find((b) =>
      b.text().includes('Stattdessen Passwort eingeben')
    );
    expect(switchBtn).toBeDefined();

    await switchBtn.trigger('click');
    await wrapper.vm.$nextTick();

    const passwordField = wrapper.findComponent(components.VTextField);
    expect(passwordField.exists()).toBe(true);
  });

  it('calls unlockWithBiometrics when biometric unlock button is clicked', async () => {
    vi.spyOn(biometricService, 'hasBiometricSession').mockResolvedValue(true);
    vi.spyOn(biometricService, 'isPrfSupported').mockResolvedValue(true);
    vi.spyOn(biometricService, 'unlockWithBiometrics').mockResolvedValue({
      success: true,
      data: { meds: [], calendar: [] },
      deductions: {},
      password: 'unwrapped-pw',
    });

    const wrapper = mountDialog();
    await wrapper.vm.$nextTick();
    await new Promise((r) => setTimeout(r, 20));

    const unlockBtn = wrapper.findAllComponents(components.VBtn).find((b) =>
      b.text().includes('Mit Biometrie entsperren')
    );
    expect(unlockBtn).toBeDefined();

    await unlockBtn.trigger('click');
    await wrapper.vm.$nextTick();

    expect(biometricService.unlockWithBiometrics).toHaveBeenCalledWith(1);
    expect(wrapper.emitted('unlocked')).toBeTruthy();
    expect(wrapper.emitted('unlocked')[0][1]).toBe('unwrapped-pw');
  });

  it('enrolls biometrics when unlocking with password and checkbox is checked', async () => {
    vi.spyOn(biometricService, 'hasBiometricSession').mockResolvedValue(false);
    vi.spyOn(biometricService, 'isPrfSupported').mockResolvedValue(true);
    vi.spyOn(dataService, 'unlockDatabase').mockResolvedValue({
      success: true,
      data: { meds: [] },
      deductions: {},
    });
    vi.spyOn(biometricService, 'enrollBiometrics').mockResolvedValue({});

    const wrapper = mountDialog();
    await wrapper.vm.$nextTick();
    await new Promise((r) => setTimeout(r, 20));

    const passwordField = wrapper.findComponent(components.VTextField);
    await passwordField.setValue('my-secret-pw');

    const checkbox = wrapper.findComponent(components.VCheckbox);
    await checkbox.setValue(true);

    const unlockBtn = wrapper.findAllComponents(components.VBtn).find((b) =>
      b.text() === 'Entsperren'
    );
    expect(unlockBtn).toBeDefined();

    await unlockBtn.trigger('click');
    await wrapper.vm.$nextTick();

    expect(dataService.unlockDatabase).toHaveBeenCalledWith(1, 'my-secret-pw');
    expect(biometricService.enrollBiometrics).toHaveBeenCalledWith(1, 'my-secret-pw');
    expect(wrapper.emitted('unlocked')).toBeTruthy();
  });
});
