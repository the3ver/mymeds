/**
 * Root font size per UI scale. All rem-based sizes (Vuetify typography,
 * custom CSS) scale with it.
 */
export const UI_SCALE_FONT_SIZES = {
  small: '15.5px',
  normal: '17.5px',
  large: '20px'
};

export const applyUiScale = (scale, root = document.documentElement) => {
  root.style.fontSize = UI_SCALE_FONT_SIZES[scale] || UI_SCALE_FONT_SIZES.normal;
};
