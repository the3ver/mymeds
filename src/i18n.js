import { createI18n } from 'vue-i18n'

const messages = {
  en: {
    app: {
      title: 'MyMeds',
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
      dataManagement: 'Data Management',
      deleteMeds: 'Delete Medications',
      deleteMedsConfirm: 'Are you sure you want to delete all medications? This cannot be undone.',
      deleteCalendar: 'Delete Calendar Entries',
      deleteCalendarConfirm: 'Are you sure you want to delete all calendar entries? This cannot be undone.',
      deleteAll: 'Delete All Data',
      deleteAllConfirm: 'Are you sure you want to delete ALL data (medications, calendar, settings)? This cannot be undone.'
    },
    med: {
      name: 'Name',
      ingredient: 'Active Ingredient (optional)',
      count: 'Pill Count',
      packageSize: 'Package Size',
      packageSizeOptional: 'Package Size (optional)',
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
      no: 'No'
    },
    welcome: {
      title: 'Welcome to MyMeds!',
      thankYou: 'Thank you for installing the app.',
      explanation: 'MyMeds automatically deducts the daily dose from your inventory every day to warn you when supplies are running low.',
      chooseLanguage: 'Please choose your language:',
      chooseTheme: 'Please choose your preferred theme:',
      light: 'Light',
      dark: 'Dark',
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
      intro: 'Welcome to the MyMeds User Manual. Here you can find information on how to use the app.',
      sections: {
        basics: {
          title: 'Basics',
          content: 'MyMeds helps you keep track of your medication stock. The app works offline and saves all data locally on your device.'
        },
        adding: {
          title: 'Adding Medications',
          content: 'Click the "Add Medication" card at the bottom of the list to add a new medication. Enter the name, current stock, and your daily dose.'
        },
        dose: {
          title: 'Daily Dose',
          content: 'You can enter the daily dose as a single number (e.g. "1") or as a schedule (Morning-Noon-Evening-Night, e.g. "1-0-1-0"). The app automatically calculates the total daily consumption.'
        },
        tracking: {
          title: 'Automatic Tracking',
          content: 'Every day you open the app, the daily dose is automatically deducted from the stock. You don\'t need to do anything manually.'
        },
        warnings: {
          title: 'Warnings',
          content: 'The app warns you when your stock is running low. You can customize the warning limits (yellow and red) in the settings.'
        },
        calendar: {
          title: 'Calendar',
          content: 'The calendar allows you to track doctor appointments, vaccinations, illnesses, and notes. You can add entries by clicking the "Add" button below the "Today" separator. Entries are sorted chronologically.'
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
        doctor: 'Doctor (optional)',
        type: 'Type (optional)',
        location: 'Location (optional)',
        notes: 'Notes (optional)',
        agent: 'Agent (optional)',
        method: 'Method (optional)',
        bodyPart: 'Body Part (optional)',
        pathogen: 'Pathogen (optional)',
        symptoms: 'Symptoms (optional)',
        endDate: 'End Date (optional)',
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
        intramuscular: 'Intramuscular',
        oral: 'Oral',
        rectal: 'Rectal',
        other: 'Other'
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
      clearFilter: 'Clear Filter'
    }
  },
  de: {
    app: {
      title: 'MyMeds',
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
      dataManagement: 'Datenverwaltung',
      deleteMeds: 'Medikamente löschen',
      deleteMedsConfirm: 'Möchtest du wirklich alle Medikamente löschen? Dies kann nicht rückgängig gemacht werden.',
      deleteCalendar: 'Kalendereinträge löschen',
      deleteCalendarConfirm: 'Möchtest du wirklich alle Kalendereinträge löschen? Dies kann nicht rückgängig gemacht werden.',
      deleteAll: 'Alle Daten löschen',
      deleteAllConfirm: 'Möchtest du wirklich ALLE Daten (Medikamente, Kalender, Einstellungen) löschen? Dies kann nicht rückgängig gemacht werden.'
    },
    med: {
      name: 'Name',
      ingredient: 'Wirkstoff (optional)',
      count: 'Anzahl Tabletten',
      packageSize: 'Packungsgröße',
      packageSizeOptional: 'Packungsgröße (optional)',
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
      no: 'Nein'
    },
    welcome: {
      title: 'Willkommen bei MyMeds!',
      thankYou: 'Danke, dass du die App installiert hast.',
      explanation: 'MyMeds zieht jeden Tag automatisch die Tagesdosis von deinem Bestand ab, um dich rechtzeitig zu warnen, wenn der Vorrat knapp wird.',
      chooseLanguage: 'Bitte wähle deine Sprache:',
      chooseTheme: 'Bitte wähle dein bevorzugtes Design:',
      light: 'Hell',
      dark: 'Dunkel',
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
      intro: 'Willkommen im MyMeds Benutzerhandbuch. Hier findest du Informationen zur Bedienung der App.',
      sections: {
        basics: {
          title: 'Grundlagen',
          content: 'MyMeds hilft dir, deinen Medikamentenvorrat im Blick zu behalten. Die App funktioniert offline und speichert alle Daten lokal auf deinem Gerät.'
        },
        adding: {
          title: 'Medikamente hinzufügen',
          content: 'Klicke auf die "Medikament hinzufügen" Karte am Ende der Liste, um ein neues Medikament hinzuzufügen. Gib den Namen, den aktuellen Bestand und deine Tagesdosis ein.'
        },
        dose: {
          title: 'Tagesdosis',
          content: 'Du kannst die Tagesdosis als einzelne Zahl (z.B. "1") oder als Einnahmeplan (Morgens-Mittags-Abends-Nachts, z.B. "1-0-1-0") eingeben. Die App berechnet automatisch den täglichen Gesamtverbrauch.'
        },
        tracking: {
          title: 'Automatische Verfolgung',
          content: 'Jeden Tag, an dem du die App öffnest, wird automatisch die Tagesdosis vom Bestand abgezogen. Du musst nichts manuell austragen.'
        },
        warnings: {
          title: 'Warnungen',
          content: 'Die App warnt dich, wenn dein Vorrat zur Neige geht. Die Warngrenzen (gelb und rot) kannst du in den Einstellungen anpassen.'
        },
        calendar: {
          title: 'Kalender',
          content: 'Der Kalender ermöglicht es dir, Arzttermine, Impfungen, Erkrankungen und Notizen zu erfassen. Du kannst Einträge hinzufügen, indem du auf den "Hinzufügen"-Button unter dem "Heute"-Trenner klickst. Die Einträge werden chronologisch sortiert.'
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
        doctor: 'Arzt (optional)',
        type: 'Art (optional)',
        location: 'Ort (optional)',
        notes: 'Notizen (optional)',
        agent: 'Wirkstoff (optional)',
        method: 'Methode (optional)',
        bodyPart: 'Körperstelle (optional)',
        pathogen: 'Erreger (optional)',
        symptoms: 'Symptome (optional)',
        endDate: 'Enddatum (optional)',
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
      clearFilter: 'Filter löschen'
    }
  }
}

// Determine default locale based on browser settings or saved preference
const savedLocale = localStorage.getItem('myMedsLocale')
const defaultLocale = savedLocale || (navigator.language.startsWith('de') ? 'de' : 'en')

export default createI18n({
  legacy: false, // Use Composition API
  locale: defaultLocale,
  fallbackLocale: 'en',
  messages
})