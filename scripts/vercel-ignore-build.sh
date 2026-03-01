#!/usr/bin/env bash

set -euo pipefail

echo "🧠 Evaluating whether this commit needs a Vercel build..."

# Skip builds for bot/automated branches entirely
BRANCH="${VERCEL_GIT_COMMIT_REF:-}"
case "$BRANCH" in
  dependabot/*|automated/*)
    echo "⏭️ Skipping build for bot/automated branch: $BRANCH"
    exit 0
    ;;
esac

CURRENT_SHA="${VERCEL_GIT_COMMIT_SHA:-}"
PREVIOUS_SHA="${VERCEL_GIT_PREVIOUS_SHA:-}"

if [[ -z "$CURRENT_SHA" || -z "$PREVIOUS_SHA" ]]; then
  echo "ℹ️ Missing Vercel git SHAs (first deploy or unavailable metadata)."
  echo "➡️ Building to be safe."
  exit 1
fi

if ! git cat-file -e "$CURRENT_SHA"^{commit} 2>/dev/null; then
  echo "ℹ️ Current SHA not available in checkout."
  echo "➡️ Building to be safe."
  exit 1
fi

if ! git cat-file -e "$PREVIOUS_SHA"^{commit} 2>/dev/null; then
  echo "ℹ️ Previous SHA not available in checkout."
  echo "➡️ Building to be safe."
  exit 1
fi

CHANGED_FILES="$(git diff --name-only "$PREVIOUS_SHA" "$CURRENT_SHA")"

if [[ -z "$CHANGED_FILES" ]]; then
  echo "ℹ️ No changed files detected between SHAs."
  echo "➡️ Building to be safe."
  exit 1
fi

echo "Changed files:"
echo "$CHANGED_FILES"

SHOULD_BUILD=false

while IFS= read -r file; do
  [[ -z "$file" ]] && continue

  case "$file" in
    src/*|content/*|public/*|messages/*|i18n/*|middleware.ts|next.config.ts|vercel.json|contentlayer.config.ts|package.json|package-lock.json|tsconfig.json|postcss.config.mjs|eslint.config.mjs|vitest.config.ts|vitest.setup.ts|prisma/*)
      SHOULD_BUILD=true
      break
      ;;
    *)
      ;;
  esac
done <<< "$CHANGED_FILES"

if [[ "$SHOULD_BUILD" == true ]]; then
  echo "✅ App-impacting changes detected."
  echo "➡️ Proceeding with build."
  exit 1
fi

echo "⏭️ Only non-app-impacting changes detected (e.g., docs/meta)."
echo "➡️ Skipping this preview build."
exit 0