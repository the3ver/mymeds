import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createVuetify } from 'vuetify';
import { createI18n } from 'vue-i18n';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import { messages } from '../../src/i18n';
import DatabaseListPage from '../../src/modules/common/components/DatabaseListPage.vue';
import * as dataService from '../../src/modules/common/utils/dataService';
import * as biometricService from '../../src/modules/common/utils/biometricSessionService';
import { state as appState, lock } from '../../src/app-state';

// DatabaseListPage loads its dialogs via defineAsyncComponent. Name-based stubs do not reach
// an async wrapper, so the real dialogs (SyncDialog pulls in MQTT and QR code) would load and
// could finish after teardown. Module stubs also let a test emit 'created' from the dialog.
const { stubDialog } = vi.hoisted(() => ({
  stubDialog: (name) => ({ __esModule: true, default: { name, template: '<div></div>' } })
}));
vi.mock('../../src/modules/common/components/CreateDatabaseDialog.vue', () => stubDialog('CreateDatabaseDialog'));
vi.mock('../../src/modules/common/components/DatabaseUnlockDialog.vue', () => stubDialog('DatabaseUnlockDialog'));
vi.mock('../../src/modules/common/components/ConfirmDialog.vue', () => stubDialog('ConfirmDialog'));
vi.mock('../../src/modules/common/components/RenameDatabaseDialog.vue', () => stubDialog('RenameDatabaseDialog'));
vi.mock('../../src/modules/common/components/SyncDialog.vue', () => stubDialog('SyncDialog'));

const vuetify = createVuetify({ components, directives });
const i18n = createI18n({ legacy: false, locale: 'de', fallbackLocale: 'en', messages });

