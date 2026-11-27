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
      deleteDatabaseConfirm:
        'Are you sure you want to permanently delete the database "{name}"? This cannot be undone.',
      clearEntries: 'Clear All Entries',
      clearEntriesTitle: 'Clear All Entries',
      clearEntriesConfirm:
        'Are you sure you want to delete all medication and calendar entries within this database? This cannot be undone.',
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
      vaultDisplayMode: 'Vault View',
      vaultDisplaySimple: 'Simple (Compact & calm)',
      vaultDisplayComfortable: 'Detailed (With counts & dates)',
      vaultSummary: '{meds} medications • {calendar} entries',
      vaultRename: 'Rename Vault',
      vaultDelete: 'Delete Vault',
      vaultActions: 'Vault Actions',
      toggleVaultDisplayMode: 'Switch vault view',
      limits: 'Warning Limits',
      yellowLimit: 'Yellow Limit (Days)',
      redLimit: 'Red Limit (Days)',
      notification: 'Attention: {name} lasts only {days} days!',
      showOverview: 'Show Overview Card',
      overviewText: 'Meds last until {date}',
      overviewTextCritical: 'Meds last only 1 day until {date} | Meds last only {days} days until {date}',
      haptics: 'Haptic Feedback',
      hapticsDesc: 'Subtle vibration for barcode scans and confirmations',
      reset: 'Reset Settings',
      resetConfirm: 'Are you sure you want to reset all settings to default?',
      addMed: 'Add Medication',
      calendar: 'Calendar Reminder',
      calendarTitle: 'Meds are running low!',
      calendarDesc: 'Your meds are running low, click here to check.',
      nav: {
        meds: 'Medications',
        calendar: 'Calendar',
        more: 'More'
      },
      lock: 'Lock',
      undo: 'Undo',
      vaultsSubtitle: 'Encrypted vaults',
      zeroKnowledgeHint: 'Zero-Knowledge local: All data stays AES-256-GCM encrypted on this device.',
      more: {
        sectionAppearance: 'Appearance & Behavior',
        sectionData: 'Data, Backup & Sync',
        sectionApp: 'Manual, Updates & About',
        darkModeOn: 'Dark theme active',
        darkModeOff: 'Light theme active',
        settingsSubtitle: 'Language, limits, reminders, haptics & storage',
        syncSubtitle: 'Transfer encrypted vault via 6-digit code or QR',
        dataSubtitle: 'JSON backup, restore or clear vault',
        bmpSubtitle: 'Scan or display DataMatrix medication plan',
        helpSubtitle: 'Searchable user manual for all features',
        whatsNewSubtitle: 'Latest improvements and changes',
        aboutSubtitle: 'Version, GitHub & license'
      },
      db: {
        created: 'Created',
        modified: 'Modified',
        meds: 'Medications',
        medsLabel: 'Medication | Medications',
        entries: 'Entries',
        entriesLabel: 'Entry | Entries'
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
      importStats:
        'Export Date: {date}\nMedications: {medsCount} (Current: {currentMedsCount})\nCalendar Entries: {calendarCount} (Current: {currentCalendarCount})',
      importConfirmLabel: 'Type "Import" to confirm',
      importConfirmValue: 'Import',
      importSuccess: 'Data imported successfully.',
      importError: 'Error importing data. Invalid file format.',
      scanBmp: 'Scan Doctor’s Plan (BMP)',
      showBmp: 'Show Plan as BMP (DataMatrix)'
    },
    bmp: {
      scanTitle: 'Scan Medication Plan (BMP)',
      scanSubtitle: 'Hold the 2D barcode (DataMatrix) of the doctor’s plan into the frame or upload a photo.',
      cameraError: 'Could not access camera. Please check permissions or upload a photo.',
      uploadImage: 'Take Photo / Upload Image',
      manualInput: 'Enter / Paste Code Manually',
      pastePlaceholder: 'Paste raw XML or Base64 code here...',
      parseCode: 'Parse Code',
      previewTitle: 'Medication Plan Recognized',
      patient: 'Patient',
      doctor: 'Doctor / Practice',
      detectedMeds: 'Recognized Medications ({count})',
      selectAll: 'Select All',
      deselectAll: 'Deselect All',
      importMode: 'Import Mode',
      modeAppend: 'Add to existing medications',
      modeReplace: 'Replace existing medications',
      importSelected: 'Import {count} selected',
      rescan: 'Scan Again',
      noMedsSelected: 'Please select at least one medication to import.',
      importSuccess: '{count} medications successfully imported!',
      invalidPlan: 'Could not recognize a valid medication plan. Please ensure good lighting and focus.',
      exportTitle: 'Medication Plan (BMP)',
      exportSubtitle: 'Official 2D DataMatrix code for doctor practices and pharmacies.',
      formatStandard: 'Standard (Compressed)',
      formatXml: 'Uncompressed (XML)',
      downloadPng: 'Save as PNG Image',
      share: 'Share / Print',
      patientOptional: 'Patient Information (Optional for doctor matching)',
      firstName: 'First Name',
      lastName: 'Last Name',
      birthDate: 'Birth Date',
      emptyMeds: 'No medications selected to display.',
      copyXml: 'Copy XML',
      xmlCopied: 'BMP XML copied to clipboard!',
      selectMedsToInclude: 'Select medications to include:',
      medsCountBadge: '{selected} of {total} medications',
      fullscreen: 'Fullscreen'
    },
    med: {
      name: 'Name',
      ingredient: 'Active Ingredient',
      count: 'Pill Count',
      packageSize: 'Package Size',
      dose: 'Daily Dose',
      doseHint: 'e.g. 1, 0.5, 1/2',
      doseMorning: 'Morning dose',
      doseNoon: 'Noon dose',
      doseEvening: 'Evening dose',
      doseNight: 'Night dose',
      slotMorning: 'Morning',
      slotNoon: 'Noon',
      slotEvening: 'Evening',
      slotNight: 'Night',
      deleteTitle: 'Delete Medication',
      deleteConfirm: 'Are you sure you want to delete this medication?',
      deleteConfirmNamed: 'Are you sure you want to delete "{name}"?',
      deletedToast: '"{name}" was deleted',
      restoredToast: '"{name}" restored',
      quickRefill: 'Refill +1 pack (+{size} pcs)',
      refilledToast: 'Added +{size} pcs to "{name}"',
      refillUndoneToast: 'Refill undone',
      appearance: 'Pill Appearance',
      appearanceHint: 'Customize color, shape & size',
      actionsMenu: 'Medication actions',
      color: 'Color',
      colors: {
        white: 'White',
        'deep-orange': 'Deep Orange',
        orange: 'Orange',
        amber: 'Amber',
        red: 'Red',
        pink: 'Pink',
        purple: 'Purple',
        indigo: 'Indigo',
        blue: 'Blue',
        cyan: 'Cyan',
        teal: 'Teal',
        green: 'Green',
        'blue-grey': 'Blue Grey'
      },
      plan: 'Plan',
      daysRemaining: 'Days remaining',
      emptyDate: 'Estimated empty date',
      na: 'N/A',
      unitPills: 'pcs',
      unitDays: 'd',
      reason: 'Reason',
      instructions: 'Instructions',
      schedule: 'Intake Schedule',
      scheduleDaily: 'Daily',
      scheduleWeekly: 'Weekly',
      scheduleInterval: 'Every X Days',
      weekdays: 'Weekdays',
      everyXDays: 'Every {n} days',
      intervalDaysLabel: 'Interval in days',
      weeklyDays: 'Intake days',
      dayMo: 'Mon',
      dayDi: 'Tue',
      dayMi: 'Wed',
      dayDo: 'Thu',
      dayFr: 'Fri',
      daySa: 'Sat',
      daySo: 'Sun',
      pillShape: 'Pill Shape & Symbol',
      pillSize: 'Pill Size',
      sizeSmall: 'Small (S)',
      sizeMedium: 'Medium (M)',
      sizeLarge: 'Large (L)',
      shapes: {
        letter: 'Letter',
        round: 'Round',
        roundScore: 'Round with Score',
        roundCross: 'Round with Cross',
        capsule: 'Capsule',
        oblong: 'Oblong',
        oblongScore: 'Oblong with Score',
        oval: 'Oval',
        heart: 'Heart',
        diamond: 'Diamond',
        triangle: 'Triangle',
        hexagon: 'Hexagon',
        square: 'Square',
        drop: 'Drops',
        syringe: 'Syringe / Pen',
        inhaler: 'Inhaler / Spray',
        tube: 'Tube / Cream',
        patch: 'Patch'
      }
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
      createDbWarning:
        'Important: There is no way to recover your password if you forget it. Access to your data will be permanently lost, as your medical data is stored exclusively on your device and not sent over the network to any servers.',
      dbNameLabel: 'Database Name',
      passwordLabel: 'Password',
      passwordConfirmLabel: 'Confirm Password',
      unlockTitle: "Unlock '{name}'",
      unlock: 'Unlock',
      passwordRequired: 'Password is required.',
      incorrectPassword: 'Incorrect password.'
    },
    welcome: {
      title: 'Welcome to MyMeds!',
      thankYou: 'Thank you for installing the app.',
      existingUserTitle: 'Important Update & Terms',
      existingUserIntro: 'Please review and confirm the updated medical disclaimer to continue using MyMeds.',
      explanation:
        'MyMeds automatically deducts the daily dose from your inventory every day to warn you when supplies are running low.',
      chooseLanguage: 'Please choose your language:',
      chooseTheme: 'Please choose your preferred theme:',
      light: 'Light',
      dark: 'Dark',
      disclaimer: {
        title: 'Important Medical Disclaimer & Terms',
        pointNoAdvice:
          'No Medical Advice: MyMeds is a personal organizational tool and does not provide medical advice, diagnosis, dosage recommendations, or treatment plans.',
        pointResponsibility:
          'User Responsibility: All supply calculations and reminders are based solely on your own manual data entry.',
        pointSoftwareErrors:
          'Potential Software Errors: Despite greatest care during development, software errors, display issues, or calculation bugs cannot be completely ruled out. Always verify your supplies and intake independently.',
        pointConsult:
          'Consult Professionals: Always consult your physician or pharmacist regarding medications, dosages, side effects, or health concerns.',
        pointEmergency: 'Emergencies: In a life-threatening medical emergency, contact emergency services immediately.',
        checkbox: 'I have read and understand the medical disclaimer and agree to the terms.'
      },
      getStarted: 'Get Started'
    },
    about: {
      title: 'About MyMeds',
      description: 'MyMeds is a simple application to help you track your medication inventory.',
      explanation:
        'The app automatically deducts the daily dose from your inventory every day to warn you when supplies are running low.',
      version: 'Version',
      changelog: 'Changelog',
      github: 'GitHub Repository',
      license: 'License',
      close: 'Close'
    },
    help: {
      title: 'User Manual',
      searchPlaceholder: 'Search user manual...',
      noResults: 'No matching help topics found.',
      intro:
        'Welcome to the MyMeds User Manual. Here you will find all information on how to manage your medications, schedule appointments, and secure your data.',
      sections: {
        security: {
          title: 'Encryption & Data Security',
          content:
            'All sensitive medical data (medications, stocks, appointments, notes) is stored locally in your browser’s IndexedDB, encrypted with 256-bit AES-GCM. The key is derived from your vault password with PBKDF2 (100,000 iterations).\nThere is no MyMeds server and no cloud account. Data only leaves the device when you export a backup, share a file or use device sync. Sync sends only the already encrypted vault.\nImportant: Your vault password cannot be recovered or reset. If you lose your password, access to your encrypted data is permanently lost.'
        },
        basics: {
          title: 'Basics & Offline Use',
          content:
            'MyMeds is a Progressive Web App (PWA) that works completely offline. Install it on your phone or desktop via the browser menu ("Add to Home Screen" or "Install App"). An Android app is also available (Android 7.0 or newer).\n• Navigation: The bottom bar switches between Medications, Calendar and More. The More tab holds settings, sync, backup, BMP medication plan, this manual, "What’s New" and About.\n• App shortcuts: Long-press the installed app icon to open Medications or Calendar directly.\n• Updates: Under More > Check for Updates, MyMeds loads a new version. "What’s New" lists the changes of every release.'
        },
        vaults: {
          title: 'Vaults, Locking & Biometrics',
          content:
            'A vault is a separately encrypted database with its own password, e.g. one per family member. The start screen lists all vaults with their number of medications and entries. Tap the plus button to create a new vault; it unlocks right after creation. The vault menu offers rename, transfer to another device and delete.\n• Locking: The lock icon in the top bar locks the open vault and returns to the vault list. Changes are saved automatically and encrypted before that.\n• Biometric unlock: When unlocking, enable "Remember with biometrics on this device" to unlock later with fingerprint or face recognition. This requires a device and browser with passkey support (WebAuthn PRF). In Settings > Biometric Unlock you can remove all biometric pairings on this device. The password keeps working at any time.'
        },
        adding: {
          title: 'Managing Medications',
          content:
            'Tap "Add Medication" at the end of the list to record a new medication. Alongside name and active ingredient, you can set package size, current stock, dose, reason, intake instructions and notes.\n• Pill appearance: Choose color, shape (e.g. round, capsule, drops, inhaler, patch) and size so the card matches your real tablet.\n• Details: Tapping a card opens a bottom sheet with days remaining, empty date estimate and all actions.\n• Refill: "Refill +1 pack" in the details adds one package size to the stock. The toast offers Undo.\n• Delete: After deleting, the toast offers Undo for a few seconds.'
        },
        dose: {
          title: 'Dose Schedules & Fractions',
          content:
            'You can set a single daily amount or a 4-slot schedule (Morning - Noon - Evening - Night, e.g. 1-0-1 or 1-1-1-1/2).\nFractions (e.g. 1/2, 3/4) and decimal doses (e.g. 0.5, 1.5) are supported and counted into your consumption. The dose keypad offers a fraction key.\n• Intake rhythm: Daily, weekly on selected weekdays, or every X days. Days remaining and automatic deductions respect the rhythm.'
        },
        display: {
          title: 'Display & Sort Modes',
          content:
            'In Settings you can customize the badge on medication cards:\n• Pills: Shows remaining tablet count.\n• Days: Shows calculated days of remaining supply.\n• Packages: Displays full and partial package symbols.\nYou can also sort your medication list alphabetically, by date added, or by shortest remaining days. Further options: UI scale (small, normal, large), simple or comfortable vault list, dark mode (More tab) and language.'
        },
        tracking: {
          title: 'Automatic Daily Deductions',
          content:
            'Every time you unlock your vault, MyMeds checks the elapsed days since your last session and automatically subtracts the required dose from each medication.\nA short badge shows how many units were subtracted.'
        },
        warnings: {
          title: 'Warning Thresholds & Overview Banner',
          content:
            'The overview banner at the top shows the date your overall medication supply runs out.\nWhen a medication falls below the yellow (default: 21 days) or red warning limit (default: 7 days), the banner and card switch to warning or error colors. You can customize these thresholds in Settings.\nIf your device supports app badges, the icon of the installed app shows the number of medications at or below the red limit.'
        },
        prescriptions: {
          title: 'Prescriptions Needed Before an Appointment',
          content:
            'The "Prescriptions" button next to the sort button above the medication list calculates how many packages to ask your doctor for.\n1. Choose the date your medications should last until, e.g. your next appointment. Upcoming doctor appointments from the calendar appear as chips; the next one is preselected.\n2. Buffer: extra days after that date, because the pharmacy may need to order (default 7). MyMeds remembers your value.\n3. MyMeds computes per medication: consumption until date plus buffer, minus stock, rounded up to whole packages. Weekly and every-X-days schedules count only intake days. Medications that last are left out.\n• One prescription holds at most 3 medications; the one that runs out first comes first.\n• Use − and + to change the number of packages. At 0 a medication moves to "Not requested".\n• Without a package size MyMeds shows the missing units instead.\n• Copy or share the list, e.g. to send it to the practice.'
        },
        reminders: {
          title: 'Intake Reminders',
          content:
            'In Settings > Daily Reminders, MyMeds sends notifications for medication intake on this device. Pick standard times (morning, noon, evening, night) or add custom times. "Send test notification" checks that notifications arrive.\nNotifications are generic and contain no medication names.\nAndroid: Allow notifications for MyMeds. For reliable reminders in the background, set battery usage to "Unrestricted" (App info > Battery usage).'
        },
        calendar: {
          title: 'Health Calendar & ICS Export',
          content:
            'The Calendar tab tracks doctor visits, vaccinations, illnesses, and general health notes. Entries have a date and an optional time.\n• Timeline: Entries are grouped into quarters with a "Today" divider. Entries on the same day are sorted by time.\n• Referral Tracking: For doctor appointments, you can track required referrals in three stages ("Needed", "Obtained", "Submitted"). With several appointments at the same practice in the same quarter, a submitted referral covers all following visits in that quarter. A banner at the top of the calendar highlights pending referrals.\n• Filtering: The filter chips above the timeline show only certain entry types or open referrals.\n• Links & tags: Add web links (e.g. to findings or the practice website) and treatment tags to an entry.\n• Calendar Export (.ics): Tap the calendar icon on an entry or restock warning to export an .ics file or share it into your device calendar (Google Calendar, Apple Calendar, Outlook). Entries with a time become a 60-minute appointment.'
        },
        sync: {
          title: 'Device Sync (Transfer Vault)',
          content:
            'Under More > Device Sync you copy a vault to another device, e.g. from phone to tablet.\n1. On the sending device, open "Send Vault" and choose the vault. MyMeds shows a 6-digit code and a QR code.\n2. On the receiving device, open "Receive Vault" and enter the code or scan the QR code.\n3. Check the preview (name, number of medications and entries) and save the vault. If a vault with the same name exists, choose "Overwrite existing vault" or "Save as new copy".\nThe transfer runs over a public relay server (MQTT). It only sees the already encrypted vault, never your password or plain data. On the new device you unlock the vault with its existing password.\nIf the connection fails (e.g. blocked by a firewall), use "Copy Encrypted Code (Offline Fallback)" on the sender and paste the code on the receiver.\nSync copies a complete vault once. It does not merge changes; the most recent transfer wins.'
        },
        bmp: {
          title: 'Medication Plan (BMP / DataMatrix)',
          content:
            'MyMeds reads and creates the German federal medication plan (Bundeseinheitlicher Medikationsplan) via its 2D barcode. Both functions are in the More tab.\n• Scan: Hold the DataMatrix code of the printed plan into the camera frame or upload a photo. Select the recognized medications and choose whether to add them or replace the existing ones.\n• Show: Select medications and display them as a DataMatrix code for your doctor or pharmacy. Optionally add first name, last name and birth date. You can save the code as PNG, share it, show it full screen or copy the XML.'
        },
        exportImport: {
          title: 'Backups & Data Management',
          content:
            'Under More > Data Management, you export the open vault as a JSON backup file or import an existing backup. The backup is unencrypted, so store it in a safe place.\nBefore importing, MyMeds shows the backup date and the number of medications and entries. An import overwrites the current data of the vault and needs a typed confirmation.\nYou can also delete all medications and entries of a vault there.\n• Storage persistence: In Settings > Storage & Persistence, request persistent storage so the browser does not delete your vaults when space runs low. Installed apps get this permission more easily.'
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
      referral: {
        needsReferral: 'Referral required',
        statusLabel: 'Referral status',
        status: {
          needed: 'Needed',
          present: 'Obtained',
          submitted: 'Submitted'
        },
        banner: {
          message:
            '1 upcoming doctor appointment requires a referral to be obtained. | {count} upcoming doctor appointments require referrals to be obtained.'
        },
        filter: 'Open referrals'
      },
      fields: {
        date: 'Date',
        time: 'Time',
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
      deleteEntryTitle: 'Delete Calendar Entry',
      deleteEntryConfirm: 'Are you sure you want to delete this calendar entry?',
      deleteEntryConfirmNamed: 'Are you sure you want to delete the entry "{name}"?',
      filter: 'Filter',
      filterAll: 'All',
      filterBy: 'Filtered by type: {types}',
      clearFilter: 'Clear Filter',
      showPendingReferrals: 'Show',
      deletedToast: '"{name}" was deleted',
      restoredToast: '"{name}" restored',
      addTreatmentTag: 'Add tag',
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
      sendInstructions:
        'Open MyMeds on the target device, navigate to "Receive Vault", and scan the QR code or enter the 6-digit code below.',
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
      previewDetails:
        'Name: {name}\nMedications: {medsCount}\nCalendar Entries: {calendarCount}\nLast modified: {modifiedAt}',
      conflictTitle: 'Vault exists already',
      conflictMessage: 'A database named "{name}" already exists on this device. What would you like to do?',
      modeOverwrite: 'Overwrite existing vault',
      modeCopy: 'Save as new copy',
      saveVault: 'Save Vault',
      importSuccess: 'Vault "{name}" successfully saved to this device!',
      errorInvalidCode: 'Please enter a valid 6-character code.',
      errorConnectionFailed:
        'Connection failed. Please check the code, try again or use the encrypted code copy/paste fallback.',
      errorTransfer: 'Error during vault synchronization: {error}',
      scanQrCode: 'Scan QR Code',
      stopScanning: 'Stop Camera',
      copyEncryptedText: 'Copy Encrypted Code (Offline Fallback)',
      encryptedTextCopied: 'Encrypted code copied to clipboard!',
      orManualPaste: 'Or paste encrypted code manually',
      pasteInstructions:
        'If WebRTC direct connection is blocked by your network/firewall, you can paste the encrypted code here:',
      pasteCodePlaceholder: 'Paste encrypted sync payload here...',
      importFromCode: 'Import from Code'
    },
    updates: {
      check: 'Check for Updates',
      checking: 'Checking for updates...',
      upToDate: 'MyMeds is up to date (v{version})',
      updateFound: 'New update available! Downloading...',
      updateReady: 'New update ready! Reload to apply.',
      reloadNow: 'Reload Now',
      offline: 'Cannot check for updates while offline.',
      error: 'Failed to check for updates.'
    },
    whatsNew: {
      title: "What's New in MyMeds?",
      versionBadge: 'Version {version}',
      releasedOn: 'Released on {date}',
      showPrevious: 'View previous versions',
      hidePrevious: 'Hide previous versions',
      close: 'Got it'
    },
    biometrics: {
      title: 'Biometric Unlock',
      unlockWith: 'Unlock with Biometrics',
      unlockPrompt: 'Touch fingerprint sensor or use Face ID to unlock',
      rememberOnDevice: 'Remember with biometrics on this device',
      usePasswordInstead: 'Use password instead',
      enrollSuccess: 'Biometric unlock enabled on this device.',
      disabled: 'Biometrics disabled for this vault.',
      notSupported: 'Biometrics is not supported on this device/browser.',
      sessionRevoked: 'Biometric session removed.',
      clearAllSessions: 'Remove all biometric sessions',
      clearAllSuccess: 'All biometric pairings on this device have been cleared.',
      clearAllConfirm:
        'Do you really want to remove all biometric pairings on this device? You will need to unlock your vaults with their master password.',
      activeOnThisDevice: 'Biometric unlock is active on this device',
      error: 'Biometric authentication failed: {message}',
      cancelled: 'Biometric authentication cancelled.'
    },
    reminders: {
      title: 'Daily Reminders',
      enable: 'Enable daily reminders',
      description: 'Receive generic notifications for medication intake on this device.',
      permissionTitle: 'Notification Permission',
      permissionPrompt: 'Notifications are required to send intake reminders.',
      permissionDenied:
        'Notifications are blocked in your browser/system settings. Please enable them in Android App Settings to receive reminders.',
      permissionRequiredToast:
        'Notifications are not permitted. Please allow notifications for MyMeds in Android App Settings.',
      requestPermission: 'Allow Notifications',
      standardTimes: 'Standard Times',
      customTimes: 'Custom Times',
      morning: 'Morning',
      noon: 'Noon',
      evening: 'Evening',
      night: 'Night',
      custom: 'Custom Time',
      addCustom: 'Add custom time',
      removeCustom: 'Remove time',
      sendTest: 'Send test notification',
      testSent: 'Test notification sent!',
      notificationTitle: 'MyMeds',
      notificationBody: 'Reminder: Time for your medication.',
      batteryOptimizationTitle: 'Important for Android / Pixel users',
      batteryOptimizationText:
        'To ensure reminders arrive reliably on time in the background, set battery usage for MyMeds to "Unrestricted" in Android App Info (App info -> Battery usage -> Unrestricted).'
    },
    prescription: {
      open: 'Prescriptions needed until a date',
      button: 'Prescriptions',
      title: 'Prescriptions needed',
      close: 'Close',
      intro:
        'Shows how many packages to ask your doctor for so that every medication lasts until the chosen date. Calculated from stock, intake schedule and package size. One prescription holds at most 3 medications.',
      lastUntil: 'Last until',
      bufferDays: 'Buffer (days)',
      bufferInvalid: '0 to 365 days',
      nextAppointments: 'Next doctor appointments',
      chooseDate: 'Choose the date your medications should last until.',
      noneNeeded: 'All medications last until {date}. No prescription needed.',
      heading: 'Prescription {number}',
      packageOf: 'Package of {size}',
      missingPackageSize: '{units} units missing, package size not set',
      line: '{packages} x {name} ({size} units)',
      lineNoPackage: '{name}: {units} units (package size not set)',
      fewer: 'One package less of {name}',
      more: 'One package more of {name}',
      excluded: 'Not requested (tap to add)',
      copy: 'Copy',
      share: 'Share',
      copied: 'Copied to clipboard',
      copyFailed: 'Copying failed'
    },
    storage: {
      title: 'Storage & Persistence',
      persisted: 'Persistent (Protected)',
      notPersisted: 'Standard (Browser-managed)',
      persistedDesc: 'Your encrypted vaults are protected from automatic deletion by the OS.',
      notPersistedDesc:
        'The browser may clear data under storage pressure. Request persistent storage to protect your data.',
      requestPersist: 'Request Persistent Storage',
      usage: 'Storage Used',
      persistSuccess: 'Persistent storage successfully granted.',
      persistFailed: 'Persistent storage could not be granted. Install MyMeds to home screen to allow this.'
    },
    a11y: {
      lockVault: 'Lock vault',
      selectColor: 'Select color {color}',
      switchCamera: 'Switch camera',
      toggleFlashlight: 'Toggle flashlight'
    }
  },
  de: {
    app: {
      title: 'MyMeds',
      databases: 'Datenbanken',
      noDatabases: 'Keine Datenbanken gefunden.',
      createFirstDb: 'Erstelle deine erste verschlüsselte Datenbank, um zu beginnen.',
      deleteDatabaseTitle: 'Datenbank löschen',
      deleteDatabaseConfirm:
        'Möchtest du die Datenbank "{name}" wirklich dauerhaft löschen? Dies kann nicht rückgängig gemacht werden.',
      clearEntries: 'Alle Einträge löschen',
      clearEntriesTitle: 'Alle Einträge löschen',
      clearEntriesConfirm:
        'Möchtest du wirklich alle Medikamenten- und Kalendereinträge in dieser Datenbank löschen? Dies kann nicht rückgängig gemacht werden.',
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
      vaultDisplayMode: 'Tresor-Ansicht',
      vaultDisplaySimple: 'Einfach (Kompakt & ruhig)',
      vaultDisplayComfortable: 'Detailliert (Mit Zählern & Datumsangaben)',
      vaultSummary: '{meds} Medikamente • {calendar} Termine',
      vaultRename: 'Tresor umbenennen',
      vaultDelete: 'Tresor löschen',
      vaultActions: 'Tresor-Aktionen',
      toggleVaultDisplayMode: 'Tresor-Ansicht umschalten',
      limits: 'Warngrenzen',
      yellowLimit: 'Gelbe Grenze (Tage)',
      redLimit: 'Rote Grenze (Tage)',
      notification: 'Achtung: {name} hält noch {days} Tage!',
      showOverview: 'Übersichtskarte anzeigen',
      overviewText: 'Meds reichen bis {date}',
      overviewTextCritical: 'Meds reichen nur noch 1 Tag bis {date} | Meds reichen nur noch {days} Tage bis {date}',
      haptics: 'Haptisches Feedback',
      hapticsDesc: 'Dezente Vibration bei Barcode-Scans und Bestätigungen',
      reset: 'Einstellungen zurücksetzen',
      resetConfirm: 'Möchtest du wirklich alle Einstellungen auf Standard zurücksetzen?',
      addMed: 'Medikament hinzufügen',
      calendar: 'Kalender-Erinnerung',
      calendarTitle: 'Meds sind bald alle!',
      calendarDesc: 'Deine Meds gehen zur Neige, klicke hier um nachzusehen.',
      nav: {
        meds: 'Medikamente',
        calendar: 'Kalender',
        more: 'Mehr'
      },
      lock: 'Sperren',
      undo: 'Rückgängig',
      vaultsSubtitle: 'Verschlüsselte Tresore',
      zeroKnowledgeHint: 'Zero-Knowledge lokal: Alle Daten bleiben AES-256-GCM-verschlüsselt auf diesem Gerät.',
      more: {
        sectionAppearance: 'Darstellung & Verhalten',
        sectionData: 'Daten, Backup & Sync',
        sectionApp: 'Handbuch, Updates & Info',
        darkModeOn: 'Dunkles Design aktiv',
        darkModeOff: 'Helles Design aktiv',
        settingsSubtitle: 'Sprache, Warnlimits, Erinnerungen, Haptik & Speicher',
        syncSubtitle: 'Tresor per 6-stelligem Code oder QR übertragen',
        dataSubtitle: 'JSON-Backup sichern, importieren oder leeren',
        bmpSubtitle: 'DataMatrix-Medikationsplan scannen oder anzeigen',
        helpSubtitle: 'Durchsuchbares Handbuch zu allen Funktionen',
        whatsNewSubtitle: 'Aktuelle Verbesserungen und Änderungen',
        aboutSubtitle: 'Version, GitHub & Lizenz'
      },
      db: {
        created: 'Erstellt',
        modified: 'Geändert',
        meds: 'Medikamente',
        medsLabel: 'Medikament | Medikamente',
        entries: 'Einträge',
        entriesLabel: 'Eintrag | Einträge'
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
      importStats:
        'Exportdatum: {date}\nMedikamente: {medsCount} (Aktuell: {currentMedsCount})\nKalendereinträge: {calendarCount} (Aktuell: {currentCalendarCount})',
      importConfirmLabel: 'Tippe "Import" zum Bestätigen',
      importConfirmValue: 'Import',
      importSuccess: 'Daten erfolgreich importiert.',
      importError: 'Fehler beim Importieren der Daten. Ungültiges Dateiformat.',
      scanBmp: 'Arztplan einscannen (BMP)',
      showBmp: 'Plan als BMP anzeigen (DataMatrix)'
    },
    bmp: {
      scanTitle: 'Medikationsplan (BMP) einscannen',
      scanSubtitle: 'Halte den 2D-Barcode (DataMatrix) des Arztplans in das Sucherfeld oder lade ein Foto hoch.',
      cameraError: 'Kamerazugriff fehlgeschlagen. Bitte prüfe die Kameraberechtigung oder wähle ein Bild aus.',
      uploadImage: 'Foto aufnehmen / Bild wählen',
      manualInput: 'Code manuell eingeben',
      pastePlaceholder: 'XML oder Base64-Code hier einfügen...',
      parseCode: 'Code analysieren',
      previewTitle: 'Medikationsplan erkannt',
      patient: 'Patient',
      doctor: 'Arzt / Praxis',
      detectedMeds: 'Erkannte Medikamente ({count})',
      selectAll: 'Alle auswählen',
      deselectAll: 'Keine auswählen',
      importMode: 'Import-Modus',
      modeAppend: 'Zu bestehenden Medikamenten hinzufügen',
      modeReplace: 'Bestehende Medikamente ersetzen',
      importSelected: '{count} ausgewählte importieren',
      rescan: 'Neu scannen',
      noMedsSelected: 'Bitte wähle mindestens ein Medikament aus.',
      importSuccess: '{count} Medikamente erfolgreich importiert!',
      invalidPlan:
        'Es konnte kein gültiger Medikationsplan erkannt werden. Achte auf gute Beleuchtung und einen scharfen 2D-Code.',
      exportTitle: 'Bundesmedikationsplan (BMP)',
      exportSubtitle: 'Offizieller 2D-DataMatrix-Code für Arztpraxen und Apotheken.',
      formatStandard: 'Standard (Komprimiert)',
      formatXml: 'Unkomprimiert (XML)',
      downloadPng: 'Als PNG-Bild speichern',
      share: 'Teilen / Drucken',
      patientOptional: 'Patienten-Daten (optional für Arzt-Zuordnung)',
      firstName: 'Vorname',
      lastName: 'Nachname',
      birthDate: 'Geburtsdatum',
      emptyMeds: 'Keine Medikamente zur Anzeige ausgewählt.',
      copyXml: 'XML kopieren',
      xmlCopied: 'BMP-XML in die Zwischenablage kopiert!',
      selectMedsToInclude: 'Auszustellende Medikamente auswählen:',
      medsCountBadge: '{selected} von {total} Medikamenten',
      fullscreen: 'Vollbild'
    },
    med: {
      name: 'Name',
      ingredient: 'Wirkstoff',
      count: 'Anzahl Tabletten',
      packageSize: 'Packungsgröße',
      dose: 'Tagesdosis',
      doseHint: 'z.B. 1, 0.5, 1/2',
      doseMorning: 'Dosis Morgens',
      doseNoon: 'Dosis Mittags',
      doseEvening: 'Dosis Abends',
      doseNight: 'Dosis Nachts',
      slotMorning: 'Morgens',
      slotNoon: 'Mittags',
      slotEvening: 'Abends',
      slotNight: 'Nachts',
      deleteTitle: 'Medikament löschen',
      deleteConfirm: 'Möchtest du dieses Medikament wirklich löschen?',
      deleteConfirmNamed: 'Möchtest du "{name}" wirklich löschen?',
      deletedToast: '„{name}“ wurde gelöscht',
      restoredToast: '„{name}“ wiederhergestellt',
      quickRefill: '+1 Packung nachfüllen (+{size} Stk.)',
      refilledToast: '+{size} Stk. zu „{name}“ hinzugefügt',
      refillUndoneToast: 'Nachfüllen rückgängig gemacht',
      appearance: 'Aussehen der Tablette',
      appearanceHint: 'Farbe, Form & Größe anpassen',
      actionsMenu: 'Medikamenten-Aktionen',
      color: 'Farbe',
      colors: {
        white: 'Weiß',
        'deep-orange': 'Dunkelorange',
        orange: 'Orange',
        amber: 'Bernstein',
        red: 'Rot',
        pink: 'Pink',
        purple: 'Lila',
        indigo: 'Indigo',
        blue: 'Blau',
        cyan: 'Cyan',
        teal: 'Türkis',
        green: 'Grün',
        'blue-grey': 'Blaugrau'
      },
      plan: 'Plan',
      daysRemaining: 'Verbleibende Tage',
      emptyDate: 'Voraussichtlich leer am',
      na: 'n.v.',
      unitPills: 'Stk.',
      unitDays: 't',
      reason: 'Grund',
      instructions: 'Hinweise',
      schedule: 'Einnahmeturnus',
      scheduleDaily: 'Täglich',
      scheduleWeekly: 'Wöchentlich',
      scheduleInterval: 'Alle X Tage',
      weekdays: 'Wochentage',
      everyXDays: 'Alle {n} Tage',
      intervalDaysLabel: 'Intervall in Tagen',
      weeklyDays: 'Einnahmetage',
      dayMo: 'Mo',
      dayDi: 'Di',
      dayMi: 'Mi',
      dayDo: 'Do',
      dayFr: 'Fr',
      daySa: 'Sa',
      daySo: 'So',
      pillShape: 'Pillenform & Symbol',
      pillSize: 'Pillengröße',
      sizeSmall: 'Klein (S)',
      sizeMedium: 'Mittel (M)',
      sizeLarge: 'Groß (L)',
      shapes: {
        letter: 'Buchstabe',
        round: 'Rund',
        roundScore: 'Rund mit Kerbe',
        roundCross: 'Rund mit Kreuzkerbe',
        capsule: 'Kapsel',
        oblong: 'Oblong',
        oblongScore: 'Oblong mit Kerbe',
        oval: 'Oval',
        heart: 'Herzform',
        diamond: 'Raute / Diamant',
        triangle: 'Dreieck',
        hexagon: 'Sechseck',
        square: 'Quadrat',
        drop: 'Tropfen',
        syringe: 'Spritze / Pen',
        inhaler: 'Inhalator / Spray',
        tube: 'Salbentube',
        patch: 'Pflaster'
      }
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
      createDbWarning:
        'Wichtig: Es gibt keine Möglichkeit, dein Passwort wiederherzustellen, wenn du es vergisst. Der Zugriff auf deine Daten geht dann für immer verloren, da die eingegebenen medizinischen Daten ausschließlich auf deinem Endgerät gespeichert und nicht übers Netz an irgendwelche Server geschickt werden.',
      dbNameLabel: 'Name der Datenbank',
      passwordLabel: 'Passwort',
      passwordConfirmLabel: 'Passwort bestätigen',
      unlockTitle: "'{name}' entsperren",
      unlock: 'Entsperren',
      passwordRequired: 'Passwort ist erforderlich.',
      incorrectPassword: 'Falsches Passwort.'
    },
    welcome: {
      title: 'Willkommen bei MyMeds!',
      thankYou: 'Danke, dass du die App installiert hast.',
      existingUserTitle: 'Wichtiger Hinweis zur Nutzung',
      existingUserIntro:
        'Bitte bestätige den aktualisierten medizinischen Hinweis, um MyMeds wie gewohnt weiterzunutzen.',
      explanation:
        'MyMeds zieht jeden Tag automatisch die Tagesdosis von deinem Bestand ab, um dich rechtzeitig zu warnen, wenn der Vorrat knapp wird.',
      chooseLanguage: 'Bitte wähle deine Sprache:',
      chooseTheme: 'Bitte wähle dein bevorzugtes Design:',
      light: 'Hell',
      dark: 'Dunkel',
      disclaimer: {
        title: 'Wichtiger medizinischer Hinweis & Haftungsausschluss',
        pointNoAdvice:
          'Keine medizinische Beratung: MyMeds ist ein rein organisatorisches Hilfsmittel und erteilt keine medizinischen Ratschläge, Diagnosen, Dosierungsempfehlungen oder Behandlungshinweise.',
        pointResponsibility:
          'Eigenverantwortung: Alle Vorratsberechnungen und Erinnerungen basieren ausschließlich auf deinen eigenen manuellen Eingaben.',
        pointSoftwareErrors:
          'Mögliche Softwarefehler: Trotz größter Sorgfalt bei der Entwicklung können Softwarefehler, Darstellungs- oder Rechenfehler in der App nicht vollständig ausgeschlossen werden. Prüfe Bestände und Einnahmen stets eigenständig.',
        pointConsult:
          'Fachliche Rücksprache: Wende dich bei allen Fragen zu deiner Medikation, Dosierung, Nebenwirkungen oder Beschwerden immer an deine Ärztin, deinen Arzt oder deine Apotheke.',
        pointEmergency: 'Notfall: In lebensbedrohlichen Notfällen wende dich bitte umgehend an den Notruf (112).',
        checkbox: 'Ich habe den medizinischen Hinweis verstanden und akzeptiere die Nutzungsbedingungen.'
      },
      getStarted: 'Loslegen'
    },
    about: {
      title: 'Über MyMeds',
      description: 'MyMeds ist eine einfache App, um deinen Medikamentenvorrat zu verwalten.',
      explanation:
        'Die App zieht jeden Tag automatisch die Tagesdosis von deinem Bestand ab, um dich rechtzeitig zu warnen, wenn der Vorrat knapp wird.',
      version: 'Version',
      changelog: 'Änderungsprotokoll',
      github: 'GitHub Repository',
      license: 'Lizenz',
      close: 'Schließen'
    },
    help: {
      title: 'Benutzerhandbuch',
      searchPlaceholder: 'Handbuch durchsuchen...',
      noResults: 'Keine passenden Hilfethemen gefunden.',
      intro:
        'Willkommen im MyMeds Benutzerhandbuch. Hier findest du alle Informationen zur Erfassung von Medikamenten, Terminplanung und Datensicherheit.',
      sections: {
        security: {
          title: 'Verschlüsselung & Datensicherheit',
          content:
            'Alle sensiblen medizinischen Daten (Medikamente, Bestände, Termine, Notizen) liegen verschlüsselt (AES-GCM 256-Bit) in der lokalen IndexedDB deines Geräts. Den Schlüssel leitet MyMeds per PBKDF2 (100.000 Iterationen) aus deinem Tresor-Passwort ab.\nEs gibt keinen MyMeds-Server und kein Cloud-Konto. Daten verlassen das Gerät nur, wenn du ein Backup exportierst, eine Datei teilst oder die Geräte-Synchronisation nutzt. Der Sync überträgt nur den bereits verschlüsselten Tresor.\nWichtig: Das Tresor-Passwort kann nicht wiederhergestellt werden. Geht das Passwort verloren, sind auch deine Daten unwiderruflich verloren.'
        },
        basics: {
          title: 'Grundlagen & Offline-Nutzung',
          content:
            'MyMeds ist eine Progressive Web App (PWA), die vollständig offline funktioniert. Installiere sie über das Browsermenü ("Zum Startbildschirm hinzufügen" oder "Installieren") auf Smartphone oder Desktop. Zusätzlich gibt es eine Android-App (ab Android 7.0).\n• Navigation: Die untere Leiste wechselt zwischen Medikamente, Kalender und Mehr. Unter Mehr findest du Einstellungen, Sync, Backup, BMP-Medikationsplan, dieses Handbuch, "Was gibt’s Neues" und Über.\n• App-Verknüpfungen: Lange auf das Symbol der installierten App drücken öffnet direkt Medikamente oder Kalender.\n• Updates: Unter Mehr > Auf Updates prüfen lädt MyMeds eine neue Version. "Was gibt’s Neues" listet die Änderungen jeder Version.'
        },
        vaults: {
          title: 'Tresore, Sperren & Biometrie',
          content:
            'Ein Tresor ist eine eigene verschlüsselte Datenbank mit eigenem Passwort, z. B. einer pro Familienmitglied. Der Startbildschirm listet alle Tresore mit Anzahl der Medikamente und Einträge. Über den Plus-Button legst du einen neuen Tresor an, er ist danach sofort entsperrt. Über das Menü eines Tresors benennst du ihn um, überträgst ihn auf ein anderes Gerät oder löschst ihn.\n• Sperren: Das Schloss-Symbol in der oberen Leiste sperrt den offenen Tresor und führt zurück zur Tresor-Liste. Änderungen speichert MyMeds vorher automatisch und verschlüsselt.\n• Biometrisches Entsperren: Aktivierst du beim Entsperren "Auf diesem Gerät mit Biometrie merken", öffnest du den Tresor künftig per Fingerabdruck oder Gesichtserkennung. Dafür braucht es ein Gerät und einen Browser mit Passkey-Unterstützung (WebAuthn PRF). Unter Einstellungen > Biometrisches Entsperren entfernst du alle Kopplungen auf diesem Gerät. Das Passwort funktioniert jederzeit weiter.'
        },
        adding: {
          title: 'Medikamente erfassen & verwalten',
          content:
            'Über "Medikament hinzufügen" am Ende der Liste trägst du ein neues Medikament ein. Neben Name und Wirkstoff hinterlegst du Packungsgröße, aktuellen Bestand, Dosis, Grund, Einnahmehinweise und Notizen.\n• Aussehen: Farbe, Form (z. B. rund, Kapsel, Tropfen, Inhalator, Pflaster) und Größe passt du an, damit die Karte deiner echten Tablette ähnelt.\n• Details: Antippen einer Karte öffnet ein Bottom Sheet mit Resttagen, voraussichtlichem Leer-Datum und allen Aktionen.\n• Nachfüllen: "+1 Packung nachfüllen" in den Details addiert eine Packungsgröße zum Bestand. Die Einblendung bietet Rückgängig an.\n• Löschen: Nach dem Löschen bietet die Einblendung einige Sekunden lang Rückgängig an.'
        },
        dose: {
          title: 'Dosis, Einnahmepläne & Bruchteile',
          content:
            'Du kannst eine feste Tagesdosis oder einen 4-fach-Einnahmeplan (Morgens - Mittags - Abends - Nachts, z. B. 1-0-1 oder 1-1-1-1/2) hinterlegen.\nHalbe oder viertel Tabletten (z. B. 0,5, 1,5 oder Brüche wie 1/2, 3/4) rechnet MyMeds korrekt in den Verbrauch ein. Die Dosis-Tastatur hat dafür eine Bruch-Taste.\n• Einnahmerhythmus: Täglich, wöchentlich an ausgewählten Wochentagen oder alle X Tage. Resttage und automatischer Abzug berücksichtigen den Rhythmus.'
        },
        display: {
          title: 'Anzeige- & Sortiermodi',
          content:
            'In den Einstellungen passt du die Anzeige auf den Medikamentenkarten an:\n• Pillen: Zeigt die verbleibende Tablettenanzahl.\n• Tage: Zeigt die verbleibende Reichweite in Tagen.\n• Packungen: Zeigt die Anzahl voller und angebrochener Packungen als Symbole.\nDie Liste lässt sich alphabetisch, nach Hinzufügedatum oder nach den geringsten Resttagen sortieren. Weitere Optionen: UI-Skalierung (klein, normal, groß), einfache oder komfortable Tresor-Liste, dunkler Modus (Mehr-Tab) und Sprache.'
        },
        tracking: {
          title: 'Automatischer Tagesabzug',
          content:
            'Beim Entsperren des Tresors berechnet MyMeds die seit dem letzten Öffnen vergangenen Tage und zieht die entsprechende Dosis von jedem Medikament ab.\nEine kurze Einblendung zeigt dir, wie viele Einheiten abgezogen wurden.'
        },
        warnings: {
          title: 'Warnschwellen & Vorrats-Banner',
          content:
            'Die Übersichtskarte am oberen Rand zeigt, bis zu welchem Datum dein gesamter Medikamentenvorrat reicht.\nSinkt ein Medikament unter die gelbe (Standard: 21 Tage) oder rote Warnschwelle (Standard: 7 Tage), wechselt die Farbmarkierung auf Gelb bzw. Rot. Die Schwellenwerte legst du in den Einstellungen fest.\nUnterstützt dein Gerät App-Badges, zeigt das Symbol der installierten App die Anzahl der Medikamente an oder unter der roten Schwelle.'
        },
        prescriptions: {
          title: 'Rezeptbedarf bis zum nächsten Termin',
          content:
            'Der Button "Rezepte" neben der Sortierung über der Medikamentenliste berechnet, wie viele Packungen du beim Arzt anfragen musst.\n1. Wähle das Datum, bis zu dem die Medikamente reichen sollen, z. B. deinen nächsten Termin. Kommende Arzttermine aus dem Kalender erscheinen als Chips, der nächste ist vorausgewählt.\n2. Puffer: zusätzliche Tage nach dem Datum, weil die Apotheke eventuell bestellen muss (Standard 7). MyMeds merkt sich deinen Wert.\n3. MyMeds rechnet pro Medikament: Verbrauch bis Datum plus Puffer, minus Bestand, aufgerundet auf ganze Packungen. Bei wöchentlichem Rhythmus oder alle X Tage zählen nur die Einnahmetage. Medikamente, die reichen, fallen heraus.\n• Auf ein Rezept passen höchstens 3 Medikamente, das zuerst leere steht vorn.\n• Mit − und + änderst du die Zahl der Packungen. Bei 0 wandert ein Medikament zu "Nicht anfordern".\n• Ohne Packungsgröße zeigt MyMeds die fehlende Stückzahl.\n• Kopiere oder teile die Liste, z. B. um sie an die Praxis zu schicken.'
        },
        reminders: {
          title: 'Einnahme-Erinnerungen',
          content:
            'Unter Einstellungen > Tägliche Erinnerungen schickt MyMeds auf diesem Gerät Benachrichtigungen zur Einnahme. Wähle Standardzeiten (morgens, mittags, abends, nachts) oder füge eigene Uhrzeiten hinzu. "Test-Benachrichtigung senden" prüft, ob Benachrichtigungen ankommen.\nDie Benachrichtigungen sind allgemein gehalten und nennen keine Medikamente.\nAndroid: Erlaube Benachrichtigungen für MyMeds. Damit Erinnerungen auch im Hintergrund pünktlich kommen, stelle die Akkunutzung auf "Nicht eingeschränkt" (App-Info > Akkunutzung).'
        },
        calendar: {
          title: 'Gesundheitskalender & ICS-Export',
          content:
            'Im Reiter "Kalender" protokollierst und planst du Arztbesuche, Impfungen, Erkrankungen und Notizen. Einträge haben ein Datum und eine optionale Uhrzeit.\n• Timeline: Einträge sind nach Quartalen gegliedert, eine "Heute"-Linie trennt Vergangenes und Kommendes. Einträge am selben Tag sind nach Uhrzeit sortiert.\n• Überweisungstracking: Bei Arztterminen erfasst du den Überweisungsstatus in drei Stufen ("Zu besorgen", "Liegt vor", "Abgegeben"). Bei mehreren Terminen in derselben Praxis im selben Quartal deckt eine abgegebene Überweisung alle weiteren Termine des Quartals ab. Ein Hinweis-Banner oben im Kalender erinnert an offene Überweisungen.\n• Filter: Die Filter-Chips über der Timeline zeigen nur bestimmte Eintragstypen oder offene Überweisungen.\n• Links & Tags: Hänge Web-Links (z. B. zu Befunden oder zur Praxis-Website) und Behandlungs-Tags an einen Eintrag.\n• Kalender-Export (.ics): Über das Kalendersymbol exportierst du Termine oder Nachbestell-Erinnerungen als .ics-Datei oder teilst sie direkt in deinen Kalender (Google Kalender, Apple Kalender, Outlook). Einträge mit Uhrzeit werden zum Termin mit 60 Minuten Dauer.'
        },
        sync: {
          title: 'Geräte-Synchronisation (Tresor übertragen)',
          content:
            'Unter Mehr > Geräte-Synchronisation kopierst du einen Tresor auf ein anderes Gerät, z. B. vom Handy aufs Tablet.\n1. Auf dem sendenden Gerät "Tresor senden" öffnen und den Tresor wählen. MyMeds zeigt einen 6-stelligen Code und einen QR-Code.\n2. Auf dem empfangenden Gerät "Tresor empfangen" öffnen und den Code eingeben oder den QR-Code scannen.\n3. Vorschau prüfen (Name, Anzahl Medikamente und Einträge) und den Tresor speichern. Gibt es schon einen Tresor mit gleichem Namen, wählst du "Bestehenden Tresor überschreiben" oder "Als neue Kopie speichern".\nDie Übertragung läuft über einen öffentlichen Relay-Server (MQTT). Er sieht nur den bereits verschlüsselten Tresor, nie dein Passwort oder Klartext. Auf dem neuen Gerät entsperrst du den Tresor mit seinem bisherigen Passwort.\nKlappt die Verbindung nicht (z. B. wegen einer Firewall), nutze auf dem Sender "Verschlüsselten Code kopieren (Offline-Fallback)" und füge den Code auf dem Empfänger ein.\nDer Sync kopiert einen kompletten Tresor einmalig. Er führt keine Änderungen zusammen, die zuletzt übertragene Fassung gilt.'
        },
        bmp: {
          title: 'Medikationsplan (BMP / DataMatrix)',
          content:
            'MyMeds liest und erzeugt den Bundeseinheitlichen Medikationsplan über seinen 2D-Code. Beide Funktionen findest du im Mehr-Tab.\n• Scannen: Halte den DataMatrix-Code des ausgedruckten Plans in den Kamerarahmen oder lade ein Foto hoch. Wähle die erkannten Medikamente aus und entscheide, ob sie zu den vorhandenen hinzukommen oder diese ersetzen.\n• Anzeigen: Wähle Medikamente aus und zeige sie als DataMatrix-Code für Arztpraxis oder Apotheke. Optional ergänzt du Vorname, Nachname und Geburtsdatum. Den Code kannst du als PNG speichern, teilen, im Vollbild zeigen oder als XML kopieren.'
        },
        exportImport: {
          title: 'Datensicherung & Import/Export',
          content:
            'Unter Mehr > Datenverwaltung exportierst du den offenen Tresor als JSON-Sicherungsdatei oder importierst ein bestehendes Backup. Die Sicherung ist unverschlüsselt, bewahre sie sicher auf.\nVor dem Import zeigt MyMeds Datum der Sicherung sowie Anzahl der Medikamente und Einträge. Ein Import überschreibt die aktuellen Daten des Tresors und braucht eine getippte Bestätigung.\nDort kannst du auch alle Medikamente und Einträge eines Tresors löschen.\n• Dauerhafter Speicher: Unter Einstellungen > Speicher & Persistenz beantragst du dauerhaften Speicher, damit der Browser deine Tresore bei Platzmangel nicht löscht. Installierte Apps erhalten diese Erlaubnis leichter.'
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
      referral: {
        needsReferral: 'Überweisung erforderlich',
        statusLabel: 'Überweisungsstatus',
        status: {
          needed: 'Zu besorgen',
          present: 'Liegt vor',
          submitted: 'Abgegeben'
        },
        banner: {
          message:
            'Für 1 anstehenden Arzttermin muss noch eine Überweisung besorgt werden. | Für {count} anstehende Arzttermine müssen noch Überweisungen besorgt werden.'
        },
        filter: 'Offene Überweisungen'
      },
      fields: {
        date: 'Datum',
        time: 'Uhrzeit',
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
      deleteEntryTitle: 'Kalendereintrag löschen',
      deleteEntryConfirm: 'Möchtest du diesen Kalendereintrag wirklich löschen?',
      deleteEntryConfirmNamed: 'Möchtest du den Eintrag „{name}“ wirklich löschen?',
      filter: 'Filtern',
      filterAll: 'Alle',
      filterBy: 'Gefiltert nach Typ: {types}',
      clearFilter: 'Filter löschen',
      showPendingReferrals: 'Anzeigen',
      deletedToast: '„{name}“ wurde gelöscht',
      restoredToast: '„{name}“ wiederhergestellt',
      addTreatmentTag: 'Tag hinzufügen',
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
      sendInstructions:
        'Öffne MyMeds auf dem Zielgerät, gehe auf „Tresor empfangen“ und scanne den QR-Code oder tippe den 6-stelligen Code ein.',
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
      previewDetails:
        'Name: {name}\nMedikamente: {medsCount}\nKalendereinträge: {calendarCount}\nZuletzt geändert: {modifiedAt}',
      conflictTitle: 'Tresor bereits vorhanden',
      conflictMessage:
        'Ein Tresor mit dem Namen „{name}“ existiert bereits auf diesem Gerät. Wie möchtest du vorgehen?',
      modeOverwrite: 'Bestehenden Tresor überschreiben',
      modeCopy: 'Als neue Kopie speichern',
      saveVault: 'Tresor speichern',
      importSuccess: 'Tresor „{name}“ wurde erfolgreich auf diesem Gerät gespeichert!',
      errorInvalidCode: 'Bitte gib einen gültigen 6-stelligen Code ein.',
      errorConnectionFailed:
        'Verbindung fehlgeschlagen. Bitte prüfe den Code, versuche es erneut oder nutze den verschlüsselten Code zum Kopieren.',
      errorTransfer: 'Fehler bei der Synchronisation: {error}',
      scanQrCode: 'QR-Code scannen',
      stopScanning: 'Kamera schließen',
      copyEncryptedText: 'Verschlüsselten Code kopieren (Offline-Fallback)',
      encryptedTextCopied: 'Verschlüsselter Code in die Zwischenablage kopiert!',
      orManualPaste: 'Oder verschlüsselten Code manuell einfügen',
      pasteInstructions:
        'Falls die Direktverbindung durch dein Netzwerk/Firewall blockiert wird, kannst du den Code hier einfügen:',
      pasteCodePlaceholder: 'Verschlüsselten Sync-Code hier einfügen...',
      importFromCode: 'Aus Code importieren'
    },
    updates: {
      check: 'Auf Updates prüfen',
      checking: 'Prüfe auf Updates...',
      upToDate: 'MyMeds ist auf dem neuesten Stand (v{version})',
      updateFound: 'Neues Update verfügbar! Wird heruntergeladen...',
      updateReady: 'Neues Update bereit! Jetzt neu laden.',
      reloadNow: 'Jetzt neu laden',
      offline: 'Offline: Update-Prüfung nicht möglich.',
      error: 'Fehler bei der Update-Prüfung.'
    },
    whatsNew: {
      title: 'Was gibt’s Neues in MyMeds?',
      versionBadge: 'Version {version}',
      releasedOn: 'Veröffentlicht am {date}',
      showPrevious: 'Ältere Versionen anzeigen',
      hidePrevious: 'Ältere Versionen verbergen',
      close: 'Verstanden'
    },
    biometrics: {
      title: 'Biometrisches Entsperren',
      unlockWith: 'Mit Biometrie entsperren',
      unlockPrompt: 'Bitte Fingerabdrucksensor berühren oder Face ID nutzen',
      rememberOnDevice: 'Auf diesem Gerät mit Biometrie merken',
      usePasswordInstead: 'Stattdessen Passwort eingeben',
      enrollSuccess: 'Biometrisches Entsperren auf diesem Gerät aktiviert.',
      disabled: 'Biometrie für diesen Tresor deaktiviert.',
      notSupported: 'Biometrie wird von diesem Browser/Gerät nicht unterstützt.',
      sessionRevoked: 'Biometrische Sitzung aufgehoben.',
      clearAllSessions: 'Alle biometrischen Kopplungen aufheben',
      clearAllSuccess: 'Alle biometrischen Kopplungen wurden gelöscht.',
      clearAllConfirm:
        'Möchtest du wirklich alle biometrischen Kopplungen auf diesem Gerät aufheben? Du musst Tresore danach wieder mit dem Passwort entsperren.',
      activeOnThisDevice: 'Biometrisches Entsperren auf diesem Gerät aktiv',
      error: 'Biometrische Authentifizierung fehlgeschlagen: {message}',
      cancelled: 'Biometrische Authentifizierung abgebrochen.'
    },
    reminders: {
      title: 'Tägliche Erinnerungen',
      enable: 'Tägliche Erinnerungen aktivieren',
      description: 'Erhalte neutrale Einnahme-Erinnerungen zu festen Uhrzeiten auf diesem Gerät.',
      permissionTitle: 'Benachrichtigungs-Berechtigung',
      permissionPrompt: 'Benachrichtigungen sind erforderlich, um Einnahme-Erinnerungen zu senden.',
      permissionDenied:
        'Benachrichtigungen sind im Browser oder System blockiert. Bitte erlaube Benachrichtigungen in den Android-App-Einstellungen.',
      permissionRequiredToast:
        'Benachrichtigungen sind nicht erlaubt. Bitte erlaube Benachrichtigungen für MyMeds in den Android-App-Einstellungen.',
      requestPermission: 'Benachrichtigungen erlauben',
      standardTimes: 'Standard-Zeiten',
      customTimes: 'Benutzerdefinierte Zeiten',
      morning: 'Morgens',
      noon: 'Mittags',
      evening: 'Abends',
      night: 'Zur Nacht',
      custom: 'Eigene Uhrzeit',
      addCustom: 'Weitere Uhrzeit hinzufügen',
      removeCustom: 'Uhrzeit entfernen',
      sendTest: 'Test-Benachrichtigung senden',
      testSent: 'Test-Benachrichtigung wurde gesendet!',
      notificationTitle: 'MyMeds',
      notificationBody: 'Erinnerung: Zeit für deine Medikamente.',
      batteryOptimizationTitle: 'Wichtig für Android- / Pixel-Nutzer',
      batteryOptimizationText:
        'Damit Erinnerungen im Hintergrund zuverlässig pünktlich ankommen, stelle in den Android-App-Einstellungen die Akkunutzung für MyMeds auf „Nicht eingeschränkt“ (App-Info -> Akkunutzung der App -> Nicht eingeschränkt).'
    },
    prescription: {
      open: 'Rezeptbedarf bis zu einem Datum',
      button: 'Rezepte',
      title: 'Rezeptbedarf',
      close: 'Schließen',
      intro:
        'Zeigt, wie viele Packungen du beim Arzt anfragen musst, damit jedes Medikament bis zum gewählten Datum reicht. Berechnet aus Bestand, Einnahmeschema und Packungsgröße. Auf ein Rezept passen höchstens 3 Medikamente.',
      lastUntil: 'Reichen bis',
      bufferDays: 'Puffer (Tage)',
      bufferInvalid: '0 bis 365 Tage',
      nextAppointments: 'Nächste Arzttermine',
      chooseDate: 'Wähle das Datum, bis zu dem deine Medikamente reichen sollen.',
      noneNeeded: 'Alle Medikamente reichen bis {date}. Kein Rezept nötig.',
      heading: 'Rezept {number}',
      packageOf: 'Packung à {size} St.',
      missingPackageSize: '{units} St. fehlen, Packungsgröße nicht hinterlegt',
      line: '{packages} x {name} ({size} St.)',
      lineNoPackage: '{name}: {units} St. (Packungsgröße nicht hinterlegt)',
      fewer: 'Eine Packung weniger {name}',
      more: 'Eine Packung mehr {name}',
      excluded: 'Nicht anfordern (antippen zum Hinzufügen)',
      copy: 'Kopieren',
      share: 'Teilen',
      copied: 'In die Zwischenablage kopiert',
      copyFailed: 'Kopieren fehlgeschlagen'
    },
    storage: {
      title: 'Speicher & Persistenz',
      persisted: 'Dauerhaft geschützt (Persistent)',
      notPersisted: 'Standard (Vom Browser verwaltet)',
      persistedDesc:
        'Deine verschlüsselten Tresore sind vor automatischer Löschung durch das Betriebssystem geschützt.',
      notPersistedDesc:
        'Bei knappem Gerätespeicher könnte der Browser Daten bereinigen. Fordere dauerhaften Schutz an.',
      requestPersist: 'Dauerhaften Schutz anfordern',
      usage: 'Belegter Speicher',
      persistSuccess: 'Dauerhafter Speicherplatz wurde erfolgreich aktiviert.',
      persistFailed:
        'Dauerhafter Speicher konnte nicht aktiviert werden. Installiere MyMeds auf dem Homescreen, um dies zu ermöglichen.'
    },
    a11y: {
      lockVault: 'Tresor sperren',
      selectColor: 'Farbe {color} wählen',
      switchCamera: 'Kamera wechseln',
      toggleFlashlight: 'Taschenlampe umschalten'
    }
  }
};
