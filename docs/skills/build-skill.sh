#!/usr/bin/env bash
#
# build-skill.sh — package the editable skill source into an installable .skill
#
# The skill source of truth lives in:   docs/skills/prompt-architect/
# This script zips it into:             docs/skills/prompt-architect.skill
# which you can then open/double-click to install into Cowork.
#
# Usage:
#   ./build-skill.sh                 # builds prompt-architect
#   ./build-skill.sh <skill-dir>     # builds a specific skill folder
#
set -euo pipefail

# Resolve the directory this script lives in, so it works from anywhere.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

SKILL_NAME="${1:-prompt-architect}"
SRC_DIR="$SCRIPT_DIR/$SKILL_NAME"
OUT_FILE="$SCRIPT_DIR/$SKILL_NAME.skill"

if [[ ! -f "$SRC_DIR/SKILL.md" ]]; then
  echo "error: $SRC_DIR/SKILL.md not found — is '$SKILL_NAME' a valid skill folder?" >&2
  exit 1
fi

rm -f "$OUT_FILE"

# Zip the *contents* of the skill folder (SKILL.md must be at the archive root).
# Exclude OS/editor cruft so the package stays clean.
( cd "$SRC_DIR" && zip -rq "$OUT_FILE" . -x '.DS_Store' -x '__MACOSX/*' -x '*/.DS_Store' )

echo "Built $OUT_FILE"
unzip -l "$OUT_FILE"
