import { describe, expect, it } from "vitest";
import {
  ACTIVE_LOCALES,
  DEFAULT_LOCALE,
  isLocale,
  LOCALE_CODES,
  Locales,
  locales,
  sourceLocale,
} from "./locales";

describe("locale constants", () => {
  it("keeps the active locales and exported locale list aligned", () => {
    expect(locales).toEqual(ACTIVE_LOCALES);
    expect(LOCALE_CODES).toEqual(["en", "ta"]);
  });

  it("uses English as the source/default locale", () => {
    expect(DEFAULT_LOCALE).toBe(Locales.EN);
    expect(sourceLocale).toBe(Locales.EN);
  });
});

describe("isLocale", () => {
  it("accepts active locales", () => {
    expect(isLocale("en")).toBe(true);
    expect(isLocale("ta")).toBe(true);
  });

  it("rejects unsupported locale strings", () => {
    expect(isLocale("fr")).toBe(false);
    expect(isLocale("")).toBe(false);
  });
});
