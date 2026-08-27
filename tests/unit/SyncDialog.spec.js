import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createVuetify } from 'vuetify';
import { createI18n } from 'vue-i18n';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import { messages } from '../../src/i18n';
import SyncDialog from '../../src/modules/common/components/SyncDialog.vue';
import * as syncService from '../../src/modules/common/utils/syncService';
import * as dbAdapter from '../../src/modules/common/utils/indexedDbAdapter';

const vuetify = createVuetify({ components, directives });
const i18n = createI18n({ legacy: false, locale: 'de', fallbackLocale: 'en', messages });

describe('SyncDialog.vue', () => {
  beforeEach(async () => {
    await dbAdapter.deleteAllData();
    document.body.innerHTML = '';
    vi.spyOn(syncService, 'startSenderSession').mockImplementation(({ onCodeReady }) => {
      if (onCodeReady) onCodeReady('123456');
      return { close: vi.fn() };
    });
    vi.spyOn(syncService, 'startReceiverSession').mockImplementation(() => {
      return { close: vi.fn() };
    });
    vi.spyOn(syncService, 'generateQrCodeDataUrl').mockResolvedValue('data:image/png;base64,mockqr');
  });

  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  const mountComponent = (props = {}) => {
    return mount(SyncDialog, {
      props: {
        modelValue: true,
        databases: [
          { id: 1, name: 'Tresor 1', medsCount: 3, calendarCount: 1 }
        ],
        ...props,
      },
      global: {
        plugins: [vuetify, i18n],
      },
    });
  };

  it('renders Send and Receive tabs when opened', async () => {
    mountComponent();
    expect(document.body.textContent).toContain('Tresor senden');
    expect(document.body.textContent).toContain('Tresor empfangen');
  });

  it('emits update:modelValue when closed', async () => {
    const wrapper = mountComponent();
    const closeBtn = document.body.querySelector('.close-sync-btn');
    if (closeBtn) {
      await closeBtn.click();
      expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    }
  });

  it('renders 6-digit sync code in send tab when vault is selected', async () => {
    vi.spyOn(syncService, 'generateSyncCode').mockReturnValue('987654');
    vi.spyOn(syncService, 'generateQrCodeDataUrl').mockResolvedValue('data:image/png;base64,mockqr');
    vi.spyOn(syncService, 'startSenderSession').mockImplementation(({ onCodeReady }) => {
      onCodeReady('987654');
      return { close: vi.fn() };
    });

    mountComponent({ initialVaultId: 1 });

    // Allow async session initialization
    await new Promise(r => setTimeout(r, 50));

    expect(document.body.textContent).toContain('987 654');
  });

  it('allows entering sync code and imports received vault', async () => {
    const mockPayload = {
      type: 'mymeds-vault-sync',
      version: 1,
      vault: {
        name: 'Urlaub Tresor',
        medsCount: 4,
        calendarCount: 1,
        modifiedAt: new Date().toISOString(),
        encryptionStrategy: 'password',
        passwordData: {
          salt: 'AQID',
          iv: 'BAUG',
        },
        encryptedData: 'BwgJ',
      }
    };

    vi.spyOn(syncService, 'startReceiverSession').mockImplementation(({ syncCode, onConnected, onPayloadReceived }) => {
      setTimeout(() => {
        if (onConnected) onConnected();
        if (onPayloadReceived) onPayloadReceived(mockPayload);
      }, 20);
      return { close: vi.fn() };
    });

    const wrapper = mountComponent({ databases: [] });

    // Switch to receive tab
    wrapper.vm.activeTab = 'receive';
    wrapper.vm.receiveCode = '123456';
    await wrapper.vm.handleConnectAndReceive();

    // Wait for payload reception
    await new Promise(r => setTimeout(r, 60));

    expect(wrapper.vm.receivedVault).toBeDefined();
    expect(wrapper.vm.receivedVault.name).toBe('Urlaub Tresor');

    // Confirm save
    await wrapper.vm.handleSaveReceivedVault();

    expect(wrapper.emitted('vault-imported')).toBeTruthy();
  });
});
