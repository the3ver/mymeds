# Antigravity-Specific Guidelines (MyMeds)

This file is read only by **Antigravity (AGY)**. Project-wide architecture, rules, and commands live in `AGENTS.md` (shared with Claude Code) — put shared conventions there, not here.

## Antigravity-Only Capabilities
- **Visual UI / PWA Checks:** Use the built-in `browser` subagent to inspect live UI behavior against `npm run dev` / `npm run preview` instead of relying on external MCP browser bridges.
- **Artifacts:** Use markdown artifacts (implementation plans, walkthroughs, Mermaid diagrams) for multi-step refactors or architecture proposals.
- **Hooks (`.agents/hooks.json`):**
  - `PreToolUse` (`scripts/guard-sensitive-paths.mjs`) enforces the same `Read(...)` deny policy as `.claude/settings.json`.
  - `PostToolUse` (`scripts/format-edited.mjs`) auto-formats edited `.js/.mjs/.vue/.ts` files with Prettier.
  - `Stop` (`scripts/check.mjs --agy-hook`) runs Prettier, ESLint, `tsc`, and Vitest before completing a turn.
- **Conditional Rules:** `.agents/rules/` wraps the shared guidelines in `docs/agents/crypto-and-data.md` and `docs/agents/vue-and-ui.md` with `trigger: model_decision`.
- **AGY-Only Skills:** Place Antigravity-specific skills under `.agents/skills/` (or wire shared skills via `.agents/skills.json`).
