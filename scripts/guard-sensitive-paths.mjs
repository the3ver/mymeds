// Antigravity PreToolUse hook: enforces the same Read(...) deny rules as .claude/settings.json.
// Reads .claude/settings.json as the single source of truth so sensitive files (pat.txt, keystores,
// .env*, build outputs) stay blocked in both Claude Code and Antigravity.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const FALLBACK_PATTERNS = ['./pat.txt', './*.keystore', './*.jks', './.env*'];

function readHookInput() {
  try {
    const raw = fs.readFileSync(0, 'utf8').trim();
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function loadDenyPatterns() {
  try {
    const settingsPath = path.join(ROOT, '.claude', 'settings.json');
    const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
    const rules = settings?.permissions?.deny;
    if (!Array.isArray(rules)) return FALLBACK_PATTERNS;

    const patterns = [];
    for (const rule of rules) {
      if (typeof rule !== 'string') continue;
      const match = /^Read\((.+)\)$/.exec(rule.trim());
      if (match) patterns.push(match[1]);
    }
    return patterns.length > 0 ? patterns : FALLBACK_PATTERNS;
  } catch {
    return FALLBACK_PATTERNS;
  }
}

function globToRegExp(pattern) {
  const normalized = pattern.replace(/\\/g, '/').replace(/^\.\//, '');
  let regex = '^';
  for (let i = 0; i < normalized.length; i++) {
    const ch = normalized[i];
    if (ch === '*') {
      if (normalized[i + 1] === '*') {
        if (normalized[i + 2] === '/') {
          regex += '(?:.*/)?';
          i += 2;
        } else {
          regex += '.*';
          i += 1;
        }
      } else {
        regex += '[^/]*';
      }
    } else if (ch === '?') {
      regex += '[^/]';
    } else if (/[.+^${}()|[\]\\]/.test(ch)) {
      regex += `\\${ch}`;
    } else {
      regex += ch;
    }
  }
  regex += '$';
  return new RegExp(regex, process.platform === 'win32' ? 'i' : '');
}

function main() {
  const input = readHookInput();
  const target = input.toolCall?.args?.Path || input.toolCall?.args?.TargetFile || input.toolCall?.args?.path;

  if (!target || typeof target !== 'string') {
    process.stdout.write('{"decision":"allow"}\n');
    return;
  }

  const abs = path.resolve(ROOT, target);
  const rel = path.relative(ROOT, abs).replace(/\\/g, '/');

  if (!rel.startsWith('..') && !path.isAbsolute(rel)) {
    const patterns = loadDenyPatterns();
    for (const pattern of patterns) {
      if (globToRegExp(pattern).test(rel)) {
        process.stdout.write(
          `${JSON.stringify({
            decision: 'deny',
            reason: `Access to "${rel}" is blocked by repository policy (.claude/settings.json).`
          })}\n`
        );
        return;
      }
    }
  }

  process.stdout.write('{"decision":"allow"}\n');
}

main();
