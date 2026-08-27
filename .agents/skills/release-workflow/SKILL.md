---
name: release-workflow
description: Step-by-step workflow for creating version bumps, tagging, and triggering GitHub Pages deployment for MyMeds.
---

# MyMeds Release Workflow

Follow these steps when creating a new release of MyMeds:

## Pre-Release Checks
1. Ensure the working tree is clean (`git status`).
2. Run test suite to verify everything passes:
   ```bash
   cmd /c npm test -- --run
   ```
3. Build the PWA locally to verify bundling succeeds:
   ```bash
   npm run build
   ```

## Release Script (`release.sh`)
Execute the release script with bash:
- **Patch release (default):**
  ```bash
  bash release.sh
  ```
- **Minor release:**
  ```bash
  bash release.sh -minor
  ```
- **Major release:**
  ```bash
  bash release.sh -major
  ```

## What Happens During Release:
1. `package.json` version is incremented without creating a git commit yet.
2. `npm install` synchronizes `package-lock.json`.
3. Changes to `package.json` and `package-lock.json` are staged.
4. Git commit and tag `vX.X.X` are created.
5. Commit and tags are pushed to `origin`.
6. GitHub Actions workflow (`.github/workflows/release.yml`) automatically builds the release and deploys it to GitHub Pages.
