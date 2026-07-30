#!/usr/bin/env bash
# Gate baseline. The close bar is "no NEW red", never "all green": a brownfield
# repo is partly red on purpose. Capture the inherited red BEFORE touching code,
# compare at close. Without the snapshot you cannot tell inherited red from yours.
#   baseline.sh capture   snapshot each gate's current PASS|FAIL
#   baseline.sh compare   re-run, flag gates that were PASS but are now FAIL
set -uo pipefail
ROOT="$(git rev-parse --show-toplevel)" || exit 1
SNAP="$ROOT/.git/ship-issue-baseline.txt"   # under .git, so never committed

run_gate() {
  # $1 = label, $2.. = command. Emits "<label> PASS" or "<label> FAIL".
  local label="$1"; shift
  if (cd "$ROOT" && "$@") >/dev/null 2>&1; then echo "$label PASS"; else echo "$label FAIL"; fi
}

snapshot() {
  run_gate typecheck pnpm typecheck
  run_gate lint      pnpm check
  run_gate test      pnpm test
}

case "${1:-}" in
  capture)
    snapshot | tee "$SNAP"
    echo "baseline saved to $SNAP" >&2
    ;;
  compare)
    [ -f "$SNAP" ] || { echo "no baseline; run: baseline.sh capture" >&2; exit 2; }
    now="$(snapshot)"
    new_red=0
    while read -r label state; do
      was="$(awk -v l="$label" '$1==l{print $2}' "$SNAP")"
      if [ "$was" = PASS ] && [ "$state" = FAIL ]; then
        echo "NEW RED: $label (was PASS at baseline)"
        new_red=1
      fi
    done <<< "$now"
    [ "$new_red" = 0 ] && echo "no new red vs baseline"
    exit "$new_red"
    ;;
  *)
    echo "usage: baseline.sh capture|compare" >&2
    exit 64
    ;;
esac
