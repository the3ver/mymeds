import 'vuetify/styles';
import { createVuetify } from 'vuetify';
import { md3 } from 'vuetify/blueprints';

export const myMedsLightTheme = {
  dark: false,
  colors: {
    background: '#F6FAF8',
    surface: '#FFFFFF',
    'surface-bright': '#FFFFFF',
    'surface-light': '#EFF5F2',
    'surface-variant': '#E3EAE6',
    'on-surface-variant': '#3F4946',
    primary: '#006A60',
    'primary-darken-1': '#005048',
    secondary: '#4A635F',
    'secondary-darken-1': '#334B47',
    tertiary: '#426277',
    accent: '#006A60',
    error: '#BA1A1A',
    info: '#006684',
    success: '#1B6D3B',
    warning: '#9A5B00',
    'on-background': '#171D1B',
    'on-surface': '#171D1B',
    'on-primary': '#FFFFFF',
    'on-secondary': '#FFFFFF'
  },
  variables: {
    'border-color': '#BFC9C5',
    'border-opacity': 0.72,
    'high-emphasis-opacity': 0.92,
    'medium-emphasis-opacity': 0.68
  }
};

export const myMedsDarkTheme = {
  dark: true,
  colors: {
    background: '#0E1513',
    surface: '#1A2220',
    'surface-bright': '#252C2A',
    'surface-light': '#161D1B',
    'surface-variant': '#252C2A',
    'on-surface-variant': '#BFC9C5',
    primary: '#80D5C8',
    'primary-darken-1': '#5BC0B2',
    secondary: '#B1CCC6',
    'secondary-darken-1': '#8DAEA8',
    tertiary: '#AACBE3',
    accent: '#80D5C8',
    error: '#FFB4AB',
    info: '#7CD0FF',
    success: '#8AD9A3',
    warning: '#FFB870',
    'on-background': '#DEE4E1',
    'on-surface': '#DEE4E1',
    'on-primary': '#003731',
    'on-secondary': '#1C3531'
  },
  variables: {
    'border-color': '#3F4946',
    'border-opacity': 0.85,
    'high-emphasis-opacity': 0.94,
    'medium-emphasis-opacity': 0.72
  }
};

export function createAppVuetify(defaultTheme = 'light') {
  return createVuetify({
    blueprint: md3,
    theme: {
      defaultTheme: defaultTheme || 'light',
      themes: {
        light: myMedsLightTheme,
        dark: myMedsDarkTheme
      }
    },
    defaults: {
      VCard: {
        rounded: 'xl',
        elevation: 0
      },
      VBtn: {
        rounded: 'pill'
      },
      VChip: {
        rounded: 'pill'
      },
      VTextField: {
        variant: 'outlined',
        density: 'comfortable'
      },
      VSelect: {
        variant: 'outlined',
        density: 'comfortable'
      },
      VTextarea: {
        variant: 'outlined',
        density: 'comfortable'
      }
    }
  });
}
