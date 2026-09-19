import { describe, expect, it } from "vitest";
import { baseLinguiConfig } from "./config";
import { locales, sourceLocale } from "./locales";

describe("baseLinguiConfig", () => {
  it("mirrors the shared locale configuration", () => {
    expect(baseLinguiConfig).toEqual({
      locales: [...locales],
      sourceLocale,
    });
  });
});
