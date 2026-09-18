import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createVuetify } from 'vuetify';
import { createI18n } from 'vue-i18n';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import { messages } from '../../src/i18n';
import DatabaseListPage from '../../src/modules/common/components/DatabaseListPage.vue';
import * as dataService from '../../src/modules/common/utils/dataService';
import * as biometricService from '../../src/modules/common/utils/biometricSessionService';

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
      modifiedAt: '2026-03-01T14:30:00.000Z',
    },
    {
      id: 2,
      name: 'Reise-Apotheke',
      medsCount: 1,
      calendarCount: 0,
      createdAt: '2026-02-10T12:00:00.000Z',
      modifiedAt: '2026-02-12T15:00:00.000Z',
    },
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
          ConfirmDialog: true,
        },
      },
    });

    await wrapper.vm.$nextTick();
    await new Promise((r) => setTimeout(r, 20));

    const text = wrapper.text();
    expect(text).toContain('Haupt-Tresor');
    expect(text).toContain('4 Medikamente');
    expect(text).toContain('2 Einträge');
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
          ConfirmDialog: true,
        },
      },
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
          ConfirmDialog: true,
        },
      },
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
          ConfirmDialog: true,
        },
      },
    });

    await wrapper.vm.$nextTick();
    await new Promise((r) => setTimeout(r, 20));

    expect(wrapper.text()).toContain('Keine Datenbanken gefunden');
  });
});
