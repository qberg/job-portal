#!/usr/bin/env bash
# PostToolUse hook: React discipline advisories for agents (web-public).
# WARN (context): useState+matchMedia w/o useSyncExternalStore · setter-only effects.
# NOTE: petition-management's version of this hook also BLOCKed a static import of a
# specific heavy map bundle and a design-system rounded-corner ratchet tied to its
# tribune package + ADR-0060. Neither has a job-portal analog yet (no design-system
# package or bundle-size decision has been made) — ported as advisory-only until
# job-portal has an equivalent DS/bundle-size law to enforce as a BLOCK.
set -euo pipefail

input=$(cat)
file=$(printf '%s' "$input" | jq -r '.tool_input.file_path // empty')
[ -z "$file" ] && exit 0

case "$file" in
*/apps/web-public/src/*) ;;
*) exit 0 ;;
esac
case "$file" in
*.tsx | *.ts) ;;
*) exit 0 ;;
esac
[ -f "$file" ] || exit 0

warn=""

if grep -q 'matchMedia' "$file" && grep -q 'useState' "$file" &&
  ! grep -q 'useSyncExternalStore' "$file"; then
  warn="$warn
- useState+matchMedia without useSyncExternalStore: external-store subscriptions (matchMedia/online/storage) belong in useSyncExternalStore, not useState+useEffect ('You Might Not Need an Effect' > Subscribing to an external store)."
fi

if grep -Pzoq 'useEffect\(\(\) => \{\s*set[A-Z][A-Za-z]*\(' "$file"; then
  warn="$warn
- Effect whose body starts with a setState call: if the value derives from props/state, compute it during render; if it reacts to a user action, move it to the handler ('You Might Not Need an Effect'). Effects are only for external systems."
fi

if [ -n "$warn" ]; then
  echo "React-discipline advisories for $file (not blocking — fix or justify):$warn"
fi
exit 0
