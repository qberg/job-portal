import type { LinguiConfig } from "@lingui/conf";
import { locales, sourceLocale } from "./locales";

export const baseLinguiConfig = {
  locales: [...locales],
  sourceLocale,
} satisfies Pick<LinguiConfig, "sourceLocale" | "locales">;
