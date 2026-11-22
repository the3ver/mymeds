import { describe, it, expect, beforeEach } from 'vitest';
import { nextTick } from 'vue';
import {
  snackbarState,
  showSnackbar,
  triggerSnackbarAction,
  dismissSnackbar
} from '../../src/modules/common/utils/snackbarService';

describe('snackbarService', () => {
  beforeEach(async () => {
    dismissSnackbar();
    await nextTick();
  });

  it('closes an open toast for one tick before showing the next, so VSnackbar restarts its timer', async () => {
    showSnackbar({ text: 'A deleted' });
    await nextTick();
    expect(snackbarState.open).toBe(true);

    const seen = [];
    showSnackbar({ text: 'B deleted' });
    seen.push(snackbarState.open);
    await nextTick();
    seen.push(snackbarState.open);

    expect(seen).toEqual([false, true]);
    expect(snackbarState.text).toBe('B deleted');
  });

  it('shows the follow-up toast an action triggers', async () => {
    showSnackbar({
      text: 'deleted',
      actionText: 'Undo',
      onAction: () => showSnackbar({ text: 'restored' })
    });
    await nextTick();

    triggerSnackbarAction();
    await nextTick();

    expect(snackbarState.open).toBe(true);
    expect(snackbarState.text).toBe('restored');
  });

  it('does not reopen a toast that was dismissed before its tick', async () => {
    showSnackbar({ text: 'A' });
    dismissSnackbar();
    await nextTick();

    expect(snackbarState.open).toBe(false);
  });
});
