#!/usr/bin/env bash
# PostToolUse hook: marketing-surface token discipline.
# BLOCK raw px in CSS values / Tailwind arbitrary values on the marketing surface
# (allowlist border/outline/ring/divide widths — crisp hairlines — plus lines
# carrying an @px-allow pragma). BLOCK raw color literals (hex/oklch/rgb/hsl);
# colors should come from design tokens, not inline literals.
# Escape pragmas: @px-allow, @color-allow. WARN: px media-query bounds (convention
# is rem MQs, so reflow also fires under browser zoom).
# NOTE: petition-management's version of this hook justified these rules by citing
# ADR-0027/ADR-0060 and routed color literals through its tribune package's token
# files. job-portal has neither yet (no ADRs, no design-system package) — this
# port keeps the mechanical px/color checks (they're stack-agnostic) but drops the
# petition-specific citations and file paths until job-portal has its own token
# architecture to point at.
set -euo pipefail

input=$(cat)
file=$(printf '%s' "$input" | jq -r '.tool_input.file_path // empty')
[ -z "$file" ] && exit 0
[ -f "$file" ] || exit 0

case "$file" in
*'(marketing)'* | */apps/web-public/src/*/marketing/*) ;;
*) exit 0 ;;
esac
case "$file" in
*.css | *.tsx | *.ts) ;;
*) exit 0 ;;
esac

offenders=$(grep -nE '[0-9]px' "$file" |
  grep -v '@px-allow' |
  grep -vE '@media|@container' |
  grep -vE '(^|[^-a-z])(border[a-z-]*|outline[a-z-]*)[^;{]*:' |
  grep -vE '\b(border|outline|ring|divide)(-[a-z]+)?-\[[0-9.]+px\]' || true)

if [ -n "$offenders" ]; then
  {
    echo "BLOCKED: raw px on the marketing surface in $file."
    echo "Prefer rem so the surface scales with the root font-size lever instead of"
    echo "silently freezing while the rest of the design zooms. Convert: rem = px / 16."
    echo "Allowed as-is: border/outline/ring/divide hairline widths."
    echo "Exception: append '/* @px-allow: <reason> */' on the line."
    echo "Offending lines:"
    echo "$offenders" | head -20
  } >&2
  exit 2
fi

colors=$(grep -nE '#[0-9a-fA-F]{3,8}\b|oklch\(|rgba?\(|hsla?\(' "$file" |
  grep -v '@color-allow' |
  grep -v 'url(#' || true)

if [ -n "$colors" ]; then
  {
    echo "BLOCKED: raw color literal on the marketing surface in $file."
    echo "Color literals bypass the design-token chain. Once job-portal has a token"
    echo "system, alias a token instead of minting inline color values."
    echo "Escape: '/* @color-allow: <reason> */' on the line."
    echo "Offending lines:"
    echo "$colors" | head -20
  } >&2
  exit 2
fi

if grep -nE '@(media|container)[^{]*[0-9]+px' "$file" | grep -qv '@px-allow'; then
  echo "Advisory for $file: px media-query bounds — convention is rem so reflow also fires under browser zoom (rem MQ = initial font-size, no circularity)."
fi
exit 0
