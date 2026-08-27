# MyMeds – Agent Context & Guidelines

Client-only Progressive Web App (PWA) zur verschlüsselten Erfassung von Medikamentenvorräten, Einnahmeplänen und Gesundheitsterminen.

## Tech Stack
- **Framework:** Vue 3 (Composition API `<script setup>`) + Vuetify 3 (Material Design Components & Directives) + MDI Icons (`@mdi/font`)
- **Storage:** IndexedDB via `idb` (Datenbank: `MyMedsDB`, Version 4)
- **Crypto:** Web Cryptography API (`crypto.subtle`) mit PBKDF2 (100.000 Iterationen, SHA-256) + AES-GCM (256-Bit)
- **i18n:** `vue-i18n` (Standard: Deutsch, Fallback: Englisch in `src/i18n.js`)
- **Build / Test:** Vite 7 + `vite-plugin-pwa`, Vitest 4 (Unit-Tests mit `fake-indexeddb` und `jsdom`)

## Commands
- Dev Server: `npm run dev`
- Tests ausführen: `cmd /c npm test -- --run` (oder `npx vitest run`)
- Build PWA: `npm run build`
- Preview: `npm run preview`

## Core Architecture & State Management
1. **Zero-Knowledge / Kein Server:** Alle Medikamenten- und Kalenderdaten existieren verschlüsselt in IndexedDB (`databases` Store).
2. **Settings (Unverschlüsselt):** Liegen im `settings` Store (Theme, Sprache, Sortierung, UI-Skalierung, Gelb-/Rot-Limits).
3. **App State (`src/app-state.js`):**
   - Hält `isLocked`, `activeDatabaseId`, `activeDatabasePassword` und `decryptedData`.
   - Reaktiv mit automatischem, gedebounctem Speichern (`watch` auf `state.decryptedData` -> `dataService.saveAndLockDatabase`).
4. **Täglicher Abzug (`medUtils.js`):**
   - Beim Entsperren berechnet `checkAndUpdateDailyDose` anhand von `lastDoseUpdate` den automatischen Abzug der Dosis für vergangene Tage.

## Directory Map
- `src/App.vue`: Root-Layout, App-Bar, Navigation Drawer, Tresor-Locking.
- `src/MainPage.vue`: Hauptansicht mit Tabs (`meds` & `calendar`) und Floating Action Buttons.
- `src/app-state.js`: Zentraler reaktiver Zustand und Auto-Save-Logik.
- `src/modules/meds/`:
  - `components/`: `MedList.vue`, `MedCard.vue`, `MedDialog.vue`, `DoseInput.vue`
  - `utils/medUtils.js`: Dosis-Parsing (`1-0-1`, `1/2`), Resttage-Berechnung, Abzugslogik.
- `src/modules/calendar/`:
  - `components/`: `CalendarPage.vue`, `CalendarEntryDialog.vue`, `FilterDialog.vue`, `EntryTypeDialog.vue`
  - `utils/calendarUtils.js` & `calendar.js`: ICS-Generierung und Web Share API.
- `src/modules/common/`:
  - `utils/cryptoService.js`: Key derivation, AES-GCM Encrypt/Decrypt.
  - `utils/indexedDbAdapter.js`: IndexedDB Operationen (`idb`).
  - `utils/dataService.js`: Business Logic für Tresore & Settings.
  - `utils/importExportService.js`: JSON-Backup & Wiederherstellung.
  - `components/`: Tresor-Liste (`DatabaseListPage.vue`), Settings, Import/Export Dialoge.
- `tests/unit/`: Vitest Unit-Tests (`dataService`, `medUtils`, `importExportService`, `stringUtils`, `App`).

## Hard Boundaries & Rules
- **Niemals unverschlüsselte Nutzerdaten speichern:** Medikamente, Dosen und Kalendereinträge dürfen ausschließlich verschlüsselt in IndexedDB landen.
- **Kein Backend annehmen:** Die App ist rein statisch und Offline-First. Keine externen API-Routen oder Server-Kommunikation einbauen.
- **i18n First:** Keine hartcodierten UI-Texte; neue Strings müssen in `src/i18n.js` (Deutsch & Englisch) eingetragen und via `t('...')` referenziert werden.
- **Auto-Save beachten:** Änderungen an `appState.decryptedData` triggern automatisch das Speichern. Kein manuelles Überschreiben des Speicherflusses ohne Rücksprache.