describe('DatabaseListPage.vue', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const mockDatabases = [
    {
      id: 1,
      name: 'Haupt-Tresor',
      medsCount: 4,
      calendarCount: 2,
      createdAt: '2026-01-15T10:00:00.000Z',
      modifiedAt: '2026-03-01T14:30:00.000Z'
    },
    {
      id: 2,
      name: 'Reise-Apotheke',
      medsCount: 1,
      calendarCount: 0,
      createdAt: '2026-02-10T12:00:00.000Z',
      modifiedAt: '2026-02-12T15:00:00.000Z'
    }
  ];

  it('renders vault cards in simple mode by default (calm, minimal layout with menu and summary)', async () => {
    vi.spyOn(dataService, 'getDatabaseList').mockResolvedValue(mockDatabases);
    vi.spyOn(dataService, 'getSettings').mockResolvedValue({ vaultDisplayMode: 'simple' });
    vi.spyOn(biometricService, 'getActiveBiometricVaultIds').mockResolvedValue(new Set([1]));

    const wrapper = mount(DatabaseListPage, {
      global: {
        plugins: [vuetify, i18n],
        stubs: {
          VFab: true,
          CreateDatabaseDialog: true,
          DatabaseUnlockDialog: true,
          RenameDatabaseDialog: true,
          SyncDialog: true,
          ConfirmDialog: true
        }
      }
    });

    await wrapper.vm.$nextTick();
    await new Promise((r) => setTimeout(r, 20));

    const text = wrapper.text();
    expect(text).toContain('Haupt-Tresor');
    // (?<!\d) keeps '1 Medikamente' from matching '11 Medikamente', '0 Einträge' from '10 Einträge'
    expect(text).toMatch(/(?<!\d)4 Medikamente/);
    expect(text).toMatch(/(?<!\d)2 Einträge/);
    expect(text).toMatch(/(?<!\d)1 Medikament(?!e)/);
    expect(text).not.toMatch(/(?<!\d)1 Medikamente/);
    expect(text).toMatch(/(?<!\d)0 Einträge/);
    expect(text).not.toContain('Erstellt:');
    expect(text).not.toContain('Geändert:');

    // Verify stat pills do NOT exist in simple mode
    const pills = wrapper.findAll('.db-stat-pill');
    expect(pills.length).toBe(0);

    // Verify 3-dots menu buttons exist (one per vault)
    const menuBtns = wrapper.findAll('button .mdi-dots-vertical, .v-btn--icon .mdi-dots-vertical');
    expect(menuBtns.length).toBeGreaterThanOrEqual(1);

    // Verify biometric icon exists for vault 1
    const bioIcon = wrapper.find('.mdi-fingerprint');
    expect(bioIcon.exists()).toBe(true);
  });

  it('renders vault cards in comfortable mode when configured', async () => {
    vi.spyOn(dataService, 'getDatabaseList').mockResolvedValue(mockDatabases);
    vi.spyOn(dataService, 'getSettings').mockResolvedValue({ vaultDisplayMode: 'comfortable' });
    vi.spyOn(biometricService, 'getActiveBiometricVaultIds').mockResolvedValue(new Set([1]));

    const wrapper = mount(DatabaseListPage, {
      global: {
        plugins: [vuetify, i18n],
        stubs: {
          VFab: true,
          CreateDatabaseDialog: true,
          DatabaseUnlockDialog: true,
          RenameDatabaseDialog: true,
          SyncDialog: true,
          ConfirmDialog: true
        }
      }
    });

    await wrapper.vm.$nextTick();
    await new Promise((r) => setTimeout(r, 20));

    const text = wrapper.text();
    expect(text).toContain('Haupt-Tresor');
    expect(text).toContain('4');
    expect(text).toContain('Medikamente');
    expect(text).toContain('2');
    expect(text).toContain('Einträge');
    expect(text).toContain('Erstellt:');
    expect(text).toContain('Geändert:');

    // Verify stat pills exist in comfortable mode
    const pills = wrapper.findAll('.db-stat-pill');
    expect(pills.length).toBe(4);
  });

  it('allows toggling display mode between simple and comfortable', async () => {
    vi.spyOn(dataService, 'getDatabaseList').mockResolvedValue(mockDatabases);
    vi.spyOn(dataService, 'getSettings').mockResolvedValue({ vaultDisplayMode: 'simple' });
    const saveSpy = vi.spyOn(dataService, 'saveVaultDisplayMode').mockResolvedValue();
    vi.spyOn(biometricService, 'getActiveBiometricVaultIds').mockResolvedValue(new Set());

    const wrapper = mount(DatabaseListPage, {
      global: {
        plugins: [vuetify, i18n],
        stubs: {
          VFab: true,
          CreateDatabaseDialog: true,
          DatabaseUnlockDialog: true,
          RenameDatabaseDialog: true,
          SyncDialog: true,
          ConfirmDialog: true
        }
      }
    });

    await wrapper.vm.$nextTick();
    await new Promise((r) => setTimeout(r, 20));

    const toggleBtn = wrapper.find('[data-testid="toggle-vault-display-btn"]');
    expect(toggleBtn.exists()).toBe(true);

    await toggleBtn.trigger('click');
    expect(saveSpy).toHaveBeenCalledWith('comfortable');
  });

  it('renders empty state when no vaults exist', async () => {
    vi.spyOn(dataService, 'getDatabaseList').mockResolvedValue([]);
    vi.spyOn(biometricService, 'getActiveBiometricVaultIds').mockResolvedValue(new Set());

    const wrapper = mount(DatabaseListPage, {
      global: {
        plugins: [vuetify, i18n],
        stubs: {
          VFab: true,
          CreateDatabaseDialog: true,
          DatabaseUnlockDialog: true,
          RenameDatabaseDialog: true,
          SyncDialog: true,
          ConfirmDialog: true
        }
      }
    });

    await wrapper.vm.$nextTick();
    await new Promise((r) => setTimeout(r, 20));

    expect(wrapper.text()).toContain('Keine Datenbanken gefunden');
  });

  it('pluralizes singular and plural counts correctly in German and English', async () => {
    const singleVault = [
      {
        id: 3,
        name: 'Einzel-Tresor',
        medsCount: 1,
        calendarCount: 1,
        createdAt: '2026-01-15T10:00:00.000Z',
        modifiedAt: '2026-03-01T14:30:00.000Z'
      }
    ];
    vi.spyOn(dataService, 'getDatabaseList').mockResolvedValue(singleVault);
    vi.spyOn(dataService, 'getSettings').mockResolvedValue({ vaultDisplayMode: 'simple' });
    vi.spyOn(biometricService, 'getActiveBiometricVaultIds').mockResolvedValue(new Set());

    const enI18n = createI18n({ legacy: false, locale: 'en', fallbackLocale: 'en', messages });
    const deWrapper = mount(DatabaseListPage, {
      global: {
        plugins: [vuetify, i18n],
        stubs: {
          VFab: true,
          CreateDatabaseDialog: true,
          DatabaseUnlockDialog: true,
          RenameDatabaseDialog: true,
          SyncDialog: true,
          ConfirmDialog: true
        }
      }
    });
    const enWrapper = mount(DatabaseListPage, {
      global: {
        plugins: [vuetify, enI18n],
        stubs: {
          VFab: true,
          CreateDatabaseDialog: true,
          DatabaseUnlockDialog: true,
          RenameDatabaseDialog: true,
          SyncDialog: true,
          ConfirmDialog: true
        }
      }
    });

    await new Promise((r) => setTimeout(r, 20));

    expect(deWrapper.text()).toContain('1 Medikament');
    expect(deWrapper.text()).not.toContain('1 Medikamente');
    expect(deWrapper.text()).toContain('1 Eintrag');
    expect(deWrapper.text()).not.toContain('1 Einträge');

    expect(enWrapper.text()).toContain('1 Medication');
    expect(enWrapper.text()).not.toContain('1 Medications');
    expect(enWrapper.text()).toContain('1 Entry');
    expect(enWrapper.text()).not.toContain('1 Entries');
  });

  it('gives the create-vault FAB button an accessible name', async () => {
    vi.spyOn(dataService, 'getDatabaseList').mockResolvedValue([]);
    vi.spyOn(dataService, 'getSettings').mockResolvedValue({ vaultDisplayMode: 'simple' });
    vi.spyOn(biometricService, 'getActiveBiometricVaultIds').mockResolvedValue(new Set());

    const wrapper = mount(
      { template: '<v-layout><DatabaseListPage /></v-layout>', components: { DatabaseListPage } },
      {
        global: {
          plugins: [vuetify, i18n],
          stubs: {
            CreateDatabaseDialog: true,
            DatabaseUnlockDialog: true,
            RenameDatabaseDialog: true,
            SyncDialog: true,
            ConfirmDialog: true
          }
        }
      }
    );
    await new Promise((r) => setTimeout(r, 20));

    // aria-label on <v-fab> lands on the wrapper div; the <button> itself needs the name
    const fabBtn = wrapper.find('.v-fab button');
    expect(fabBtn.exists()).toBe(true);
    const name = fabBtn.attributes('aria-label') || fabBtn.text().trim();
    expect(name).toBe(i18n.global.t('dialog.createDbTitle'));
  });

  describe('after creating a vault', () => {
    const mountList = async () => {
      vi.spyOn(dataService, 'getDatabaseList').mockResolvedValue([]);
      vi.spyOn(dataService, 'getSettings').mockResolvedValue({});
      vi.spyOn(dataService, 'saveAndLockDatabase').mockResolvedValue(true);
      vi.spyOn(biometricService, 'getActiveBiometricVaultIds').mockResolvedValue(new Set());
      const wrapper = mount(DatabaseListPage, {
        global: {
          plugins: [vuetify, i18n],
          stubs: { VFab: true, DatabaseUnlockDialog: true, RenameDatabaseDialog: true, SyncDialog: true }
        }
      });
      await flushPromises();
      return wrapper;
    };

    afterEach(async () => {
      await lock();
    });

    it('unlocks the new vault with the password just entered, without asking again', async () => {
      const unlockSpy = vi.spyOn(dataService, 'unlockDatabase').mockResolvedValue({
        success: true,
        data: { meds: [], calendar: [] },
        deductions: {}
      });
      const wrapper = await mountList();

      wrapper.findComponent({ name: 'CreateDatabaseDialog' }).vm.$emit('created', {
        id: 7,
        name: 'Neuer Tresor',
        password: 'geheim123'
      });
      await flushPromises();

      expect(unlockSpy).toHaveBeenCalledWith(7, 'geheim123');
      expect(appState.isLocked).toBe(false);
      expect(appState.activeDatabaseId).toBe(7);
      expect(appState.activeDatabaseName).toBe('Neuer Tresor');
    });

    it('stays on the vault list when the new vault cannot be unlocked', async () => {
      vi.spyOn(dataService, 'unlockDatabase').mockResolvedValue({ success: false });
      const wrapper = await mountList();

      wrapper.findComponent({ name: 'CreateDatabaseDialog' }).vm.$emit('created', {
        id: 7,
        name: 'Neuer Tresor',
        password: 'falsch'
      });
      await flushPromises();

      expect(appState.isLocked).toBe(true);
      expect(appState.activeDatabaseId).toBeNull();
    });
  });
});
