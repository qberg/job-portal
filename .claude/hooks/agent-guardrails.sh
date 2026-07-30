#!/usr/bin/env bash
# PreToolUse[Bash] guard: block commands that violate standing repo rules
# (CLAUDE.md + user policy). Exit 2 = block, stderr goes back to the model.
set -euo pipefail

cmd=$(jq -r '.tool_input.command // empty' 2>/dev/null || true)
[ -z "$cmd" ] && exit 0

block() {
  echo "$1" >&2
  exit 2
}

if echo "$cmd" | grep -qE 'git[[:space:]]+commit[[:space:]].*--amend'; then
  block "BLOCKED: git commit --amend forbidden — shared branch, concurrent agents may own HEAD. Make a plain commit on top."
fi

if echo "$cmd" | grep -qE 'git[[:space:]]+push[[:space:]].*(--force|-f([[:space:]]|$))'; then
  block "BLOCKED: git push --force requires explicit user confirmation. Surface it instead."
fi

if echo "$cmd" | grep -qE '(^|[[:space:]])(npx|bunx|pnpm[[:space:]]+(exec|dlx))[[:space:]]+(@biomejs/)?biome\b'; then
  block "BLOCKED: raw biome emits false positives (cannot resolve ultracite extends). Use 'ultracite check'/'ultracite fix' or root 'pnpm check'."
fi

if echo "$cmd" | grep -qE '(^|&&|;)[[:space:]]*pnpm[[:space:]]+(-w[[:space:]]+|-r[[:space:]]+)?(run[[:space:]]+)?fix([[:space:]]|$)' \
  && ! echo "$cmd" | grep -qE '\-F[[:space:]]|--filter'; then
  block "BLOCKED: repo-wide 'pnpm fix' rewrites files outside your scope. Use scoped 'ultracite fix <paths>' or 'pnpm -F <pkg> fix'."
fi

if echo "$cmd" | grep -qE '(^|[[:space:]])(printenv([[:space:]]|$)|env[[:space:]]*$)'; then
  block "BLOCKED: environment dumps are forbidden (secrets). Check a single var with [ -n \"\$VAR\" ] instead."
fi

if echo "$cmd" | grep -qE '(cat|bat|less|more|head|tail|grep|rg|sed|awk|cp|xxd|strings)[^|;&]*(^|/|[[:space:]])\.env(\.[A-Za-z0-9_-]+)?([[:space:]]|$)' \
  && ! echo "$cmd" | grep -qE '\.env\.(example|sample|template)'; then
  block "BLOCKED: reading .env files is forbidden (secrets). Test presence of a single var with [ -n \"\$VAR\" ] instead."
fi

exit 0
