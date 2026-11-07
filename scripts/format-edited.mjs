// Agent PostToolUse hook: formats the file the agent just edited with Prettier.
// Reads the hook JSON from stdin ({ tool_input: { file_path } }); silent, never blocks.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as prettier from 'prettier';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const FORMATTED = /\.(js|mjs|vue|ts)$/;

async function main() {
  const input = JSON.parse(fs.readFileSync(0, 'utf8') || '{}');
  const file = input.tool_input?.file_path || input.tool_input?.path;
  if (!file || !FORMATTED.test(file)) return;

  const abs = path.resolve(ROOT, file);
  const rel = path.relative(ROOT, abs);
  if (rel.startsWith('..') || !fs.existsSync(abs)) return;

  const info = await prettier.getFileInfo(abs, { ignorePath: path.join(ROOT, '.prettierignore') });
  if (info.ignored || !info.inferredParser) return;

  const source = fs.readFileSync(abs, 'utf8');
  const options = await prettier.resolveConfig(abs);
  const formatted = await prettier.format(source, { ...options, filepath: abs });
  if (formatted !== source) fs.writeFileSync(abs, formatted, 'utf8');
}

main().catch(() => {
  // Syntax errors and the like surface in the stop-hook check; editing must not stall
});
