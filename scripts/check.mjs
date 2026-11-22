// Quiet project check for agents, git hooks, and CI (cross-platform Node.js).
// Green: one line. Red: only the failing output, exit 1.
//   node scripts/check.mjs            run prettier --check + eslint + tsc + tests
//   node scripts/check.mjs --hook     Claude Code Stop hook: red -> stderr, exit 2
//   node scripts/check.mjs --agy-hook Antigravity Stop hook: JSON on stdout, exit 0
// Unchanged inputs since the last green run return immediately.
import { spawnSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const CACHE_DIR = path.join(ROOT, 'node_modules', '.cache', 'mymeds-check');
const GREEN_FILE = path.join(CACHE_DIR, 'green');
const RED_FILE = path.join(CACHE_DIR, 'red');
const LAST_OUT = path.join(CACHE_DIR, 'last.out');
const REPORT_OUT = path.join(CACHE_DIR, 'report.out');
const INPUTS = ['.', ':!*.md', ':!docs'];
const IS_WIN = process.platform === 'win32';
const ANSI_RE = new RegExp(`${String.fromCharCode(27)}\\[[0-9;]*m`, 'g');

function stripAnsi(text) {
  return text.replace(ANSI_RE, '');
}

function readStdin() {
  try {
    return fs.readFileSync(0, 'utf8');
  } catch {
    return '';
  }
}

function readFileSafe(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8').trim();
  } catch {
    return null;
  }
}

function computeFingerprint() {
  const hash = crypto.createHash('sha256');
  const head = spawnSync('git', ['rev-parse', 'HEAD'], { cwd: ROOT, encoding: 'utf8' });
  if (head.stdout) hash.update(head.stdout);

  const diff = spawnSync('git', ['diff', 'HEAD', '--', ...INPUTS], { cwd: ROOT, maxBuffer: 50 * 1024 * 1024 });
  if (diff.stdout) hash.update(diff.stdout);

  const untracked = spawnSync('git', ['ls-files', '--others', '--exclude-standard', '--', ...INPUTS], {
    cwd: ROOT,
    encoding: 'utf8'
  });
  if (untracked.stdout) {
    for (const rel of untracked.stdout.split(/\r?\n/).filter(Boolean)) {
      hash.update(`${rel}\n`);
      const abs = path.join(ROOT, rel);
      try {
        hash.update(fs.readFileSync(abs));
      } catch {
        // Ignore vanished files
      }
    }
  }
  return hash.digest('hex');
}

function runTool(cmd, args) {
  const res = spawnSync(cmd, args, {
    cwd: ROOT,
    shell: IS_WIN,
    encoding: 'utf8',
    maxBuffer: 50 * 1024 * 1024
  });
  const combined = `${res.stdout || ''}${res.stderr || ''}`;
  fs.writeFileSync(LAST_OUT, combined, 'utf8');
  return { ok: res.status === 0, output: stripAnsi(combined) };
}

