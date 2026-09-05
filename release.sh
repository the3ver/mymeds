#!/bin/bash
set -e # Exit immediately if a command exits with a non-zero status.

# 1. Check for clean working directory
if ! git diff-index --quiet HEAD --; then
    echo "Working directory is not clean. Please commit or stash your changes before releasing."
    exit 1
fi
echo "✅ Working directory is clean."

# 2. Determine version type from argument
VERSION_TYPE="patch" # Default
if [ "$1" == "-minor" ]; then
    VERSION_TYPE="minor"
elif [ "$1" == "-major" ]; then
    VERSION_TYPE="major"
fi
echo "🚀 Bumping a '$VERSION_TYPE' version."

# 3. Bump version in package.json without creating a git tag/commit
# This updates package.json and package-lock.json
npm version $VERSION_TYPE --no-git-tag-version

# 4. Get the new version from package.json
NEW_VERSION=$(node -p "require('./package.json').version")
TAG_NAME="v$NEW_VERSION"
echo "📦 New version will be: $TAG_NAME"

# 5. Run npm install to ensure package-lock.json is fully in sync
echo "⚙️  Running npm install to sync lockfile..."
npm install

# 6. Stage changes and commit
git add package.json package-lock.json
COMMIT_MSG="${2:-chore: release $TAG_NAME}"
echo "✍️ Commit message: $COMMIT_MSG"
git commit -m "$COMMIT_MSG"

# 7. Create the git tag
echo "🏷️  Tagging new version as $TAG_NAME..."
git tag $TAG_NAME

# 8. Push commit and tags
echo "📡 Pushing commit and tags to origin..."
git push
git push --tags

echo "🎉 Release process for $TAG_NAME complete."
