// Agent PostToolUse hook (Claude Code & Antigravity): formats the edited file with Prettier.
// Reads hook JSON from stdin (Claude: tool_input.file_path, Antigravity: toolCall.args.Path);
// prints `{}` on stdout for Antigravity, stays silent for Claude Code, and never blocks.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as prettier from 'prettier';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const FORMATTED = /\.(js|mjs|vue|ts)$/;

function readHookInput() {
  try {
    const raw = fs.readFileSync(0, 'utf8').trim();
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

async function formatFile(file) {
  if (!file || !FORMATTED.test(file)) return;

  const abs = path.resolve(ROOT, file);
  const rel = path.relative(ROOT, abs);
  if (rel.startsWith('..') || path.isAbsolute(rel) || !fs.existsSync(abs)) return;

  const info = await prettier.getFileInfo(abs, { ignorePath: path.join(ROOT, '.prettierignore') });
  if (info.ignored || !info.inferredParser) return;

  const source = fs.readFileSync(abs, 'utf8');
  const options = await prettier.resolveConfig(abs);
  const formatted = await prettier.format(source, { ...options, filepath: abs });
  if (formatted !== source) fs.writeFileSync(abs, formatted, 'utf8');
}

async function main() {
  const input = readHookInput();
  const isAgy = Boolean(input.hookEventName || input.toolCall);
  const file =
    input.tool_input?.file_path ||
    input.tool_input?.path ||
    input.toolCall?.args?.Path ||
    input.toolCall?.args?.TargetFile ||
    input.toolCall?.args?.path;

  try {
    await formatFile(file);
  } catch {
    // Syntax errors and the like surface in the stop-hook check; editing must not stall
  }

  if (isAgy) {
    process.stdout.write('{}\n');
  }
}

main();
