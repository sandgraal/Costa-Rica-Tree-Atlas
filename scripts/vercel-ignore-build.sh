#!/usr/bin/env bash

set -euo pipefail

echo "🧠 Evaluating whether this commit needs a Vercel build..."

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

# Use --name-status to track both old and new paths for renamed files
# This prevents misclassifying cross-boundary renames (e.g., src/* to docs/*)
CHANGED_FILES="$(git diff --name-status "$PREVIOUS_SHA" "$CURRENT_SHA")"

if [[ -z "$CHANGED_FILES" ]]; then
  echo "ℹ️ No changed files detected between SHAs."
  echo "➡️ Building to be safe."
  exit 1
fi

echo "Changed files:"
echo "$CHANGED_FILES"

SHOULD_BUILD=false

# App-impacting path patterns (centralized for maintainability)
# Update this list when project structure changes
APP_IMPACTING_PATTERNS=(
  # Core application code
  "src/*"
  "content/*"
  "public/*"
  "messages/*"
  "i18n/*"
  
  # Configuration files
  "middleware.ts"
  "next.config.ts"
  "vercel.json"
  "contentlayer.config.ts"
  "prisma.config.ts"
  
  # Dependencies
  "package.json"
  "package-lock.json"
  
  # Build configuration
  "tsconfig.json"
  "postcss.config.mjs"
  "eslint.config.mjs"
  "vitest.config.ts"
  "vitest.setup.ts"
  
  # Database schema
  "prisma/*"
  
  # Build/CI scripts (changes to build logic should trigger builds)
  "scripts/vercel-ignore-build.sh"
  ".github/workflows/*"
)

# Parse git diff output with status codes (handles renames correctly)
while IFS= read -r line; do
  [[ -z "$line" ]] && continue
  
  # Split by tab character
  status=$(echo "$line" | cut -f1)
  
  # For renames (R) and copies (C), there are 3 tab-separated fields: status, old path, new path
  # For other statuses (M, A, D), there are 2 fields: status, path
  if [[ "$status" =~ ^[RC] ]]; then
    old_path=$(echo "$line" | cut -f2)
    new_path=$(echo "$line" | cut -f3)
    echo "  Checking renamed/copied file: $old_path -> $new_path"
    
    # Check both old and new paths for renames/copies
    paths_to_check=("$old_path" "$new_path")
  else
    # For all other statuses, file is in field 2
    file_path=$(echo "$line" | cut -f2)
    paths_to_check=("$file_path")
  fi
  
  # Check if any path matches app-impacting patterns
  for check_path in "${paths_to_check[@]}"; do
    for pattern in "${APP_IMPACTING_PATTERNS[@]}"; do
      # Convert glob pattern to extended regex
      regex_pattern="${pattern//\*/.*}"
      regex_pattern="^${regex_pattern}$"
      
      if [[ "$check_path" =~ $regex_pattern ]]; then
        echo "  ✅ '$check_path' matches app-impacting pattern: $pattern"
        SHOULD_BUILD=true
        break 3
      fi
    done
  done
done <<< "$CHANGED_FILES"

if [[ "$SHOULD_BUILD" == true ]]; then
  echo "✅ App-impacting changes detected."
  echo "➡️ Proceeding with build."
  exit 1
fi

echo "⏭️ Only non-app-impacting changes detected (e.g., docs/meta)."
echo "➡️ Skipping this preview build."
exit 0
