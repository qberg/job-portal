import type { Locale } from "@jp/i18n/locales";
import type { Messages } from "@lingui/core";
import { messages as en } from "./locales/en";
import { messages as ta } from "./locales/ta";

// Compiled catalogs are imported statically (two locales, tiny) so the loader
// stays synchronous, matching @pm/i18n's createI18nServer contract. Regenerate
// with `pnpm --filter @pm/web-public lingui:extract && lingui:compile`.
const catalogs: Record<Locale, Messages> = { en, ta };

export const loadMessages = (locale: Locale): Messages => catalogs[locale];
