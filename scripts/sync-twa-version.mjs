// Sets the Android TWA version (twa-manifest.json) to the package.json version.
// appVersionCode grows by one whenever appVersionName changes, so every tagged
// APK build gets a new Play Store version code. Called by release.sh.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const TWA = path.join(ROOT, 'twa-manifest.json');

const { version } = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
const raw = fs.readFileSync(TWA, 'utf8');
const twa = JSON.parse(raw);

if (twa.appVersionName === version) {
  console.log(`twa-manifest.json already at ${version} (code ${twa.appVersionCode})`);
} else {
  twa.appVersionName = version;
  twa.appVersionCode += 1;
  const eol = raw.includes('\r\n') ? '\r\n' : '\n';
  fs.writeFileSync(TWA, JSON.stringify(twa, null, 2).replace(/\n/g, eol) + eol, 'utf8');
  console.log(`twa-manifest.json set to ${version} (code ${twa.appVersionCode})`);
}
