import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { collectUsedIcons, definedIcons } from '../../scripts/generate-icon-css.mjs';

const ROOT = join(__dirname, '../..');
const SRC = join(ROOT, 'src');

function sourceFiles(dir = SRC) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    return /\.(js|ts|vue)$/.test(entry.name) ? [path] : [];
  });
}

function findMatches(pattern) {
  return sourceFiles().flatMap((file) =>
    readFileSync(file, 'utf8')
      .split('\n')
      .map((line, i) => (pattern.test(line) ? `${relative(ROOT, file)}:${i + 1}` : null))
      .filter(Boolean)
  );
}

describe('source guards', () => {
  it('derives calendar dates from local time, not from toISOString (UTC shifts local midnight to the previous day)', () => {
    // Use getLocalDateString() from calendarUtils instead
    const matches = findMatches(/toISOString\(\)\s*\.\s*(split|slice|substring|substr)\(/);
    expect(matches).toEqual([]);
  });

  it('keeps the Android TWA version in step with package.json (release.sh syncs it)', () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
    const twa = JSON.parse(readFileSync(join(ROOT, 'twa-manifest.json'), 'utf8'));
    expect(twa.appVersionName).toBe(pkg.version);
  });

  it('has a rule in the icon subset for every mdi icon the app uses (run npm run icons)', () => {
    const defined = definedIcons();
    const missing = [...collectUsedIcons()].filter((icon) => !defined.has(icon)).sort();
    expect(missing).toEqual([]);
  });
});
