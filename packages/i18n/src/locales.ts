export const Locales = {
  EN: "en",
  TA: "ta",
} as const;
export type Locale = (typeof Locales)[keyof typeof Locales];

export const LOCALE_CODES = ["en", "ta"] as const satisfies readonly Locale[];

// Mirrors DB locale.is_default / is_active (ADR-0015). en = authored source locale.
export const DEFAULT_LOCALE: Locale = "en";
export const ACTIVE_LOCALES = ["en", "ta"] as const satisfies readonly Locale[];

export const locales = ACTIVE_LOCALES;
export const sourceLocale = DEFAULT_LOCALE;

export const isLocale = (value: string): value is Locale =>
  (ACTIVE_LOCALES as readonly string[]).includes(value);
