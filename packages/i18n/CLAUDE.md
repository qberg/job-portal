# @pm/i18n

Thin shared Lingui base for all frontends (web-admin, web-public). Exports `./locales`,
`./config` (`baseLinguiConfig`), `./server` (`createI18nServer`), `./client`
(`LinguiClientProvider`). ADR-0015 (UI-chrome strings only — domain reference-label
translation is the DB FSM, not here).

- **NEVER re-export Lingui macros (`Trans`/`t`) from this package.** The swc/babel macro plugin keys on the fixed specifier `@lingui/*/macro`; a re-export is not transformed → message extraction silently breaks. It also trips the repo no-barrel biome ban. Apps import macros **direct** from `@lingui/*/macro`, runtime symbols from `@lingui/react`.
- **Locale vocab is sourced**, not redeclared: `@pm/domain-types/kernel/localization/locale` (codes `en`/`ta`; default `en` = Lingui `sourceLocale`, the ADR-0015 authored source). Must match the DB `locale` table codes.
- **`createI18nServer(loadMessages)` loader is SYNC** `(locale) => Messages`. Apps static-import their compiled catalogs (2 locales, tiny) — not async `import()`.
- **No per-app `.po` catalogs here** — staff vs citizen strings are per-app, different lifecycles.
- Lingui pinned **6.3.0** (pnpm `minimumReleaseAge` blocks younger); `@lingui/swc-plugin` must == `@lingui/core` version (ABI mismatch fails silently — raw English renders). Check publish age before bumping.
- Consumer wiring gotchas (setI18n in layout AND page, proxy.ts matcher, compiled-catalog drift): `apps/web-public/CLAUDE.md`.
