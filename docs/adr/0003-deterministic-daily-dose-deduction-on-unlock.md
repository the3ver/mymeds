# Deterministic Daily Dose Deduction on Vault Unlock

Browser PWAs cannot reliably execute background jobs while the device is sleeping or the browser is closed. Medication dose deductions are computed deterministically when the user unlocks a vault by comparing the current date to `lastDoseUpdate` and deducting past elapsed days in a single step. This eliminates the need for background sync workers while ensuring stock counts remain accurate.