function main() {
  const mode = process.argv[2] || '';
  const isClaudeHook = mode === '--hook';
  const isAgyHook = mode === '--agy-hook';
  const isHook = isClaudeHook || isAgyHook;

  fs.mkdirSync(CACHE_DIR, { recursive: true });

  // Drain stdin so the agent does not block on a full pipe; in Antigravity mode also inspect
  // terminationReason / executionNum to avoid forcing continuation after cancel/error or loops.
  if (isClaudeHook) {
    readStdin();
  } else if (isAgyHook) {
    let data = {};
    try {
      const raw = readStdin().trim();
      if (raw) data = JSON.parse(raw);
    } catch {
      // Malformed hook input should not break the check
    }
    const reason = data.terminationReason;
    const execNum = Number(data.executionNum || 0);
    if ((reason && reason !== 'NO_TOOL_CALL') || execNum >= 3) {
      process.stdout.write('{}\n');
      process.exit(0);
    }
  }

  const fp = computeFingerprint();

  if (readFileSafe(GREEN_FILE) === fp) {
    if (isAgyHook) process.stdout.write('{}\n');
    else if (!isHook) process.stdout.write('CHECK OK (unchanged)\n');
    process.exit(0);
  }

  // Stop hook: this exact red state was already reported once and the agent changed
  // nothing since; let it stop instead of looping (works for every agent)
  if (isHook && readFileSafe(RED_FILE) === fp) {
    if (isAgyHook) process.stdout.write('{}\n');
    process.exit(0);
  }

  function fail(step, reportText) {
    const report = reportText.trim();
    fs.writeFileSync(RED_FILE, `${fp}\n`, 'utf8');
    fs.rmSync(GREEN_FILE, { force: true });
    fs.writeFileSync(REPORT_OUT, `${report}\n`, 'utf8');

    if (isClaudeHook) {
      process.stderr.write(`CHECK FAILED (${step}). Fix before finishing:\n${report}\n`);
      process.exit(2);
    }
    if (isAgyHook) {
      process.stdout.write(
        `${JSON.stringify({
          decision: 'continue',
          reason: `CHECK FAILED (${step}). Fix before finishing:\n${report}`
        })}\n`
      );
      process.exit(0);
    }
    process.stdout.write(`CHECK FAILED (${step})\n${report}\n`);
    process.exit(1);
  }

  const startMs = Date.now();

  const fmt = runTool('npm', ['run', '-s', 'fmt:check']);
  if (!fmt.ok) {
    const lines = fmt.output
      .split(/\r?\n/)
      .filter((l) => !/^\s*$|Code style issues/.test(l))
      .slice(0, 20);
    fail('prettier', `Unformatted files (fix: npm run fmt):\n${lines.join('\n')}`);
  }

  const lint = runTool('npx', ['eslint', '.', '--max-warnings', '0']);
  if (!lint.ok) {
    const lines = lint.output
      .split(/\r?\n/)
      .filter((l) => !/^\s*$|problems? \(/.test(l))
      .slice(0, 40);
    fail('eslint', lines.join('\n'));
  }

  const tsc1 = runTool('npx', ['tsc', '--noEmit', '-p', '.']);
  const tsc2 = tsc1.ok ? runTool('npx', ['tsc', '-p', 'tsconfig.checkjs.json']) : { ok: false, output: '' };
  if (!tsc1.ok || !tsc2.ok) {
    const combined = `${tsc1.output}\n${tsc2.output}`;
    const lines = combined
      .split(/\r?\n/)
      .filter((l) => /error TS/.test(l))
      .slice(0, 40);
    fail('tsc', lines.length > 0 ? lines.join('\n') : combined.trim().split(/\r?\n/).slice(-40).join('\n'));
  }

  const tests = runTool('npx', ['vitest', 'run', '--reporter=dot', '--bail=1', '--silent']);
  if (!tests.ok) {
    const allLines = tests.output.split(/\r?\n/);
    const startIdx = allLines.findIndex((l) => /Failed Tests|FAIL |Error:/.test(l));
    const filtered = (startIdx >= 0 ? allLines.slice(startIdx) : [])
      .filter((l) => !/^Not implemented: HTMLCanvasElement|node_modules\/|^\s*$/.test(l))
      .slice(0, 60);
    const report = filtered.length > 0 ? filtered.join('\n') : allLines.slice(-40).join('\n');
    fail('tests', report);
  }

  const match = /Tests\s+(\d+)\s+passed/.exec(tests.output);
  const count = match ? match[1] : '?';
  const elapsedSec = Math.floor((Date.now() - startMs) / 1000);
  fs.writeFileSync(GREEN_FILE, `${fp}\n`, 'utf8');

  if (isAgyHook) {
    process.stdout.write('{}\n');
  } else if (!isHook) {
    process.stdout.write(`CHECK OK: prettier, eslint, tsc, ${count} tests, ${elapsedSec}s\n`);
  }
  process.exit(0);
}

main();
