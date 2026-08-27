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
    });
  });
});
