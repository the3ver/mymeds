import { reactive } from 'vue';

export const snackbarState = reactive({
  open: false,
  text: '',
  color: undefined,
  timeout: 4500,
  actionText: '',
  onAction: null
});

/**
 * Show a global Material 3 snackbar, optionally with an Undo or secondary action button.
 * @param {object} options
 * @param {string} options.text
 * @param {string} [options.color]
 * @param {number} [options.timeout]
 * @param {string} [options.actionText]
 * @param {Function | null} [options.onAction]
 */
export function showSnackbar({ text, color = undefined, timeout = 4500, actionText = '', onAction = null }) {
  snackbarState.open = false;
  snackbarState.text = text;
  snackbarState.color = color;
  snackbarState.timeout = timeout;
  snackbarState.actionText = actionText;
  snackbarState.onAction = onAction;
  snackbarState.open = true;
}

export function triggerSnackbarAction() {
  const fn = snackbarState.onAction;
  snackbarState.open = false;
  snackbarState.onAction = null;
  if (typeof fn === 'function') {
    fn();
  }
}

export function dismissSnackbar() {
  snackbarState.open = false;
  snackbarState.onAction = null;
}
