import { afterEach, describe, expect, it, vi } from "vitest";
import { resolveAdapter } from "./resolve-adapter";

const REAL = "real-adapter";
const FAKE = "fake-adapter";
const REFUSAL_IN_PROD = /refusing the Fake fallback in production/;

describe("resolveAdapter", () => {
  const originalNodeEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
    vi.restoreAllMocks();
  });

  it("returns the real adapter when creds are present, even in production", () => {
    process.env.NODE_ENV = "production";
    const out = resolveAdapter({
      credsPresent: true,
      fake: () => FAKE,
      real: () => REAL,
      seam: "row-present-prod",
    });
    expect(out).toBe(REAL);
  });

  it("returns the real adapter when creds are present in development", () => {
    process.env.NODE_ENV = "development";
    const out = resolveAdapter({
      credsPresent: true,
      fake: () => FAKE,
      real: () => REAL,
      seam: "row-present-dev",
    });
    expect(out).toBe(REAL);
  });

  it("throws when creds are absent in production (refuses the Fake)", () => {
    process.env.NODE_ENV = "production";
    expect(() =>
      resolveAdapter({
        credsPresent: false,
        fake: () => FAKE,
        real: () => REAL,
        seam: "row-absent-prod",
      })
    ).toThrow(REFUSAL_IN_PROD);
  });

  it("warns once per seam then returns the Fake when creds are absent (dev)", () => {
    process.env.NODE_ENV = "development";
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const call = () =>
      resolveAdapter({
        credsPresent: false,
        fake: () => FAKE,
        real: () => REAL,
        seam: "row-absent-dev",
      });
    expect(call()).toBe(FAKE);
    expect(call()).toBe(FAKE);
    expect(warn).toHaveBeenCalledTimes(1);
  });

  it("never invokes the real thunk when creds are absent", () => {
    process.env.NODE_ENV = "test";
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const real = vi.fn(() => REAL);
    resolveAdapter({
      credsPresent: false,
      fake: () => FAKE,
      real,
      seam: "row-lazy-real",
    });
    expect(real).not.toHaveBeenCalled();
  });
});
