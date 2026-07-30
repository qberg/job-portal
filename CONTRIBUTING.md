# Contributing

This is the workflow manual for humans. The architectural law lives in
`CLAUDE.md`; the process rules live in `docs/process/shape-up.md`; decisions
and their reasons live in `docs/adr/`. When those documents and habit
disagree, the documents win.

## Setup

```sh
corepack enable
pnpm install          # also installs lefthook git hooks
docker compose up -d  # postgres (PostGIS), valkey, meilisearch
cp .env.example .env  # fill in local values — never commit .env
```

Verify your environment before your first branch:

```sh
pnpm typecheck && pnpm check && pnpm test
```

## Daily workflow

1. Every piece of work starts from a GitHub issue in the current cycle. No
   issue, no branch. If you discover work, open an issue and flag it — do not
   silently expand scope.
2. Branch from `main`: `<issue-number>-short-slug` (e.g. `42-job-post-form`).
3. Build in **vertical slices**: the thinnest end-to-end path first
   (db → domain → handler → contract → UI), integrated and working, then
   widen. Never build a whole layer in isolation.
4. Commit in small, coherent steps. Conventional Commits format:
   `feat(scope): …`, `fix(scope): …`, `refactor(scope): …`.
5. Open a PR early — draft PRs are welcome. Fill the template honestly,
   including what you did NOT do.
6. CI green + review approval = merge. You merge your own PR after approval.

## Pull request rules

- **One issue per PR, one PR per issue.** If it doesn't fit, the issue was
  shaped wrong — say so in the issue, don't grow the PR.
- Keep PRs reviewable: aim under ~400 changed lines of hand-written code.
  Generated files (migrations, lockfiles, extracted strings) don't count.
- A red CI check is yours to fix. Never merge on red, never ask for the gate
  to be lowered to get a PR in.
- Review comments are teaching, not gatekeeping theater. Push back with
  reasons when you disagree — silent compliance and silent ignoring are both
  wrong.

## Review checklist (what the reviewer will look for)

Before requesting review, check your own diff against this list:

- [ ] Slice is vertical and demonstrably works (say how you verified it).
- [ ] New wire shapes live in `packages/api-contract`, nowhere else.
- [ ] Reads in `query/`, writes in `repo/`, orchestration in `commands/`
      only when a write spans ≥2 repo ops.
- [ ] Domain code is pure — no IO, no framework imports.
- [ ] Errors returned as `Result` values; nothing thrown across layers.
- [ ] Every user-facing string uses Lingui macros; strings extracted.
- [ ] Tests cover the behavior you added — test the real thing (a route, a
      command against a real test DB), not a mock of it.
- [ ] No `any`, no barrel files, no commented-out code, no TODOs without an
      issue number.
- [ ] Fixtures/seeds contain fabricated data only — this repo is public.
- [ ] If you changed a boundary, dependency, or deployment shape: ADR included.

## Definition of done

Shipped means **deployed and verified**, not merged. A task is done when the
acceptance criteria on the issue pass in the deployed environment, tests
guard the behavior, and strings exist in both `en` and `ta` catalogs (Tamil
translation may be pending — the key must exist).

## Quality bar

"Polished" is not a feeling; it is checkable: empty states designed, loading
states designed, error states designed, keyboard navigation works, works on a
low-end Android over slow 4G (test with throttling), Tamil text does not
overflow its container. If a screen is missing one of these, it is not done —
cut scope elsewhere instead ("half a product, not a half-assed product").

## Getting unstuck

Stuck for more than ~2 hours on the same wall: write down what you tried in
the issue and raise it. Asking early is a professional habit, not a failure.
The repo's `.claude/skills/` recipes (`add-vertical`, `db-change`,
`outbox-job`, `i18n-strings`) exist so you never have to guess the mechanical
steps — follow them literally.
