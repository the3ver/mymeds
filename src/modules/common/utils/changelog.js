/**
 * Structured changelog data for MyMeds.
 * Offline-first, multilingual release notes.
 */

export const changelog = [
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
