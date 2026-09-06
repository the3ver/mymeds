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

  it('renders vault cards with prominent counts and horizontal layout', async () => {
    vi.spyOn(dataService, 'getDatabaseList').mockResolvedValue(mockDatabases);
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

    // Verify stat pills exist
    const pills = wrapper.findAll('.db-stat-pill');
    expect(pills.length).toBe(4);

    // Verify biometric badge on vault 1
    expect(text).toContain('Biometrisches Entsperren');
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
