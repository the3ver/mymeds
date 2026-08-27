import { describe, it, expect, beforeEach } from 'vitest';
import * as dbAdapter from '../../src/modules/common/utils/indexedDbAdapter';

describe('indexedDbAdapter', () => {
  beforeEach(async () => {
    // Clear all data between tests for isolation
    await dbAdapter.deleteAllData();
  });

  describe('Database (Tresor) CRUD Operations', () => {
    it('should create and retrieve a database entry', async () => {
      const now = new Date();
      const newEntry = {
        name: 'Mein Haupttresor',
        createdAt: now,
        modifiedAt: now,
        encryptionStrategy: 'password',
        passwordData: { salt: new Uint8Array([1, 2, 3]), iv: new Uint8Array([4, 5, 6]) },
        encryptedData: new ArrayBuffer(8),
        medsCount: 5,
        calendarCount: 2,
      };

      const id = await dbAdapter.createDatabase(newEntry);
      expect(id).toBeDefined();

      const retrieved = await dbAdapter.getFullDatabase(id);
      expect(retrieved.id).toBe(id);
      expect(retrieved.name).toBe('Mein Haupttresor');
      expect(retrieved.medsCount).toBe(5);
      expect(retrieved.calendarCount).toBe(2);

      const list = await dbAdapter.getDatabaseList();
      expect(list.length).toBe(1);
      expect(list[0].id).toBe(id);
      expect(list[0].name).toBe('Mein Haupttresor');
      // getDatabaseList should not expose raw passwordData/encryptedData
      expect(list[0].encryptedData).toBeUndefined();
    });

    it('should update an existing database entry', async () => {
      const now = new Date();
      const id = await dbAdapter.createDatabase({
        name: 'Tresor A',
        createdAt: now,
        modifiedAt: now,
        medsCount: 1,
        calendarCount: 0,
      });

      const entry = await dbAdapter.getFullDatabase(id);
      entry.medsCount = 10;
      entry.calendarCount = 3;
      await dbAdapter.updateDatabase(entry);

      const updated = await dbAdapter.getFullDatabase(id);
      expect(updated.medsCount).toBe(10);
      expect(updated.calendarCount).toBe(3);
    });

    it('should rename a database entry and update modifiedAt', async () => {
      const initialDate = new Date('2026-01-01T10:00:00Z');
      const id = await dbAdapter.createDatabase({
        name: 'Alter Name',
        createdAt: initialDate,
        modifiedAt: initialDate,
      });

      await dbAdapter.renameDatabase(id, 'Neuer Name');

      const entry = await dbAdapter.getFullDatabase(id);
      expect(entry.name).toBe('Neuer Name');
      expect(new Date(entry.modifiedAt).getTime()).toBeGreaterThan(initialDate.getTime());
    });

    it('should delete a database entry', async () => {
      const id = await dbAdapter.createDatabase({ name: 'Zu löschen' });
      expect(await dbAdapter.getFullDatabase(id)).toBeDefined();

      await dbAdapter.deleteDatabase(id);
      expect(await dbAdapter.getFullDatabase(id)).toBeUndefined();

      const list = await dbAdapter.getDatabaseList();
      expect(list.length).toBe(0);
    });
  });

  describe('Settings Store', () => {
    it('should get default settings when nothing is saved', async () => {
      const settings = await dbAdapter.getSettings();
      expect(settings).toBeDefined();
      expect(['de', 'en']).toContain(settings.locale);
      expect(settings.theme).toBe('light');
      expect(settings.uiScale).toBe('normal');
      expect(settings.sortMode).toBe('added');
      expect(settings.displayMode).toBe('pills');
      expect(settings.yellowLimit).toBe(21);
      expect(settings.redLimit).toBe(7);
      expect(settings.showOverview).toBe(true);
      expect(settings.disclaimerVersion).toBe(0);
      expect(settings.disclaimerAccepted).toBe(false);
    });

    it('should save and retrieve disclaimerVersion setting', async () => {
      expect((await dbAdapter.getSettings()).disclaimerVersion).toBe(0);
      expect((await dbAdapter.getSettings()).disclaimerAccepted).toBe(false);

      await dbAdapter.saveDisclaimerVersion(1);
      
      const updated = await dbAdapter.getSettings();
      expect(updated.disclaimerVersion).toBe(1);
      expect(updated.disclaimerAccepted).toBe(true);
    });

    it('should save and retrieve individual settings', async () => {
      await dbAdapter.saveLocale('en');
      await dbAdapter.saveTheme('dark');
      await dbAdapter.saveUiScale('large');
      await dbAdapter.saveSortMode('name');
      await dbAdapter.saveDisplayMode('days');
      await dbAdapter.saveYellowLimit(30);
      await dbAdapter.saveRedLimit(10);
      await dbAdapter.saveShowOverview(false);

      const settings = await dbAdapter.getSettings();
      expect(settings.locale).toBe('en');
      expect(settings.theme).toBe('dark');
      expect(settings.uiScale).toBe('large');
      expect(settings.sortMode).toBe('name');
      expect(settings.displayMode).toBe('days');
      expect(settings.yellowLimit).toBe(30);
      expect(settings.redLimit).toBe(10);
      expect(settings.showOverview).toBe(false);
    });
  });

  describe('Session Recovery', () => {
    it('should save, retrieve and clear session recovery state', async () => {
      expect(await dbAdapter.getRecoveryState()).toBeNull();

      const recoveryData = { dbId: 42, timestamp: Date.now() };
      await dbAdapter.saveRecoveryState(recoveryData);

      expect(await dbAdapter.getRecoveryState()).toEqual(recoveryData);

      await dbAdapter.clearRecoveryState();
      expect(await dbAdapter.getRecoveryState()).toBeNull();
    });
  });

  describe('Bulk Delete', () => {
    it('should clear both databases and settings stores', async () => {
      await dbAdapter.createDatabase({ name: 'Tresor' });
      await dbAdapter.saveTheme('dark');

      await dbAdapter.deleteAllData();

      const dbs = await dbAdapter.getDatabaseList();
      expect(dbs.length).toBe(0);

      const theme = await dbAdapter.getSetting('theme', 'defaultTheme');
      expect(theme).toBe('defaultTheme');
    });
  });
});
