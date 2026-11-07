// ESLint for .js and .vue. TypeScript files are checked by tsc (typescript-eslint
// does not support TypeScript 7 yet).
import js from '@eslint/js';
import pluginVue from 'eslint-plugin-vue';
import globals from 'globals';

export default [
  { ignores: ['dist/**', 'node_modules/**', 'android-build/**', 'dev-dist/**', '.agents/**', '**/*.ts'] },

  js.configs.recommended,
  ...pluginVue.configs['flat/essential'],

  {
    files: ['**/*.{js,mjs,vue}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { ...globals.browser, __APP_VERSION__: 'readonly' }
    },
    rules: {
      // A component used in a template without import renders nothing (110d5ff)
      'vue/no-undef-components': ['error', { ignorePatterns: ['^v-', '^router-'] }],
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', caughtErrors: 'none', ignoreRestSiblings: true }]
    }
  },

  {
    // App data lives encrypted in IndexedDB; localStorage caused 58346b0
    files: ['src/**/*.{js,vue}'],
    rules: {
      'no-restricted-globals': ['error', { name: 'localStorage', message: 'Use IndexedDB settings via dataService.' }]
    }
  },

  {
    files: ['src/sw.js'],
    languageOptions: { globals: { ...globals.serviceworker } }
  },

  {
    files: ['tests/**', 'scripts/**', '*.config.js'],
    languageOptions: { globals: { ...globals.node, ...globals.vitest } }
  }
];
