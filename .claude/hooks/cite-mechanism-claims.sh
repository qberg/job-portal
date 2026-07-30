#!/usr/bin/env bash
# PostToolUse hook: a comment asserting HOW a third-party runtime behaves must cite a source.
# CLAUDE.md "Evidence law": mechanism claims are read, not inferred. Judged per comment BLOCK
# (the receipt may sit on any line of it) and ratcheted against HEAD, so only new claims fail.
set -euo pipefail

input=$(cat)
file=$(printf '%s' "$input" | jq -r '.tool_input.file_path // empty')
[ -z "$file" ] && exit 0

case "$file" in
*/apps/* | */packages/*) ;;
*) exit 0 ;;
esac
case "$file" in
*.ts | *.tsx) ;;
*) exit 0 ;;
esac
case "$file" in
*.gen.* | */generated/* | */migrations/* | */drizzle/* | */i18n/locales/*) exit 0 ;;
esac
[ -f "$file" ] || exit 0

root=${CLAUDE_PROJECT_DIR:-$(git -C "$(dirname "$file")" rev-parse --show-toplevel 2>/dev/null || true)}
[ -z "$root" ] && exit 0
rel=${file#"$root"/}

# Names whose runtime behaviour we cannot infer -- it must be looked up.
FRAMEWORK='Next\.?js|Next 1[0-9]|React|xstate|base-ui|Payload|TanStack|Lingui|better-auth|Tailwind|lenis|Drizzle|oRPC|valibot|mapbox|bfcache|RSC|PPR|Activity'
# Verbs that assert a runtime mechanism rather than describe our own code.
MECHANISM='unmount|remount|mounts|cach|invalidat|preserv|persist|surviv|re-?render|hydrat|prefetch|revalidat|discard|destroy|retain|restore|memoi|garbage|tears? down|throws away|keeps alive'
# An explicit source: doc title, ADR, file path, URL, or an audited-source marker.
CITE='docs:|see |ADR-[0-9]|\.md\b|node_modules/|https?://|@verified|"[^"]{4,}"|src/[a-z]'

# One record per comment block: "<startline>\t<block text joined by spaces>".
blocks() {
  awk '
    function flush() { if (n > 0) print start "\t" buf; n = 0; buf = "" }
    function add(raw,   t) { t = raw; gsub(/^[ \t\/*]+/, "", t)
      if (n == 0) { start = NR; buf = t } else { buf = buf " " t }
      n++ }
    { line = $0; sub(/^[ \t]+/, "", line)
      if (inblock) { add($0); if (line ~ /\*\//) inblock = 0; next }
      if (line ~ /^\/\//) { add($0); next }
      if (line ~ /^\/\*/) { add($0); if (line !~ /\*\//) inblock = 1; next }
      flush() }
    END { flush() }
  ' "$1"
}

old=$(mktemp)
trap 'rm -f "$old"' EXIT
git -C "$root" show "HEAD:$rel" >"$old" 2>/dev/null || : >"$old"
prior=$(blocks "$old" | cut -f2-)

offenders=$(blocks "$file" | while IFS=$'\t' read -r n text; do
  printf '%s\n' "$prior" | grep -qxF "$text" && continue
  printf '%s' "$text" | grep -Eqi "$FRAMEWORK" || continue
  printf '%s' "$text" | grep -Eqi "$MECHANISM" || continue
  printf '%s' "$text" | grep -Eq "$CITE" && continue
  printf '  %s:%s  %.90s\n' "$rel" "$n" "$text"
done)

[ -z "$offenders" ] && exit 0

{
  echo "Uncited mechanism claim(s) about third-party runtime behaviour:"
  echo "$offenders"
  echo
  echo "CLAUDE.md Evidence law: do NOT infer how a framework behaves -- read it, then cite it."
  echo "Sources: node_modules/<pkg>/**/*.md, the installed source, or a docs MCP (context7,"
  echo "better-auth, next-devtools). Put the receipt anywhere in the same comment block:"
  echo '  // Next "Preserving UI state": a hidden route keeps client state alive'
  echo "If the claim is about OUR code, reword it so it does not read as a third-party claim."
} >&2
exit 2
