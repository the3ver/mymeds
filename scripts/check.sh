#!/usr/bin/env bash
# Thin wrapper for callers (Claude Code, CI, Git hooks) invoking scripts/check.sh.
# The cross-platform implementation lives in scripts/check.mjs.
exec node "$(dirname "$0")/check.mjs" "$@"
