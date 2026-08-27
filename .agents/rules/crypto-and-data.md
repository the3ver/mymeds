---
trigger: model_decision
description: Detailed guidelines for cryptographic operations, database schemas, and data persistence in MyMeds.
---

# Cryptography & Storage Rules

## Key Principles
1. **Zero-Knowledge Security:**
   - Keys are derived dynamically in memory using `crypto.subtle.deriveKey` with PBKDF2 (100.000 iterations, SHA-256) from user-entered passwords.
   - Keys and plaintext data are cleared from memory when locking the app.
   - Salt and IV must be generated fresh using `window.crypto.getRandomValues`.

2. **IndexedDB Schema (`MyMedsDB`):**
   - Store `databases`: Encrypted databases with `id`, `name`, `createdAt`, `modifiedAt`, `encryptionStrategy`, `passwordData: { salt, iv }`, `encryptedData`, `medsCount`, `calendarCount`.
   - Store `settings`: Unencrypted key-value pairs (`theme`, `locale`, `uiScale`, `sortMode`, `displayMode`, `yellowLimit`, `redLimit`, `showOverview`, `sessionRecovery`).

3. **Data Lifecycle & Updates:**
   - Plaintext data format: `{ version, meds: [...], calendar: [...], lastDoseUpdate: string }`.
   - Daily dose updates must always be evaluated through `checkAndUpdateDailyDose` in `medUtils.js` when unlocking.
   - All persistence mutations go through `dataService.js` and `indexedDbAdapter.js`.
