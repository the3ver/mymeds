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
      noMeds: 'No meds added yet',
      displayMode: 'Display Mode',
      showPills: 'Show Pills',
      showDays: 'Show Days'
    },
    med: {
      name: 'Name',
      ingredient: 'Active Ingredient (optional)',
      count: 'Pill Count',
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
      delete: 'Delete'
    },
    welcome: {
      title: 'Welcome to MyMeds!',
      thankYou: 'Thank you for installing the app.',
      chooseLanguage: 'Please choose your language:',
      chooseTheme: 'Please choose your preferred theme:',
      light: 'Light',
      dark: 'Dark',
      getStarted: 'Get Started'
    },
    about: {
      title: 'About MyMeds',
      description: 'MyMeds is a simple application to help you track your medication inventory.',
      github: 'GitHub Repository',
      license: 'License',
      close: 'Close'
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
      noMeds: 'Noch keine Medikamente hinzugefügt',
      displayMode: 'Anzeigemodus',
      showPills: 'Tabletten anzeigen',
      showDays: 'Tage anzeigen'
    },
    med: {
      name: 'Name',
      ingredient: 'Wirkstoff (optional)',
      count: 'Anzahl Tabletten',
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
      delete: 'Löschen'
    },
    welcome: {
      title: 'Willkommen bei MyMeds!',
      thankYou: 'Danke, dass du die App installiert hast.',
      chooseLanguage: 'Bitte wähle deine Sprache:',
      chooseTheme: 'Bitte wähle dein bevorzugtes Design:',
      light: 'Hell',
      dark: 'Dunkel',
      getStarted: 'Loslegen'
    },
    about: {
      title: 'Über MyMeds',
      description: 'MyMeds ist eine einfache App, um deinen Medikamentenvorrat zu verwalten.',
      github: 'GitHub Repository',
      license: 'Lizenz',
      close: 'Schließen'
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