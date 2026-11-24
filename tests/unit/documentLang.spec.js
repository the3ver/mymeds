import { describe, it, expect } from 'vitest';
import { nextTick } from 'vue';
import { createI18n } from 'vue-i18n';
import { syncDocumentLang } from '../../src/modules/common/utils/documentLang';

describe('syncDocumentLang', () => {
  it('sets <html lang> to the current locale and follows locale changes', async () => {
    const i18n = createI18n({ legacy: false, locale: 'de', messages: { de: {}, en: {} } });
    const root = document.createElement('html');
    root.lang = 'en';

    syncDocumentLang(i18n, root);
    expect(root.lang).toBe('de');

    i18n.global.locale.value = 'en';
    await nextTick();
    expect(root.lang).toBe('en');
  });
});
