#!/bin/bash
# Copyright (c) 2024-present Costa Rica Tree Atlas contributors
# SPDX-License-Identifier: MIT
#
# PreToolUse hook (matcher: Write) — advisory-only frontmatter check for
# new tree MDX files. Warns (does not block) when a newly written
# content/trees/**/*.mdx file is missing the canonical fields the
# factual-audit pipeline (scripts/audit-factual-accuracy.mjs) and the
# Deep-250 taxonomic-ID backfill depend on.
#
# Scoped to Write only, not Edit: the Edit tool's tool_input carries
# old_string/new_string diffs, not full file content, so there's no
# reliable way to see "the resulting frontmatter" at PreToolUse time for
# a partial edit. This is a known, intentional gap for v1 — see
# Master Plan v7.x lane L7. Extending to Edit (likely via a PostToolUse
# hook reading the file from disk after the edit lands) is a follow-up.
#
# Advisory only: always exits 0. Missing fields surface to Claude via
# additionalContext, not a blocked tool call — this hook is new and
# unproven, so start non-blocking and tighten later once observed.

set -e

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty')

# Only care about Write calls into content/trees/**/*.mdx
if [[ "$TOOL_NAME" != "Write" ]]; then
  exit 0
fi
if [[ ! "$FILE_PATH" =~ content/trees/(en|es)/[^/]+\.mdx$ ]]; then
  exit 0
fi

CONTENT=$(echo "$INPUT" | jq -r '.tool_input.content // empty')
if [[ -z "$CONTENT" ]]; then
  exit 0
fi

# Frontmatter is the YAML block between the first two '---' lines.
FRONTMATTER=$(echo "$CONTENT" | awk '/^---$/{n++; next} n==1')

# Canonical/audit-relevant fields (schema-optional but load-bearing for
# the fact-audit pipeline and taxonomic backfill — NOT the same as
# contentlayer's hard-required fields, which a failed build already
# catches).
REQUIRED_FIELDS=("scientificName" "family" "conservationStatus" "gbifTaxonKey")
MISSING_FIELDS=()

for field in "${REQUIRED_FIELDS[@]}"; do
  if ! echo "$FRONTMATTER" | grep -qE "^${field}:[[:space:]]*[^[:space:]]"; then
    MISSING_FIELDS+=("$field")
  fi
done

if [ ${#MISSING_FIELDS[@]} -gt 0 ]; then
  FIELDS_LIST=$(printf '%s, ' "${MISSING_FIELDS[@]}")
  FIELDS_LIST="${FIELDS_LIST%, }"
  jq -n \
    --arg reason "Advisory: $FILE_PATH is missing canonical field(s) [$FIELDS_LIST]. These feed the factual-audit pipeline (scripts/audit-factual-accuracy.mjs) and the Deep-250 taxonomic-ID backfill — see content/CLAUDE.md and .claude/skills/add-species.md. Not blocking; please add them before committing." \
    '{
      "hookSpecificOutput": {
        "hookEventName": "PreToolUse",
        "additionalContext": $reason
      }
    }'
fi

exit 0
