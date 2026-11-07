#!/usr/bin/env bash
# Quiet project check for agents, git hooks and CI.
# Green: one line. Red: only the failing output, exit 1.
#   bash scripts/check.sh          run type check + tests
#   bash scripts/check.sh --hook   Claude Code Stop hook: red -> stderr, exit 2
# Unchanged inputs since the last green run return immediately.
set -u
cd "$(dirname "$0")/.."

MODE="${1:-}"
CACHE_DIR="node_modules/.cache/mymeds-check"
mkdir -p "$CACHE_DIR"
OUT="$CACHE_DIR/last.out"

HOOK_INPUT=""
if [ "$MODE" = "--hook" ]; then
  HOOK_INPUT="$(cat)"
fi

fingerprint() {
  {
    git rev-parse HEAD
    git diff HEAD -- src tests scripts package.json package-lock.json vitest.config.js tsconfig.json vite.config.js twa-manifest.json
    git ls-files --others --exclude-standard -- src tests scripts | while read -r f; do echo "$f"; cat "$f"; done
  } | git hash-object --stdin
}

FP="$(fingerprint)"
if [ -f "$CACHE_DIR/green" ] && [ "$(cat "$CACHE_DIR/green")" = "$FP" ]; then
  [ "$MODE" = "--hook" ] || echo "CHECK OK (unchanged)"
  exit 0
fi

# Stop hook: the agent already got this exact red state back once; let it stop
if [ "$MODE" = "--hook" ] && echo "$HOOK_INPUT" | grep -q '"stop_hook_active":[[:space:]]*true' \
   && [ -f "$CACHE_DIR/red" ] && [ "$(cat "$CACHE_DIR/red")" = "$FP" ]; then
  exit 0
fi

REPORT="$CACHE_DIR/report.out"

# $1 = failed step; report text is read from $REPORT (no pipe: exit must end this shell)
fail() {
  echo "$FP" > "$CACHE_DIR/red"
  rm -f "$CACHE_DIR/green"
  if [ "$MODE" = "--hook" ]; then
    { echo "CHECK FAILED ($1). Fix before finishing:"; cat "$REPORT"; } >&2
    exit 2
  fi
  echo "CHECK FAILED ($1)"
  cat "$REPORT"
  exit 1
}

strip_ansi() { sed -E 's/\x1b\[[0-9;]*m//g' "$1"; }

START=$SECONDS

if ! npx tsc --noEmit -p . > "$OUT" 2>&1; then
  strip_ansi "$OUT" | grep -E "error TS" | head -40 > "$REPORT"
  fail "tsc"
fi

# --silent drops console output of passing tests; show from the failure summary on
if ! npx vitest run --reporter=dot --bail=1 --silent > "$OUT" 2>&1; then
  strip_ansi "$OUT" | sed -n '/Failed Tests\|FAIL \|Error:/,$p' \
    | grep -vE "^Not implemented: HTMLCanvasElement|node_modules/|^\s*$" | head -60 > "$REPORT"
  [ -s "$REPORT" ] || strip_ansi "$OUT" | tail -40 > "$REPORT"
  fail "tests"
fi

TESTS="$(strip_ansi "$OUT" | grep -oE "Tests +[0-9]+ passed" | grep -oE "[0-9]+")"
echo "$FP" > "$CACHE_DIR/green"
[ "$MODE" = "--hook" ] || echo "CHECK OK: tsc, ${TESTS:-?} tests, $((SECONDS - START))s"
exit 0
