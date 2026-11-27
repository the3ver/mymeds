import { describe, it, expect } from 'vitest';
import { applyUiScale } from '../../src/modules/common/utils/uiScale';

describe('applyUiScale', () => {
  it.each([
    ['small', '17px'],
    ['normal', '19.25px'],
    ['large', '22px'],
    [undefined, '19.25px'],
    ['bogus', '19.25px']
  ])('sets root font size for %s to %s', (scale, expected) => {
    const root = document.createElement('html');
    applyUiScale(scale, root);
    expect(root.style.fontSize).toBe(expected);
  });

  it('defaults to document.documentElement', () => {
    applyUiScale('large');
    expect(document.documentElement.style.fontSize).toBe('22px');
    document.documentElement.style.fontSize = '';
  });
});
