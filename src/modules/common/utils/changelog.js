/**
 * Structured changelog data for MyMeds.
 * Offline-first, multilingual release notes.
 */

export const changelog = [
  {
    version: '1.6.0',
    date: '2026-09-06',
    title: {
      de: 'Tägliche Einnahme-Erinnerungen für Android (TWA)',
      en: 'Daily Intake Reminders for Android (TWA)'
    },
    highlights: {
      de: [
        'Tägliche Einnahme-Erinnerungen über Periodic Background Sync im Service Worker',
        'Vorgaben für Morgens, Mittags, Abends und Zur Nacht sowie beliebig viele benutzerdefinierte Zeiten im 30-Minuten-Raster',
        'Volle Zero-Knowledge-Sicherheit: Neutrale Benachrichtigungen ohne Klartextdaten bei gesperrtem Tresor',
        'Bedingte Anzeige: Die Funktion wird nur angezeigt, wenn sie vom System (Android TWA / WebAPK) unterstützt wird'
      ],
      en: [
        'Daily intake reminders via Periodic Background Sync in the Service Worker',
        'Presets for morning, noon, evening, night, plus custom times in 30-minute intervals',
        'Full zero-knowledge privacy: generic notifications without plaintext data while vault is locked',
        'Conditional visibility: feature is only shown when supported by the system (Android TWA / WebAPK)'
      ]
    }
  },
  {
    version: '1.5.3',
    date: '2026-09-05',
    title: {
      de: 'Neues Icon für die Tresor-Synchronisation',
      en: 'New Icon for Vault Synchronization'
    },
    highlights: {
      de: [
        'Klareres Hoch-Runter-Pfeil-Icon (mdi-swap-vertical) auf den Tresorkarten für den Datentransfer'
      ],
      en: [
        'Clearer up-down transfer arrow icon (mdi-swap-vertical) on vault cards for synchronization'
      ]
    }
  },
  {
    version: '1.5.2',
    date: '2026-09-05',
    title: {
      de: 'Tresorname für biometrische Schlüssel (Windows Hello & Touch ID)',
      en: 'Vault Name for Biometric Credentials (Windows Hello & Touch ID)'
    },
    highlights: {
      de: [
        'Biometrische Schlüssel werden nun mit dem vergebenen Namen des Tresors benannt statt mit einer generischen ID',
        'Bessere Übersicht bei mehreren Tresoren in den Windows- und Browser-Passkey-Einstellungen'
      ],
      en: [
        'Biometric credentials are now labeled with the user-defined vault name instead of a generic ID',
        'Improved clarity when managing multiple vaults in Windows and browser passkey settings'
      ]
    }
  },
  {
    version: '1.5.1',
    date: '2026-09-05',
    title: {
      de: 'Kompatibilitäts-Fix für WebAuthn PRF & CI/CD Update',
      en: 'Compatibility Fix for WebAuthn PRF & CI/CD Update'
    },
    highlights: {
      de: [
        'Verbesserte Puffer-Kompatibilität bei der biometrischen Schlüsselableitung',
        'Behebung von Cross-Realm-ArrayBuffer-Problemen unter verschiedenen Runtimes',
        'Aktualisierung der CI/CD-Pipelines auf Node.js 22 LTS'
      ],
      en: [
        'Improved buffer compatibility during biometric key derivation',
        'Resolved cross-realm ArrayBuffer issues across different runtimes',
        'Updated CI/CD pipelines to Node.js 22 LTS'
      ]
    }
  },
  {
    version: '1.5.0',
    date: '2026-09-05',
    title: {
      de: 'Biometrisches Entsperren mit Fingerabdruck & Face ID',
      en: 'Biometric Unlock with Fingerprint & Face ID'
    },
    highlights: {
      de: [
        'Hardware-geschützte Entsperrung via WebAuthn PRF (Windows Hello, Touch ID, Face ID)',
        'Optionale Merk-Funktion pro Gerät beim regulären Entsperren mit Passwort',
        'Biometrie-Statusanzeige und gezieltes Deaktivieren direkt auf der Tresor-Karte',
        'Einstellung zum schnellen Aufheben aller biometrischen Gerätekopplungen'
      ],
      en: [
        'Hardware-backed unlocking via WebAuthn PRF (Windows Hello, Touch ID, Face ID)',
        'Optional "Remember on this device" toggle during standard password unlock',
        'Biometric badge and quick revocation directly on vault cards',
        'Settings option to clear all biometric device pairings at once'
      ]
    }
  },
  {
    version: '1.4.2',
    date: '2026-09-05',
    title: {
      de: 'Manuelle Update-Prüfung & Was-gibt’s-Neues-Dialog',
      en: 'Manual Update Check & What’s New Dialog'
    },
    highlights: {
      de: [
        'Expliziter Button zur manuellen Update-Prüfung in der installierten PWA',
        'Neuer „Was gibt’s Neues“-Changelog-Dialog bei Updates und auf Abruf',
        'Hintergrund-Benachrichtigungen bei neu bereitgestellten Versionen'
      ],
      en: [
        'Explicit manual update check button in the installed PWA',
        'New "What\'s New" changelog dialog on update and on demand',
        'Background notifications when a new version is ready to reload'
      ]
    }
  },
  {
    version: '1.4.1',
    date: '2026-09-05',
    title: {
      de: 'Stabilitäts- & Synchronisations-Fix',
      en: 'Stability & Synchronization Fix'
    },
    highlights: {
      de: [
        'Behebung eines Fehlers beim Speichern empfangener Tresore auf Mobilgeräten (Proxy-Entkopplung)',
        'Zuverlässigere Puffer-Verarbeitung bei der Datenübertragung',
        'Flexiblere Entschlüsselung für bestehende und importierte Tresore'
      ],
      en: [
        'Fixed an issue when saving synchronized vaults on mobile devices (Proxy decoupling)',
        'More reliable buffer slicing during data transfer',
        'More flexible decryption support for existing and imported vaults'
      ]
    }
  },
  {
    version: '1.4.0',
    date: '2026-09-05',
    title: {
      de: 'Modularer TypeScript-Core & Architektur',
      en: 'Modular TypeScript Core & Architecture'
    },
    highlights: {
      de: [
        'Auslagerung der Zero-Knowledge-Kryptographie in ein modulares TypeScript-Paket',
        'Vorbereitung für künftige biometrische Entsperrung (WebAuthn / Passkeys)',
        'Generischer E2EE-Relay-Sync mit MQTT über WebSockets'
      ],
      en: [
        'Decoupled Zero-Knowledge encryption into a modular TypeScript core',
        'Architectural preparation for future biometric unlocking (WebAuthn / Passkeys)',
        'Generic E2EE relay sync with MQTT over WebSockets'
      ]
    }
  },
  {
    version: '1.3.1',
    date: '2026-08-27',
    title: {
      de: 'Geräteübergreifender E2EE-Relay-Sync',
      en: 'Cross-Device E2EE Relay Sync'
    },
    highlights: {
      de: [
        'Sichere Ende-zu-Ende-verschlüsselte Synchronisation zwischen Geräten',
        'Verbindung über kurzlebige 6-stellige Einmal-Codes oder QR-Code',
        'Zuverlässige Verbindung auch über Mobilfunk und Firewalls'
      ],
      en: [
        'Secure End-to-End encrypted synchronization between devices',
        'Pairing via ephemeral 6-digit one-time codes or QR code',
        'Reliable connection across mobile networks and firewalls'
      ]
    }
  },
  {
    version: '1.3.0',
    date: '2026-08-26',
    title: {
      de: 'P2P-Sync & Medizinischer Haftungsausschluss',
      en: 'P2P Sync & Medical Disclaimer'
    },
    highlights: {
      de: [
        'Einführung des direkten Tresor-Austauschs',
        'Medizinischer Haftungsausschluss und aktualisiertes Handbuch',
        'Verbesserte UI-Anpassungen im Dunkelmodus'
      ],
      en: [
        'Introduction of direct vault exchange',
        'Medical disclaimer onboarding and updated user manual',
        'Improved UI contrast in dark mode'
      ]
    }
  }
];

export function getLatestChangelog() {
  return changelog[0];
}

export function getChangelogForVersion(version) {
  const cleanVersion = String(version || '').replace(/^v/, '');
  return changelog.find(entry => entry.version === cleanVersion);
}

export function getAllChangelogs() {
  return changelog;
}
