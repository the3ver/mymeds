/**
 * Root font size per UI scale. All rem-based sizes (Vuetify typography,
 * custom CSS) scale with it.
 */
export const UI_SCALE_FONT_SIZES = {
  small: '17px',
  normal: '19.25px',
  large: '22px'
};

export const applyUiScale = (scale, root = document.documentElement) => {
  root.style.fontSize = UI_SCALE_FONT_SIZES[scale] || UI_SCALE_FONT_SIZES.normal;
};
