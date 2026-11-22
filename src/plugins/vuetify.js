import 'vuetify/styles';
import { createVuetify } from 'vuetify';

export function createAppVuetify(defaultTheme = 'light') {
  return createVuetify({
    theme: {
      defaultTheme
    }
  });
}
