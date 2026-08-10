import { ORPCError } from "@orpc/client";
import { describe, expect, it } from "vitest";
import { parseRateLimitError } from "./rate-limit-error";

describe("parseRateLimitError", () => {
  it("returns null for a non-ORPC error", () => {
    expect(parseRateLimitError(new Error("boom"))).toBeNull();
  });

  it("maps SERVICE_UNAVAILABLE to unavailable", () => {
    expect(parseRateLimitError(new ORPCError("SERVICE_UNAVAILABLE"))).toEqual({
      kind: "unavailable",
    });
  });

  it("maps TOO_MANY_REQUESTS with retryAfterSecs to quota", () => {
    const error = new ORPCError("TOO_MANY_REQUESTS", {
      data: { retryAfterSecs: 42 },
    });
    expect(parseRateLimitError(error)).toEqual({
      kind: "quota",
      retryAfterSecs: 42,
    });
  });

  it("returns null for TOO_MANY_REQUESTS with malformed data", () => {
    const error = new ORPCError("TOO_MANY_REQUESTS", {
      data: { retryAfterSecs: "soon" },
    });
    expect(parseRateLimitError(error)).toBeNull();
  });

  it("returns null for an unrelated ORPC code", () => {
    expect(parseRateLimitError(new ORPCError("UNAUTHORIZED"))).toBeNull();
  });
});
