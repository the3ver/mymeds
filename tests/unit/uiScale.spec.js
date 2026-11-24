import { describe, it, expect } from 'vitest';
import { applyUiScale } from '../../src/modules/common/utils/uiScale';

describe('applyUiScale', () => {
  it.each([
    ['small', '15.5px'],
    ['normal', '17.5px'],
    ['large', '20px'],
    [undefined, '17.5px'],
    ['bogus', '17.5px']
  ])('sets root font size for %s to %s', (scale, expected) => {
    const root = document.createElement('html');
    applyUiScale(scale, root);
    expect(root.style.fontSize).toBe(expected);
  });

  it('defaults to document.documentElement', () => {
    applyUiScale('large');
    expect(document.documentElement.style.fontSize).toBe('20px');
    document.documentElement.style.fontSize = '';
  });
});
