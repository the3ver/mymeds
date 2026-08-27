// This file now only exports the raw message objects.
// The i18n instance is created asynchronously in main.js.

export const messages = {
  en: {
    app: {
      title: 'MyMeds',
      databases: 'Databases',
      noDatabases: 'No databases found.',
      createFirstDb: 'Create your first encrypted database to get started.',
      deleteDatabaseTitle: 'Delete Database',
      deleteDatabaseConfirm: 'Are you sure you want to permanently delete the database "{name}"? This cannot be undone.',
      clearEntries: 'Clear All Entries',
      clearEntriesTitle: 'Clear All Entries',
      clearEntriesConfirm: 'Are you sure you want to delete all medication and calendar entries within this database? This cannot be undone.',
      settings: 'Settings',
      preferences: 'App Preferences',
      lightMode: 'Light Mode',
      darkMode: 'Dark Mode',
      about: 'About',
      help: 'Help / Manual',
      noMeds: 'No meds added yet',
      displayMode: 'Display Mode',
      showPills: 'Pills',
      showDays: 'Days',
      showPackages: 'Packages',
      sortMode: 'Sort Order',
      sortAdded: 'Added Date',
      sortName: 'Name (A-Z)',
      sortDays: 'Days Remaining',
      uiScale: 'UI Size',
      scaleSmall: 'Small',
      scaleNormal: 'Normal',
      scaleLarge: 'Large',
      limits: 'Warning Limits',
      yellowLimit: 'Yellow Limit (Days)',
      redLimit: 'Red Limit (Days)',
      notification: 'Attention: {name} lasts only {days} days!',
      showOverview: 'Show Overview Card',
      overviewText: 'Meds last until {date}',
      overviewTextCritical: 'Meds last only {days} days until {date}',
      reset: 'Reset Settings',
      resetConfirm: 'Are you sure you want to reset all settings to default?',
      addMed: 'Add Medication',
      calendar: 'Calendar Reminder',
      calendarTitle: 'Meds are running low!',
      calendarDesc: 'Your meds are running low, click here to check.',
      nav: {
        meds: 'Medications',
        calendar: 'Calendar'
      },
      db: {
        created: 'Created',
        modified: 'Modified',
        meds: 'Medications',
        entries: 'Entries'
      },
      dataManagement: 'Data Management',
      deleteConfirmLabel: 'Type "Delete" to confirm',
      deleteConfirmValue: 'Delete',
      exportData: 'Export Data',
      importData: 'Import Data',
      exportTitle: 'Export Data',
      exportMessage: 'Do you want to save the data as a file or share it?',
      saveFile: 'Save File',
      shareFile: 'Share / Email',
      importTitle: 'Import Data',
      importMessage: 'This will overwrite your current data. Please confirm the import.',
      importStats: 'Export Date: {date}\nMedications: {medsCount} (Current: {currentMedsCount})\nCalendar Entries: {calendarCount} (Current: {currentCalendarCount})',
      importConfirmLabel: 'Type "Import" to confirm',
      importConfirmValue: 'Import',
      importSuccess: 'Data imported successfully.',
      importError: 'Error importing data. Invalid file format.'
    },
    med: {
      name: 'Name',
      ingredient: 'Active Ingredient',
      count: 'Pill Count',
      packageSize: 'Package Size',
      dose: 'Daily Dose',
      doseHint: 'e.g. 1, 0.5, 1/2',
      color: 'Color',
      plan: 'Plan',
      daysRemaining: 'Days remaining',
      emptyDate: 'Estimated empty date',
      na: 'N/A',
      unitPills: 'pcs',
      unitDays: 'd'
    },
    dialog: {
      addTitle: 'Add New Med',
      editTitle: 'Edit Med',
      add: 'Add',
      save: 'Save',
      cancel: 'Cancel',
      edit: 'Edit',
      delete: 'Delete',
      confirm: 'Confirm',
      create: 'Create',
      next: 'Next',
      download: 'Download',
      yes: 'Yes',
      no: 'No',
      createDbTitle: 'Create New Database',
      createDbWarning: 'Important: There is no way to recover your password if you forget it. Access to your data will be permanently lost, as your medical data is stored exclusively on your device and not sent over the network to any servers.',
      dbNameLabel: 'Database Name',
      passwordLabel: 'Password',
      passwordConfirmLabel: 'Confirm Password'
    },
    welcome: {
      title: 'Welcome to MyMeds!',
      thankYou: 'Thank you for installing the app.',
      existingUserTitle: 'Important Update & Terms',
      existingUserIntro: 'Please review and confirm the updated medical disclaimer to continue using MyMeds.',
      explanation: 'MyMeds automatically deducts the daily dose from your inventory every day to warn you when supplies are running low.',
      chooseLanguage: 'Please choose your language:',
      chooseTheme: 'Please choose your preferred theme:',
      light: 'Light',
      dark: 'Dark',
      disclaimer: {
        title: 'Important Medical Disclaimer & Terms',
        pointNoAdvice: 'No Medical Advice: MyMeds is a personal organizational tool and does not provide medical advice, diagnosis, dosage recommendations, or treatment plans.',
        pointResponsibility: 'User Responsibility: All supply calculations and reminders are based solely on your own manual data entry.',
        pointSoftwareErrors: 'Potential Software Errors: Despite greatest care during development, software errors, display issues, or calculation bugs cannot be completely ruled out. Always verify your supplies and intake independently.',
        pointConsult: 'Consult Professionals: Always consult your physician or pharmacist regarding medications, dosages, side effects, or health concerns.',
        pointEmergency: 'Emergencies: In a life-threatening medical emergency, contact emergency services immediately.',
        checkbox: 'I have read and understand the medical disclaimer and agree to the terms.'
      },
      getStarted: 'Get Started'
    },
    about: {
      title: 'About MyMeds',
      description: 'MyMeds is a simple application to help you track your medication inventory.',
      explanation: 'The app automatically deducts the daily dose from your inventory every day to warn you when supplies are running low.',
      version: 'Version',
      changelog: 'Changelog',
      github: 'GitHub Repository',
      license: 'License',
      close: 'Close'
    },
    help: {
      title: 'User Manual',
      intro: 'Welcome to the MyMeds User Manual. Here you will find all information on how to manage your medications, schedule appointments, and secure your data.',
      sections: {
        security: {
          title: 'Encryption & Data Security',
          content: 'All sensitive medical data (medications, stocks, appointments, notes) are stored locally in your browser’s IndexedDB using state-of-the-art 256-bit AES-GCM encryption derived from your password with PBKDF2 (100,000 iterations).\nThere is no backend server or cloud transmission – your health data belongs exclusively to you.\nImportant: Your vault password cannot be recovered or reset. If you lose your password, access to your encrypted data is permanently lost.'
        },
        basics: {
          title: 'Basics & Offline Use',
          content: 'MyMeds is a Progressive Web App (PWA) designed to work completely offline. You can install it on your mobile device or desktop via your browser’s "Add to Home Screen" or "Install App" feature.'
        },
        adding: {
          title: 'Managing Medications',
          content: 'Tap the "Add Medication" card at the bottom of the list to record a new medication. Alongside name and active ingredient, you can set the package size, current stock, daily dose, color tag, and custom notes.\nTapping any medication card expands it to reveal details, days remaining, empty date estimate, and editing options.'
        },
        dose: {
          title: 'Dose Schedules & Fractions',
          content: 'You can set single daily amounts or flexible 4-slot schedules (Morning - Noon - Evening - Night, e.g. 1-0-1 or 1-1-1-1/2).\nFractions (e.g. 1/2, 3/4) and decimal doses (e.g. 0.5, 1.5) are fully supported and automatically calculated into your daily consumption.'
        },
        display: {
          title: 'Display & Sort Modes',
          content: 'In App Preferences, you can customize the badge on medication cards:\n• Pills: Shows remaining tablet count.\n• Days: Shows calculated days of remaining supply.\n• Packages: Displays full and partial package symbols.\nYou can also sort your medication list alphabetically, by date added, or by shortest remaining days.'
        },
        tracking: {
          title: 'Automatic Daily Deductions',
          content: 'Every time you unlock your vault, MyMeds checks the elapsed days since your last session and automatically subtracts the required daily dose from each medication.\nA floating deduction badge provides instant visual confirmation of the subtracted units.'
        },
        warnings: {
          title: 'Warning Thresholds & Overview Banner',
          content: 'The overview banner at the top shows the exact date your overall medication supply runs out.\nWhen a medication falls below the yellow (default: 21 days) or red warning limit (default: 7 days), the banner and card highlight in warning/error colors. You can customize these thresholds in Settings.'
        },
        calendar: {
          title: 'Health Calendar & ICS Export',
          content: 'The Calendar tab tracks doctor visits, vaccinations, illnesses, and general health notes.\n• Timeline: Entries are organized into quarter sections with a dedicated "Today" divider.\n• Filtering: Use the filter button in the top bar to filter entries by type.\n• Calendar Export (.ics): Tap the calendar icon on any entry or restock warning to export an .ics file or share it directly into your device calendar (Google Calendar, Apple Calendar, Outlook).'
        },
        exportImport: {
          title: 'Backups & Data Management',
          content: 'Through the Navigation Drawer (Data Management), you can export your data as an unencrypted JSON backup file or import existing backups.\nThis is ideal for creating regular local backups or transferring your vaults to a new device.'
        }
      },
      close: 'Close'
    },
    update: {
      title: 'Update Available',
      message: 'A new version of MyMeds has been installed.',
      version: 'New Version:',
      changelog: 'View Changelog',
      close: 'Close'
    },
    calendar: {
      title: 'Create Calendar Reminder',
      message: 'This will create a calendar event for {date} to remind you to restock your meds.',
      close: 'Cancel',
      titlePage: 'Calendar',
      noEntries: 'No entries yet',
      add: 'Add Entry',
      edit: 'Edit Entry',
      selectType: 'Select Entry Type',
      today: 'Today',
      quarter: 'Q{q}/{year}',
      fields: {
        date: 'Date',
        title: 'Title',
        doctor: 'Doctor',
        type: 'Type',
        location: 'Location',
        notes: 'Notes',
        agent: 'Agent',
        method: 'Method',
        bodyPart: 'Body Part',
        pathogen: 'Pathogen',
        symptoms: 'Symptoms',
        endDate: 'End Date',
        treatments: 'Treatments / Examinations',
        treatmentsHint: 'Type and press Enter to add'
      },
      types: {
        doctor: 'Doctor Appointment',
        vaccination: 'Vaccination',
        illness: 'Illness',
        note: 'Note'
      },
      methods: {
        subcutaneous: 'Subcutaneous',
        intramuscular: 'Intramuskulär',
        oral: 'Oral',
        rectal: 'Rectal',
        other: 'Sonstiges'
      },
      doctorTypes: {
        general: 'General Practitioner',
        specialist: 'Specialist',
        dentist: 'Dentist',
        eye: 'Ophthalmologist',
        skin: 'Dermatologist',
        women: 'Gynecologist',
        men: 'Urologist',
        heart: 'Cardiologist',
        ortho: 'Orthopedist',
        neuro: 'Neurologist',
        psych: 'Psychiatrist',
        nephro: 'Nephrologist',
        other: 'Other'
      },
      export: 'Export to Calendar',
      exportConfirm: 'Do you want to add this entry to your device calendar?',
      filter: 'Filter',
      filterBy: 'Filtered by type: {types}',
      clearFilter: 'Clear Filter',
      addLink: {
        title: 'Add Link',
        url: 'URL',
        label: 'Label',
        labelPlaceholder: 'Text to display',
        add: 'Add'
      }
    },
    sync: {
      title: 'Device Sync',
      menuItem: 'Sync / Transfer Vault',
      transferToDevice: 'Transfer to other device',
      tabSend: 'Send Vault',
      tabReceive: 'Receive Vault',
      selectVault: 'Select Vault to send',
      sendInstructions: 'Open MyMeds on the target device, navigate to "Receive Vault", and scan the QR code or enter the 6-digit code below.',
      syncCodeLabel: '6-digit Sync Code',
      copyCode: 'Copy Code',
      codeCopied: 'Sync Code copied to clipboard!',
      waitingForReceiver: 'Waiting for partner device to connect...',
      connected: 'Device connected. Transferring encrypted vault...',
      sendSuccess: 'Vault "{name}" transferred successfully!',
      receiveInstructions: 'Enter the 6-digit code shown on the sending device or scan the QR code.',
      enterCode: 'Enter 6-digit code',
      connectAndReceive: 'Connect & Receive',
      connecting: 'Connecting to sender...',
      receiving: 'Receiving encrypted vault...',
      previewTitle: 'Vault Received',
      previewDetails: 'Name: {name}\nMedications: {medsCount}\nCalendar Entries: {calendarCount}\nLast modified: {modifiedAt}',
      conflictTitle: 'Vault exists already',
      conflictMessage: 'A database named "{name}" already exists on this device. What would you like to do?',
      modeOverwrite: 'Overwrite existing vault',
      modeCopy: 'Save as new copy',
      saveVault: 'Save Vault',
      importSuccess: 'Vault "{name}" successfully saved to this device!',
      errorInvalidCode: 'Please enter a valid 6-character code.',
      errorConnectionFailed: 'Connection failed. Please check the code, try again or use the encrypted code copy/paste fallback.',
      errorTransfer: 'Error during vault synchronization: {error}',
      scanQrCode: 'Scan QR Code',
      stopScanning: 'Stop Camera',
      copyEncryptedText: 'Copy Encrypted Code (Offline Fallback)',
      encryptedTextCopied: 'Encrypted code copied to clipboard!',
      orManualPaste: 'Or paste encrypted code manually',
      pasteInstructions: 'If WebRTC direct connection is blocked by your network/firewall, you can paste the encrypted code here:',
      pasteCodePlaceholder: 'Paste encrypted sync payload here...',
      importFromCode: 'Import from Code'
    }
  },
  de: {
    app: {
      title: 'MyMeds',
      databases: 'Datenbanken',
      noDatabases: 'Keine Datenbanken gefunden.',
      createFirstDb: 'Erstellen Sie Ihre erste verschlüsselte Datenbank, um zu beginnen.',
      deleteDatabaseTitle: 'Datenbank löschen',
      deleteDatabaseConfirm: 'Sind Sie sicher, dass Sie die Datenbank "{name}" dauerhaft löschen möchten? Dies kann nicht rückgängig gemacht werden.',
      clearEntries: 'Alle Einträge löschen',
      clearEntriesTitle: 'Alle Einträge löschen',
      clearEntriesConfirm: 'Sind Sie sicher, dass Sie alle Medikamenten- und Kalendereinträge in dieser Datenbank löschen möchten? Dies kann nicht rückgängig gemacht werden.',
      settings: 'Einstellungen',
      preferences: 'App Einstellungen',
      lightMode: 'Heller Modus',
      darkMode: 'Dunkler Modus',
      about: 'Über',
      help: 'Hilfe / Handbuch',
      noMeds: 'Noch keine Medikamente hinzugefügt',
      displayMode: 'Restanzeige',
      showPills: 'Tabletten',
      showDays: 'Tage',
      showPackages: 'Packungen',
      sortMode: 'Sortierung',
      sortAdded: 'Wie hinzugefügt',
      sortName: 'Name (A-Z)',
      sortDays: 'Tage Vorrat',
      uiScale: 'Darstellungsgröße',
      scaleSmall: 'Klein',
      scaleNormal: 'Normal',
      scaleLarge: 'Groß',
      limits: 'Warngrenzen',
      yellowLimit: 'Gelbe Grenze (Tage)',
      redLimit: 'Rote Grenze (Tage)',
      notification: 'Achtung: {name} hält noch {days} Tage!',
      showOverview: 'Übersichtskarte anzeigen',
      overviewText: 'Meds reichen bis {date}',
      overviewTextCritical: 'Meds reichen nur noch {days} Tage bis {date}',
      reset: 'Einstellungen zurücksetzen',
      resetConfirm: 'Möchtest du wirklich alle Einstellungen auf Standard zurücksetzen?',
      addMed: 'Medikament hinzufügen',
      calendar: 'Kalender-Erinnerung',
      calendarTitle: 'Meds sind bald alle!',
      calendarDesc: 'Deine Meds gehen zur Neige, klicke hier um nachzusehen.',
      nav: {
        meds: 'Medikamente',
        calendar: 'Kalender'
      },
      db: {
        created: 'Erstellt',
        modified: 'Geändert',
        meds: 'Medikamente',
        entries: 'Einträge'
      },
      dataManagement: 'Datenverwaltung',
      deleteConfirmLabel: 'Tippe "Löschen" zum Bestätigen',
      deleteConfirmValue: 'Löschen',
      exportData: 'Daten exportieren',
      importData: 'Daten importieren',
      exportTitle: 'Daten exportieren',
      exportMessage: 'Möchtest du die Daten als Datei speichern oder teilen?',
      saveFile: 'Datei speichern',
      shareFile: 'Teilen / E-Mail',
      importTitle: 'Daten importieren',
      importMessage: 'Dies überschreibt deine aktuellen Daten. Bitte bestätige den Import.',
      importStats: 'Exportdatum: {date}\nMedikamente: {medsCount} (Aktuell: {currentMedsCount})\nKalendereinträge: {calendarCount} (Aktuell: {currentCalendarCount})',
      importConfirmLabel: 'Tippe "Import" zum Bestätigen',
      importConfirmValue: 'Import',
      importSuccess: 'Daten erfolgreich importiert.',
      importError: 'Fehler beim Importieren der Daten. Ungültiges Dateiformat.'
    },
    med: {
      name: 'Name',
      ingredient: 'Wirkstoff',
      count: 'Anzahl Tabletten',
      packageSize: 'Packungsgröße',
      dose: 'Tagesdosis',
      doseHint: 'z.B. 1, 0.5, 1/2',
      color: 'Farbe',
      plan: 'Plan',
      daysRemaining: 'Verbleibende Tage',
      emptyDate: 'Voraussichtlich leer am',
      na: 'n.v.',
      unitPills: 'Stk.',
      unitDays: 't'
    },
    dialog: {
      addTitle: 'Neues Medikament',
      editTitle: 'Medikament bearbeiten',
      add: 'Hinzufügen',
      save: 'Speichern',
      cancel: 'Abbrechen',
      edit: 'Bearbeiten',
      delete: 'Löschen',
      confirm: 'Bestätigen',
      create: 'Erstellen',
      next: 'Weiter',
      download: 'Download',
      yes: 'Ja',
      no: 'Nein',
      createDbTitle: 'Neue Datenbank erstellen',
      createDbWarning: 'Wichtig: Es gibt keine Möglichkeit, Ihr Passwort wiederherzustellen, wenn Sie es vergessen. Der Zugriff auf Ihre Daten geht dann für immer verloren, da die eingegebenen medizinischen Daten ausschließlich auf Ihrem Endgerät gespeichert und nicht übers Netz an irgendwelche Server geschickt werden.',
      dbNameLabel: 'Name der Datenbank',
      passwordLabel: 'Passwort',
      passwordConfirmLabel: 'Passwort bestätigen'
    },
    welcome: {
      title: 'Willkommen bei MyMeds!',
      thankYou: 'Danke, dass du die App installiert hast.',
      existingUserTitle: 'Wichtiger Hinweis zur Nutzung',
      existingUserIntro: 'Bitte bestätige den aktualisierten medizinischen Hinweis, um MyMeds wie gewohnt weiterzunutzen.',
      explanation: 'MyMeds zieht jeden Tag automatisch die Tagesdosis von deinem Bestand ab, um dich rechtzeitig zu warnen, wenn der Vorrat knapp wird.',
      chooseLanguage: 'Bitte wähle deine Sprache:',
      chooseTheme: 'Bitte wähle dein bevorzugtes Design:',
      light: 'Hell',
      dark: 'Dunkel',
      disclaimer: {
        title: 'Wichtiger medizinischer Hinweis & Haftungsausschluss',
        pointNoAdvice: 'Keine medizinische Beratung: MyMeds ist ein rein organisatorisches Hilfsmittel und erteilt keine medizinischen Ratschläge, Diagnosen, Dosierungsempfehlungen oder Behandlungshinweise.',
        pointResponsibility: 'Eigenverantwortung: Alle Vorratsberechnungen und Erinnerungen basieren ausschließlich auf deinen eigenen manuellen Eingaben.',
        pointSoftwareErrors: 'Mögliche Softwarefehler: Trotz größter Sorgfalt bei der Entwicklung können Softwarefehler, Darstellungs- oder Rechenfehler in der App nicht vollständig ausgeschlossen werden. Prüfe Bestände und Einnahmen stets eigenständig.',
        pointConsult: 'Fachliche Rücksprache: Wende dich bei allen Fragen zu deiner Medikation, Dosierung, Nebenwirkungen oder Beschwerden immer an deine Ärztin, deinen Arzt oder deine Apotheke.',
        pointEmergency: 'Notfall: In lebensbedrohlichen Notfällen wende dich bitte umgehend an den Notruf (112).',
        checkbox: 'Ich habe den medizinischen Hinweis verstanden und akzeptiere die Nutzungsbedingungen.'
      },
      getStarted: 'Loslegen'
    },
    about: {
      title: 'Über MyMeds',
      description: 'MyMeds ist eine einfache App, um deinen Medikamentenvorrat zu verwalten.',
      explanation: 'Die App zieht jeden Tag automatisch die Tagesdosis von deinem Bestand ab, um dich rechtzeitig zu warnen, wenn der Vorrat knapp wird.',
      version: 'Version',
      changelog: 'Änderungsprotokoll',
      github: 'GitHub Repository',
      license: 'Lizenz',
      close: 'Schließen'
    },
    help: {
      title: 'Benutzerhandbuch',
      intro: 'Willkommen im MyMeds Benutzerhandbuch. Hier findest du alle Informationen zur Erfassung von Medikamenten, Terminplanung und Datensicherheit.',
      sections: {
        security: {
          title: 'Verschlüsselung & Datensicherheit',
          content: 'Alle sensiblen medizinischen Daten (Medikamente, Bestände, Termine, Notizen) werden nach modernsten Standards (AES-GCM 256-Bit) direkt auf deinem Endgerät in der lokalen IndexedDB verschlüsselt.\nEs gibt keinen Server und keine Cloud-Übertragung – deine Gesundheitsdaten gehören ausschließlich dir.\nWichtig: Das Tresor-Passwort kann nicht wiederhergestellt werden. Geht das Passwort verloren, sind auch deine Daten unwiderruflich verloren.'
        },
        basics: {
          title: 'Grundlagen & Offline-Nutzung',
          content: 'MyMeds ist eine Progressive Web App (PWA), die vollständig offline funktioniert. Du kannst die App auf deinem Smartphone oder Desktop installieren (über das Browsermenü "Zum Startbildschirm hinzufügen" oder "Installieren").'
        },
        adding: {
          title: 'Medikamente erfassen & verwalten',
          content: 'Über die Karte "Medikament hinzufügen" trägst du neue Medikamente ein. Neben Name und Wirkstoff kannst du die Packungsgröße, den aktuellen Tablettenbestand, die Dosis, eine Farbmarkierung sowie individuelle Notizen hinterlegen.\nDurch Antippen einer Medikamentenkarte klappen die Detailinfos, die Resttage-Berechnung und die Bearbeitungsfunktionen auf.'
        },
        dose: {
          title: 'Dosis, Einnahmepläne & Bruchteile',
          content: 'Du kannst feste Tagesdosen oder flexible 4-fach-Einnahmepläne (Morgens - Mittags - Abends - Nachts, z. B. 1-0-1 oder 1-1-1-1/2) hinterlegen.\nAuch halbe oder viertel Tabletten (z. B. 0,5, 1,5 oder Brüche wie 1/2, 3/4) werden automatisch korrekt in den Tagesverbrauch eingerechnet.'
        },
        display: {
          title: 'Anzeige- & Sortiermodi',
          content: 'In den Einstellungen kannst du die Anzeige auf den Medikamentenkarten anpassen:\n• Pillen: Zeigt die verbleibende Tablettenanzahl.\n• Tage: Zeigt die verbleibende Reichweite in Tagen.\n• Packungen: Zeigt die Anzahl voller und angebrochener Packungen als Symbole.\nZudem lässt sich die Liste alphabetisch, nach Hinzufügedatum oder nach den geringsten Resttagen sortieren.'
        },
        tracking: {
          title: 'Automatischer Tagesabzug',
          content: 'Beim Entsperren des Tresors berechnet MyMeds automatisch die seit dem letzten Öffnen vergangenen Tage und zieht die entsprechende Dosis von jedem Medikament ab.\nEine kurze Einblendung am rechten Rand zeigt dir direkt, wie viele Einheiten abgezogen wurden.'
        },
        warnings: {
          title: 'Warnschwellen & Vorrats-Banner',
          content: 'Die Übersichtskarte am oberen Rand informiert dich auf einen Blick, bis zu welchem Datum dein gesamter Medikamentenvorrat ausreicht.\nSinkt ein Medikament unter die gelbe (Standard: 21 Tage) oder rote Warnschwelle (Standard: 7 Tage), wechselt die Farbmarkierung auf Gelb bzw. Rot. Die Schwellenwerte können in den Einstellungen individuell festgelegt werden.'
        },
        calendar: {
          title: 'Gesundheitskalender & ICS-Export',
          content: 'Im Reiter "Kalender" protokollierst und planst du Arztbesuche, Impfungen, Erkrankungen und Notizen.\n• Timeline: Termine sind nach Quartalen gegliedert und durch eine "Heute"-Trennlinie getrennt.\n• Filter: Über das Filtersymbol in der oberen Leiste kannst du gezielt nach bestimmten Eintragstypen filtern.\n• Kalender-Export (.ics): Über das Kalendersymbol kannst du Termine oder Nachbestell-Erinnerungen direkt über die Teilen-Funktion in deinen Smartphone- oder Desktop-Kalender (Google Kalender, Apple Kalender, Outlook) exportieren.'
        },
        exportImport: {
          title: 'Datensicherung & Import/Export',
          content: 'Über das Hauptmenü (Datenverwaltung) kannst du jederzeit eine unverschlüsselte JSON-Sicherungsdatei deiner Daten exportieren oder ein bestehendes Backup importieren.\nDies eignet sich ideal für regelmäßige lokale Backups oder den Umzug auf ein neues Endgerät.'
        }
      },
      close: 'Schließen'
    },
    update: {
      title: 'Update Verfügbar',
      message: 'Eine neue Version von MyMeds wurde installiert.',
      version: 'Neue Version:',
      changelog: 'Änderungsprotokoll ansehen',
      close: 'Schließen'
    },
    calendar: {
      title: 'Kalender-Erinnerung erstellen',
      message: 'Dies erstellt einen Kalendereintrag für den {date}, um dich an das Nachbestellen zu erinnern.',
      close: 'Abbrechen',
      titlePage: 'Kalender',
      noEntries: 'Noch keine Einträge',
      add: 'Eintrag hinzufügen',
      edit: 'Eintrag bearbeiten',
      selectType: 'Art des Eintrags wählen',
      today: 'Heute',
      quarter: 'Q{q}/{year}',
      fields: {
        date: 'Datum',
        title: 'Bezeichnung',
        doctor: 'Arzt',
        type: 'Art',
        location: 'Ort',
        notes: 'Notizen',
        agent: 'Wirkstoff',
        method: 'Methode',
        bodyPart: 'Körperstelle',
        pathogen: 'Erreger',
        symptoms: 'Symptome',
        endDate: 'Enddatum',
        treatments: 'Untersuchungen / Behandlungen',
        treatmentsHint: 'Tippen und Enter drücken zum Hinzufügen'
      },
      types: {
        doctor: 'Arzttermin',
        vaccination: 'Impfung',
        illness: 'Erkrankung',
        note: 'Notiz'
      },
      methods: {
        subcutaneous: 'Subkutan',
        intramuscular: 'Intramuskulär',
        oral: 'Oral',
        rectal: 'Rektal',
        other: 'Sonstiges'
      },
      doctorTypes: {
        general: 'Hausarzt',
        specialist: 'Facharzt',
        dentist: 'Zahnarzt',
        eye: 'Augenarzt',
        skin: 'Hautarzt',
        women: 'Frauenarzt',
        men: 'Urologe',
        heart: 'Kardiologe',
        ortho: 'Orthopäde',
        neuro: 'Neurologe',
        psych: 'Psychiater',
        nephro: 'Nephrologe',
        other: 'Sonstiges'
      },
      export: 'In Kalender exportieren',
      exportConfirm: 'Möchtest du diesen Eintrag in deinen Gerätekalender übernehmen?',
      filter: 'Filtern',
      filterBy: 'Gefiltert nach Typ: {types}',
      clearFilter: 'Filter löschen',
      addLink: {
        title: 'Link hinzufügen',
        url: 'URL',
        label: 'Bezeichnung',
        labelPlaceholder: 'Anzuzeigender Text',
        add: 'Hinzufügen'
      }
    },
    sync: {
      title: 'Geräte-Synchronisation',
      menuItem: 'Tresor übertragen / Sync',
      transferToDevice: 'Auf anderes Gerät übertragen',
      tabSend: 'Tresor senden',
      tabReceive: 'Tresor empfangen',
      selectVault: 'Tresor zum Senden auswählen',
      sendInstructions: 'Öffne MyMeds auf dem Zielgerät, gehe auf „Tresor empfangen“ und scanne den QR-Code oder tippe den 6-stelligen Code ein.',
      syncCodeLabel: '6-stelliger Sync-Code',
      copyCode: 'Code kopieren',
      codeCopied: 'Sync-Code in die Zwischenablage kopiert!',
      waitingForReceiver: 'Warte auf Partnergerät...',
      connected: 'Gerät verbunden. Verschlüsselter Tresor wird übertragen...',
      sendSuccess: 'Tresor „{name}“ wurde erfolgreich übertragen!',
      receiveInstructions: 'Gib den 6-stelligen Code des sendenden Geräts ein oder scanne den QR-Code.',
      enterCode: '6-stelligen Code eingeben',
      connectAndReceive: 'Verbinden & Empfangen',
      connecting: 'Verbindung zum Sender wird aufgebaut...',
      receiving: 'Verschlüsselter Tresor wird empfangen...',
      previewTitle: 'Tresor empfangen',
      previewDetails: 'Name: {name}\nMedikamente: {medsCount}\nKalendereinträge: {calendarCount}\nZuletzt geändert: {modifiedAt}',
      conflictTitle: 'Tresor bereits vorhanden',
      conflictMessage: 'Ein Tresor mit dem Namen „{name}“ existiert bereits auf diesem Gerät. Wie möchtest du vorgehen?',
      modeOverwrite: 'Bestehenden Tresor überschreiben',
      modeCopy: 'Als neue Kopie speichern',
      saveVault: 'Tresor speichern',
      importSuccess: 'Tresor „{name}“ wurde erfolgreich auf diesem Gerät gespeichert!',
      errorInvalidCode: 'Bitte gib einen gültigen 6-stelligen Code ein.',
      errorConnectionFailed: 'Verbindung fehlgeschlagen. Bitte prüfe den Code, versuche es erneut oder nutze den verschlüsselten Code zum Kopieren.',
      errorTransfer: 'Fehler bei der Synchronisation: {error}',
      scanQrCode: 'QR-Code scannen',
      stopScanning: 'Kamera schließen',
      copyEncryptedText: 'Verschlüsselten Code kopieren (Offline-Fallback)',
      encryptedTextCopied: 'Verschlüsselter Code in die Zwischenablage kopiert!',
      orManualPaste: 'Oder verschlüsselten Code manuell einfügen',
      pasteInstructions: 'Falls die Direktverbindung durch dein Netzwerk/Firewall blockiert wird, kannst du den Code hier einfügen:',
      pasteCodePlaceholder: 'Verschlüsselten Sync-Code hier einfügen...',
      importFromCode: 'Aus Code importieren'
    }
  }
}
