import { reactive, nextTick } from 'vue';

export const snackbarState = reactive({
  open: false,
  text: '',
  color: undefined,
  timeout: 4500,
  actionText: '',
  onAction: null
});

// Bumped on every show/dismiss so a delayed reopen from an older call is dropped
let generation = 0;

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
  // Close for one tick first: VSnackbar only restarts its timer when the model changes
  const current = ++generation;
  nextTick(() => {
    if (current === generation) snackbarState.open = true;
  });
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
  generation++;
  snackbarState.open = false;
  snackbarState.onAction = null;
}
