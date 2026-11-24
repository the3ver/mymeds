import { watch } from 'vue';

/**
 * Mirrors the i18n locale into <html lang>, so the browser hyphenates
 * (CSS hyphens: auto) and screen readers pronounce text in the right language.
 */
export const syncDocumentLang = (i18n, root = document.documentElement) =>
  watch(
    i18n.global.locale,
    (locale) => {
      root.lang = locale;
    },
    { immediate: true }
  );
