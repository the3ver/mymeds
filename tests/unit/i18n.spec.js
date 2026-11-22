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

      it('should contain medication delete confirmation, dose slots, colors and a11y translations', () => {
        const med = messages[locale]?.med;
        expect(med.deleteTitle).toBeTruthy();
        expect(med.deleteConfirm).toBeTruthy();
        expect(med.deleteConfirmNamed).toBeTruthy();
        expect(med.doseMorning).toBeTruthy();
        expect(med.doseNoon).toBeTruthy();
        expect(med.doseEvening).toBeTruthy();
        expect(med.doseNight).toBeTruthy();
        expect(med.colors.white).toBeTruthy();
        expect(med.colors['deep-orange']).toBeTruthy();

        const db = messages[locale]?.app?.db;
        expect(db.medsLabel).toContain('|');
        expect(db.entriesLabel).toContain('|');

        const a11y = messages[locale]?.a11y;
        expect(a11y.lockVault).toBeTruthy();
        expect(a11y.selectColor).toBeTruthy();
      });
    });
  });

  it('uses consistent informal German (Du) without formal Sie pronouns in messages.de', () => {
    const collectStrings = (obj, path = '') => {
      return Object.entries(obj).flatMap(([k, v]) => {
        const nextPath = path ? `${path}.${k}` : k;
        if (typeof v === 'string') return [{ path: nextPath, value: v }];
        if (v && typeof v === 'object') return collectStrings(v, nextPath);
        return [];
      });
    };

    const formalMatches = collectStrings(messages.de).filter(({ value }) =>
      /\b(Sie|Ihre[nrms]?|Ihr|Ihnen)\b/.test(value)
    );
    expect(formalMatches).toEqual([]);
  });
});
