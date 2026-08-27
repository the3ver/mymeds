---
trigger: model_decision
description: Conventions for Vue 3 SFCs, Vuetify 3 components, styling, and internationalization in MyMeds.
---

# Vue & UI Guidelines

## Component Conventions
- Use Single File Components (SFCs) with `<script setup>`.
- Use `ref`, `computed`, `watch`, and `defineProps`/`defineEmits` from Vue 3.
- Always use `useI18n()` for strings (`const { t } = useI18n()`). Never hardcode German or English text in templates or scripts.

## Vuetify & Styling
- Use Vuetify 3 components (`<v-card>`, `<v-btn>`, `<v-dialog>`, `<v-window>`, etc.).
- Icons are from Material Design Icons prefixed with `mdi-` (e.g., `mdi-pill`, `mdi-calendar`, `mdi-plus`).
- Support both Light and Dark mode using Vuetify's theme system (`useTheme()`).
- Keep styles scoped `<style scoped>` unless modifying global layout or overscroll behavior.
- Use responsive spacing utilities (`class="d-flex align-center justify-center py-4"`).

## Testing
- Components and utilities should have corresponding unit tests in `tests/unit/*.spec.js` or `*.test.js`.
- Mount components using `@vue/test-utils` and provide Vuetify/i18n plugins in test setup.
