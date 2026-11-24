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

  it('uses only spacing utilities Vuetify defines (0-16, whole steps); others like pb-24 silently do nothing', () => {
    const matches = findMatches(/\bclass="[^"]*(?<![\w-])[mp][trblxyse]?-n?(1[7-9]|[2-9]\d|\d+\.\d+)(?![\w.])/);
    expect(matches).toEqual([]);
  });

  it('sizes custom text in rem (follows the UI scale) and not below 0.75rem (Vuetify text-caption)', () => {
    const cssFiles = readdirSync(SRC, { recursive: true })
      .filter((name) => String(name).endsWith('.css'))
      .map((name) => join(SRC, String(name)));
    const offenders = [...sourceFiles(), ...cssFiles].flatMap((file) =>
      readFileSync(file, 'utf8')
        .split('\n')
        .map((line, i) => {
          const m = line.match(/font-size:\s*([\d.]+)(px|rem|em)\b/);
          if (!m) return null;
          const tooSmall = m[2] === 'px' || parseFloat(m[1]) < 0.75;
          return tooSmall ? `${relative(ROOT, file)}:${i + 1} ${m[0]}` : null;
        })
        .filter(Boolean)
    );
    expect(offenders).toEqual([]);
  });

  it('keeps the Android TWA version in step with package.json (release.sh syncs it)', () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
    const twa = JSON.parse(readFileSync(join(ROOT, 'twa-manifest.json'), 'utf8'));
    expect(twa.appVersionName).toBe(pkg.version);
  });

  it('targets at least the minSdk the TWA library requires (androidbrowserhelper 2.7.4: 24)', () => {
    // A lower value fails the Android build in the manifest merger (v1.10.17)
    const twa = JSON.parse(readFileSync(join(ROOT, 'twa-manifest.json'), 'utf8'));
    expect(twa.minSdkVersion).toBeGreaterThanOrEqual(24);
  });

  it('has a rule in the icon subset for every mdi icon the app uses (run npm run icons)', () => {
    const defined = definedIcons();
    const missing = [...collectUsedIcons()].filter((icon) => !defined.has(icon)).sort();
    expect(missing).toEqual([]);
  });
});
