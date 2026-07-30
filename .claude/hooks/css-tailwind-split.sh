#!/usr/bin/env bash
# PostToolUse hook: CSS module vs Tailwind utility split.
# Rule: a .module.css selector earns its place only if it needs a custom
# property, var()/calc()/clamp()/min()/max(), or a non-trivial selector
# (media/pseudo/nesting/attr/combinator). A block whose every declaration is a
# literal value (display:flex, width:100%, border:0, ...) belongs in the JSX
# className as Tailwind utilities instead.
# Escape pragma: @css-required (place anywhere inside the block).
set -euo pipefail

input=$(cat)
file=$(printf '%s' "$input" | jq -r '.tool_input.file_path // empty')
[ -z "$file" ] && exit 0
[ -f "$file" ] || exit 0

case "$file" in
*/apps/*.module.css | */packages/*.module.css) ;;
*) exit 0 ;;
esac

violations=$(awk '
  function reset_block() {
    has_decl = 0; complex = 0; exempt = 0; sel = ""; sel_line = 0
  }
  BEGIN { depth = 0; reset_block() }
  {
    line = $0
    if ($0 ~ /@css-required/) exempt = 1

    nopen = gsub(/{/, "{", line)
    nclose = gsub(/}/, "}", line)

    if (depth == 0 && nopen > 0) {
      sel = $0; sub(/\{.*/, "", sel); gsub(/^[ \t]+|[ \t]+$/, "", sel)
      sel_line = NR
      if (sel !~ /^\.[A-Za-z][A-Za-z0-9_-]*$/) complex = 1
    } else if (depth == 1) {
      decl = $0; gsub(/^[ \t]+|[ \t]+$/, "", decl)
      if (decl ~ /^--/) { has_decl = 1; complex = 1 }
      else if (decl ~ /^[a-zA-Z-]+[ \t]*:/) {
        has_decl = 1
        if (decl ~ /var\(|calc\(|clamp\(|min\(|max\(/) complex = 1
      }
    }

    depth += nopen - nclose

    if (depth == 0 && nclose > 0) {
      if (has_decl && !complex && !exempt) {
        print sel_line ":\t" sel
      }
      reset_block()
    }
  }
' "$file" || true)

[ -z "$violations" ] && exit 0

{
  echo "CSS module has selector(s) with zero var()/calc()/clamp()/complex-selector"
  echo "need in $file — plain literal values belong on the element as Tailwind"
  echo "utilities, not in the CSS module. Move these to className, delete the rule:"
  echo "$violations"
  echo "Genuinely needs to stay CSS (e.g. an upcoming var/calc you're about to add)?"
  echo "Append '/* @css-required: <reason> */' inside the block."
} >&2
exit 2
