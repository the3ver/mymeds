/**
 * Structured changelog data for MyMeds.
 * Offline-first, multilingual release notes.
 */

export const changelog = [
  {
    version: '1.9.2',
    date: '2026-09-23',
    title: {
      de: 'Sicherheitsabfrage beim Löschen von Kalendereinträgen',
      en: 'Confirmation Dialog for Calendar Entry Deletion'
    },
    highlights: {
      de: [
        'Bestätigungsdialog vor dem endgültigen Löschen eines Kalendereintrags hinzugefügt (#32)'
      ],
      en: [
        'Added confirmation dialog before deleting calendar entries (#32)'
      ]
    }
  },
  {
    version: '1.9.1',
    date: '2026-09-20',
    title: {
      de: 'Moderne PWA-Funktionen (Speicherschutz, Shortcuts, Badging & Haptik)',
      en: 'Modern PWA Features (Storage Protection, Shortcuts, Badging & Haptics)'
    },
    highlights: {
      de: [
        'Automatischer Schutz der verschlüsselten IndexedDB-Tresore vor Browser-Löschung (Storage Eviction) und Speicheranzeige in den Einstellungen',
        'Schnellzugriff über App-Shortcuts direkt vom Homescreen (Medikamente, Kalender, Barcode/BMP scannen)',
        'App Badging API zur Kennzeichnung kritischer Bestände am App-Icon mit automatischem Reset beim Sperren des Tresors',
        'Haptisches Feedback (Vibration API) bei erfolgreichem Barcode-/BMP-Scan und Fehleingaben (in den Einstellungen deaktivierbar)'
      ],
      en: [
        'Automatic protection of encrypted IndexedDB vaults against browser deletion (Storage Eviction) and storage display in settings',
        'Quick access via App Shortcuts directly from the homescreen (Medications, Calendar, Scan Barcode/BMP)',
        'App Badging API indicating critical medication stock on the app icon with zero-knowledge reset on vault lock',
        'Haptic feedback (Vibration API) on barcode/BMP scans and input warnings (configurable in app settings)'
      ]
    }
  },
  {
    version: '1.9.0',
    date: '2026-09-18',
    title: {
      de: 'Übersichtliche Tresor-Ansicht & Umschaltfunktion',
      en: 'Calm Vault View & Display Toggle'
    },
    highlights: {
      de: [
        'Einführung einer ruhigen, aufgeräumten Tresor-Darstellung mit kompakter Zusammenfassung',
        'Auslagerung sekundärer Tresor-Aktionen (Umbenennen, Sync, Biometrie, Löschen) in ein 3-Punkte-Kontextmenü',
        'Umschaltbarkeit zwischen einfacher und detaillierter Ansicht über Einstellungen und Schnellschalter'
      ],
      en: [
        'Introduced a calm, clean vault layout with a compact summary of meds and entries',
        'Moved secondary vault actions (rename, sync, biometrics, delete) into a 3-dots context menu',
        'Toggle between simple and detailed views via app preferences and quick switch button'
      ]
    }
  },
  {
    version: '1.8.3',
    date: '2026-09-18',
    title: {
      de: 'CI/CD Android SDK-Kompatibilität für Bubblewrap',
      en: 'CI/CD Android SDK Compatibility for Bubblewrap'
    },
    highlights: {
      de: [
        'Bereitstellung von Kompatibilitäts-Symlinks für sdkmanager im Android SDK Pfad für Bubblewrap',
        'Synchronisierung der Android TWA Versionierung auf v1.8.3'
      ],
      en: [
        'Provided compatibility symlinks for sdkmanager in Android SDK path for Bubblewrap',
        'Synchronized Android TWA versioning to v1.8.3'
      ]
    }
  },
  {
    version: '1.8.0',
    date: '2026-09-18',
    title: {
      de: 'Bundesmedikationsplan (BMP) 2D-DataMatrix Anzeige & Export',
      en: 'Medication Plan (BMP) 2D DataMatrix Display & Export'
    },
    highlights: {
      de: [
        'Anzeige der Medikationsliste als offizieller 2D-DataMatrix-Code (Bundesmedikationsplan / BMP)',
        'KBV-konforme XML-Generierung im Ultrakurzformat (UKF 026) mit ZLIB/Deflate-Komprimierung',
        'Auswahl einzelner Medikamente und optionaler Patientendaten für den Export',
        'PNG-Bild-Download, Web-Share und Kopieren des XML-Codes direkt in die Zwischenablage'
      ],
      en: [
        'Display medication list as official 2D DataMatrix code (Bundesmedikationsplan / BMP)',
        'KBV-compliant Ultrakurzformat (UKF 026) XML generation with ZLIB/Deflate compression',
        'Selective inclusion of medications and optional patient data for doctor matching',
        'PNG image download, Web Share, and copying raw XML code directly to clipboard'
      ]
    }
  },
  {
    version: '1.7.0',
    date: '2026-09-16',
    title: {
      de: 'Bundesmedikationsplan (BMP) Scan & Import',
      en: 'Medication Plan (BMP) Scan & Import'
    },
    highlights: {
      de: [
        'Einscannen von gedruckten 2D-DataMatrix-Codes des Bundesmedikationsplans (BMP) via Kamera',
        'Foto- & Bild-Upload zur Erkennung abfotografierter Medikationspläne',
        'Automatische Dekomprimierung (ZLIB/Deflate) und Erkennung von Dosierungen, Wirkstoffen & PZN',
        'Strukturierte Import-Vorschau mit Bestandsmengen-Schnellauswahl und Hinzufügen/Ersetzen-Optionen'
      ],
      en: [
        'Scan printed 2D DataMatrix barcodes from official Medication Plans (BMP) via camera',
        'Photo & image upload to recognize photographed medication schedules',
        'Automatic decompression (ZLIB/Deflate) and parsing of doses, active ingredients & PZN',
        'Structured import preview with pill count presets and append/replace modes'
      ]
    }
  },
  {
    version: '1.6.3',
    date: '2026-09-06',
    title: {
      de: 'Android 13+ Benachrichtigungen & Einstellungs-Fix',
      en: 'Android 13+ Notifications & Settings Fix'
    },
    highlights: {
      de: [
        'Native Benachrichtigungs-Berechtigung (POST_NOTIFICATIONS) für Android 13+ in der APK integriert',
        'Nativer Berechtigungsdialog wird direkt beim ersten App-Start auf Android 13+ angefordert',
        'Fehlerbehebung für Test- und Einnahme-Benachrichtigungen durch Umstellung auf kompatible PNG-Symbole',
        'Zuverlässige Speicherung der Erinnerungs-Einstellungen beim Verlassen und erneuten Öffnen des Dialogs'
      ],
      en: [
        'Integrated native POST_NOTIFICATIONS permission for Android 13+ in the APK',
        'Native permission prompt requested directly on app launch on Android 13+',
        'Fixed test and intake notifications by switching to compatible PNG status icons',
        'Reliable reminder settings persistence when closing and reopening settings'
      ]
    }
  },
  {
    version: '1.6.2',
    date: '2026-09-06',
    title: {
      de: 'Optimierte Lesbarkeit & Layout der Tresor-Karten',
      en: 'Enhanced Readability & Layout for Vault Cards'
    },
    highlights: {
      de: [
        'Deutlich größere, gestochen scharfe Typografie mit voller Deckkraft (100 %) für alle Tresor-Informationen',
        'Moderne horizontale Anordnung von Medikamenten- und Terminbeständen als gut lesbare Kacheln',
        'Optimale Ausnutzung der Bildschirmbreite für Erstellungs- und Änderungsdaten',
        'Größere Icons und Touch-Bereiche für komfortablere Bedienung auf Smartphones'
      ],
      en: [
        'Larger, high-contrast typography with 100% opacity for all vault information',
        'Modern horizontal stat tiles for medication and calendar entry counts',
        'Optimized horizontal layout utilizing screen width for creation and modification dates',
        'Larger icons and touch targets for easier interaction on mobile devices'
      ]
    }
  },
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
