#!/usr/bin/env bash
# PostToolUse hook: forbid relative imports with file extensions.
# Project uses extensionless imports (moduleResolution: bundler; tsx/tsdown
# resolve raw .ts/.tsx). `.ts` extensions also break consumer typecheck
# (apps use node.json, allowImportingTsExtensions off).
set -euo pipefail

input=$(cat)
file=$(printf '%s' "$input" | jq -r '.tool_input.file_path // empty')
[ -z "$file" ] && exit 0

case "$file" in
  *.ts | *.tsx) ;;
  *) exit 0 ;;
esac
[ -f "$file" ] || exit 0

# Payload-generated route-group files require .js extensions on their internal
# imports (Payload's own module resolution, not a TypeScript import). Exempt the
# entire (payload) route group so Payload can regenerate these files freely.
case "$file" in
  *"/app/(payload)/"*) exit 0 ;;
esac

# Match: import/export ... from "./x.js|.ts|.jsx|.tsx"  (relative paths only)
hits=$(grep -nE 'from "\.\.?/[^"]*\.(js|ts)x?"' "$file" || true)
[ -z "$hits" ] && exit 0

{
  echo "Relative imports must be extensionless (moduleResolution: bundler)."
  echo "Drop the .js/.ts/.tsx extension from these in $file:"
  echo "$hits"
} >&2
exit 2
