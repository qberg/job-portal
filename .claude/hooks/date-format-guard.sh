#!/usr/bin/env bash
# PostToolUse hook: one date-format source of truth (@jp/formatting/date).
# Rule: display date/time formatting goes through formatDate/formatDateTime/
# formatDateMaybe from @jp/formatting/date — never a fresh Intl.DateTimeFormat,
# toLocaleDateString/toLocaleTimeString/toDateString, or a date lib. Keeps
# display formatting single-control-point (flip the format in one place).
# Escape pragma: place `@date-format-allow: <reason>` on the offending line
# (e.g. a chart axis label or deliberate date MATH via formatToParts).
set -euo pipefail

input=$(cat)
file=$(printf '%s' "$input" | jq -r '.tool_input.file_path // empty')
[ -z "$file" ] && exit 0
[ -f "$file" ] || exit 0

case "$file" in
*.ts | *.tsx) ;;
*) exit 0 ;;
esac

# Skip: the source of truth itself, and tests.
case "$file" in
*/packages/formatting/*) exit 0 ;;
*.test.ts | *.test.tsx) exit 0 ;;
esac

# A match is suppressed when @date-format-allow sits on the same line OR an
# adjacent one — the formatter may push a trailing pragma onto the next line.
hits=$(awk '
  { lines[NR] = $0 }
  END {
    api = "Intl\\.DateTimeFormat|\\.toLocaleDateString\\(|\\.toLocaleTimeString\\(|\\.toDateString\\(|\\.toTimeString\\("
    lib = "from [\x27\"](date-fns|dayjs|luxon|moment)"
    for (n = 1; n <= NR; n++) {
      if (lines[n] !~ api && lines[n] !~ lib) continue
      if (lines[n] ~ /@date-format-allow/) continue
      if (n > 1 && lines[n-1] ~ /@date-format-allow/) continue
      if (n < NR && lines[n+1] ~ /@date-format-allow/) continue
      printf "%d:%s\n", n, lines[n]
    }
  }
' "$file" || true)

[ -z "$hits" ] && exit 0

{
  echo "Date/time formatting must go through @jp/formatting/date — this keeps"
  echo "the whole app on one display format with one control point. In $file:"
  echo "$hits"
  echo
  echo "Use: import { formatDate, formatDateTime } from \"@jp/formatting/date\";"
  echo "Deliberate exception (chart axis label, date MATH via formatToParts, or"
  echo "an external-brand replica)? Append '// @date-format-allow: <reason>' on"
  echo "the line."
} >&2
exit 2
