---
name: i18n-strings
description: String discipline for user-facing copy in web-public (Lingui, source locale en) — macro import law, extraction/compile/TMS commands, call-site patterns, translation register rules. Use when adding or editing ANY user-facing string in web-public, touching .po files, adding validation/aria messages, or handling translation overflow/locale bugs. Written for executor agents of any size — follow it literally.
---

# i18n strings — web-public only

Locales: source `en`, active locale set TBD (from `@jp/domain-types` via `@jp/i18n` — carried
over from petition-management's en+ta pair pending job-portal's own locale decision). web-admin
has NO i18n (English-only staff surface) — do not wrap strings there.

## The one law that breaks everything

**Import macros DIRECTLY from `@lingui/*/macro` at the call site.** Never re-export
`Trans`/`t`/`msg`/`Plural` from any shared module — the swc macro plugin keys on the fixed
import specifier; a re-export is not transformed and extraction silently breaks (and biome's
no-barrel ban rejects it anyway). Runtime symbols (`useLingui`, `i18n`) come from
`@lingui/react` / `@lingui/core`.

## Call-site patterns (copy these)

- JSX: `<Trans>Example copy</Trans>` — TODO(exemplar): first job-portal module pending.
- Non-JSX (validator message, aria-label, config tables): `` msg`Letters only` `` —
  TODO(exemplar): first job-portal module pending.
  `msg` produces a MessageDescriptor; render later with `useLingui().i18n._(descriptor)`.
- Plural: `<Plural one="# item" other="# items" value={total} />` — TODO(exemplar): first
  job-portal module pending.
- **Whole sentences only.** Never split one sentence across components/concatenation — the
  repo's #1 recurring i18n defect ("split-sentence-across-components"): word order differs in
  Tamil, fragments translate wrong. One `<Trans>` wraps the full sentence; interpolate with
  placeholders inside it.

## Locale plumbing (don't reinvent)

URL is the source of truth; cookie follows (`LocaleSync`, one-way URL→cookie —
`src/shared/i18n/locale-sync.tsx`). Middleware `src/proxy.ts` rewrites locale-less paths.
Read locale via `useLocale()` from the LocaleProvider — a biome rule rejects `useParams()` for
locale (request-time API breaks shell prerender under cacheComponents).

## Commands

```
pnpm --filter @jp/web-public lingui:extract && ./scripts/check-po-drops.sh   # after adding strings
pnpm --filter @jp/web-public lingui:compile --typescript                     # regen committed catalogs
pnpm --filter @jp/web-public i18n:push   # source strings → Tolgee TMS
pnpm --filter @jp/web-public i18n:pull   # translations → .po + compile
```
`.po` lives at `src/shared/i18n/locales/<locale>.po` (one per active locale); compiled
`<locale>.ts` files are generated AND committed (biome-ignored). Next prebuild auto-compiles.

## Copy laws (Quality Bar — violations = rejection)

- **NEVER shorten/flatten the English source string to make a translation fit.** Overflow in a
  target locale = that locale's copy problem, fixed in the TMS with a native speaker.
  `text-overflow: ellipsis` = failure floor, never the fix. (petition-management's target locale
  was Tamil, where overflow was usually REGISTER not length — formal imperative runs ~2.4×
  English; confirm whether the same applies once job-portal's locale set is decided.)
- **Non-source `.po` hand-editing is BANNED** — the editor strips lingui marks. Translation
  changes go through the TMS round-trip (push → edit in Tolgee → pull).
- Warm microcopy is product quality — don't genericize ("Pick your town" ≠ "Select"). A
  locale-neutral format hint replacing prose that restates the label (Apple HIG pattern) is
  allowed, but surface it for the user's call.
- New/changed msgids in a non-source locale you cannot translate natively → flag "translation
  owed" in your final report. Never machine-fill a target locale yourself.

## Done =

Extract runs clean (`check-po-drops.sh` catches dropped msgids), compile committed alongside
the code change, no split sentences, no shared-module macro re-export, translation status stated
honestly. User owns commits.
