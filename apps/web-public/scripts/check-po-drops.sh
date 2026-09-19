#!/usr/bin/env bash
# Fails when an extract run orphaned filled translations (msgids changed → Tamil dropped).
# The 2026-07-20 hero regression: 5 extract commits silently bled 57 translations.
set -euo pipefail
cd "$(dirname "$0")/.."
drops=$(git diff -- src/shared/i18n/locales/*.po | grep -cE '^-msgstr "[^"]' || true)
if [ "$drops" -gt 0 ]; then
  echo "✗ extract dropped ${drops} filled translation(s) — msgids changed. Remap before commit:" >&2
  git diff -- src/shared/i18n/locales/*.po | grep -B4 -E '^-msgstr "[^"]' | grep -E '^[-+ ]msgid' >&2
  exit 1
fi
echo "✓ no translations dropped"
