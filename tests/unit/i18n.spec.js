import { describe, it, expect } from 'vitest';
import { messages } from '../../src/i18n';

describe('i18n disclaimer translations', () => {
  const locales = ['de', 'en'];

  locales.forEach((locale) => {
    describe(`locale: ${locale}`, () => {
      it('should contain complete welcome disclaimer translations including software errors notice', () => {
        const welcome = messages[locale]?.welcome;
        expect(welcome).toBeDefined();
        expect(welcome.title).toBeTruthy();
        expect(welcome.thankYou).toBeTruthy();
        expect(welcome.existingUserTitle).toBeTruthy();
        expect(welcome.existingUserIntro).toBeTruthy();

        const disclaimer = welcome.disclaimer;
        expect(disclaimer).toBeDefined();
        expect(disclaimer.title).toBeTruthy();
        expect(disclaimer.pointNoAdvice).toBeTruthy();
        expect(disclaimer.pointResponsibility).toBeTruthy();
        expect(disclaimer.pointSoftwareErrors).toBeTruthy();
        expect(disclaimer.pointConsult).toBeTruthy();
        expect(disclaimer.pointEmergency).toBeTruthy();
        expect(disclaimer.checkbox).toBeTruthy();
      });

      it('should contain complete sync translations', () => {
        const sync = messages[locale]?.sync;
        expect(sync).toBeDefined();
        expect(sync.title).toBeTruthy();
        expect(sync.tabSend).toBeTruthy();
        expect(sync.tabReceive).toBeTruthy();
        expect(sync.enterCode).toBeTruthy();
        expect(sync.connectAndReceive).toBeTruthy();
        expect(sync.modeOverwrite).toBeTruthy();
        expect(sync.modeCopy).toBeTruthy();
      });

      it('should contain complete storage persistence translations', () => {
        const storage = messages[locale]?.storage;
        expect(storage).toBeDefined();
        expect(storage.title).toBeTruthy();
        expect(storage.persisted).toBeTruthy();
        expect(storage.notPersisted).toBeTruthy();
        expect(storage.persistedDesc).toBeTruthy();
        expect(storage.notPersistedDesc).toBeTruthy();
        expect(storage.requestPersist).toBeTruthy();
        expect(storage.usage).toBeTruthy();
        expect(storage.persistSuccess).toBeTruthy();
        expect(storage.persistFailed).toBeTruthy();
      });

      it('should contain complete haptic feedback translations', () => {
        const app = messages[locale]?.app;
        expect(app).toBeDefined();
        expect(app.haptics).toBeTruthy();
        expect(app.hapticsDesc).toBeTruthy();
      });
    });
  });
});
