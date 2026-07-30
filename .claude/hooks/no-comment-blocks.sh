#!/usr/bin/env bash
# PostToolUse hook: reject comment blocks of >=3 consecutive comment-only lines.
# CLAUDE.md rule: code over comments -- one line only, when the WHY is non-obvious.
set -euo pipefail

input=$(cat)
file=$(printf '%s' "$input" | jq -r '.tool_input.file_path // empty')
[ -z "$file" ] && exit 0

case "$file" in
*/apps/* | */packages/*) ;;
*) exit 0 ;;
esac
case "$file" in
*.ts | *.tsx | *.js | *.jsx) ;;
*) exit 0 ;;
esac
case "$file" in
*.gen.* | */generated/*) exit 0 ;;
esac
[ -f "$file" ] || exit 0

runs=$(awk '
  function flush() {
    if (run >= 3 && !exempt) print start ":\t" firsttext
    run = 0; exempt = 0
  }
  {
    line = $0; sub(/^[ \t]+/, "", line); iscomment = 0
    if (inblock) {
      iscomment = 1
      if (line ~ /\*\//) inblock = 0
    } else if (line ~ /^\/\//) {
      iscomment = 1
    } else if (line ~ /^\/\*/) {
      iscomment = 1
      if (line !~ /\*\//) inblock = 1
    }
    if (iscomment) {
      if (run == 0) { start = NR; firsttext = $0 }
      run++
      if (run == 1 && line ~ /SPDX|[Cc]opyright|[Ll]icen[sc]e/) exempt = 1
    } else flush()
  }
  END { flush() }
' "$file" || true)

[ -z "$runs" ] && exit 0

{
  echo "Comment block(s) of >=3 consecutive lines in $file:"
  echo "$runs"
  echo "CLAUDE.md: code over comments -- one line only, when the WHY is non-obvious. Trim them."
} >&2
exit 2
