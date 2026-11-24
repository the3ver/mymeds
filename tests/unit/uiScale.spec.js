import { describe, it, expect } from 'vitest';
import { applyUiScale } from '../../src/modules/common/utils/uiScale';

describe('applyUiScale', () => {
  it.each([
    ['small', '14px'],
    ['normal', '16px'],
    ['large', '18px'],
    [undefined, '16px'],
    ['bogus', '16px']
  ])('sets root font size for %s to %s', (scale, expected) => {
    const root = document.createElement('html');
    applyUiScale(scale, root);
    expect(root.style.fontSize).toBe(expected);
  });

  it('defaults to document.documentElement', () => {
    applyUiScale('large');
    expect(document.documentElement.style.fontSize).toBe('18px');
    document.documentElement.style.fontSize = '';
  });
});
