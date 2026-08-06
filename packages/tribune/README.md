# `@jp/tribune`

Job-portal's design system — a curated fork of petition-management's tribune
(this repo's ADR-0014). JIT compiled in consuming apps; no build step here.

The seed carries mechanism only: tokens, typography (en/ta, biscript ink
alignment), fonts, the icon pipeline, and the authoring law in `CLAUDE.md`.
Components arrive one-by-one by adoption when a real screen needs them — copy
from `petition-management/packages/tribune/src/components/<name>/` together
with its stories, then review against `CLAUDE.md` and ADR-0038's two gates.

- Styles entries: `@jp/tribune/styles` (admin), `/styles/public` (marketing),
  `/styles/app` (combined).
- Icons: drop a 16×16 SVG in `src/icons/raw/`, run `pnpm gen:icons`.
- Tests: Storybook `play()` stories in `apps/storybook` — no test script here.
- Token guard: `pnpm -F @jp/tribune check:tokens`.
