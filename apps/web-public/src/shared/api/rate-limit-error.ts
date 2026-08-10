import { ORPCError } from "@orpc/client";
import * as v from "valibot";

export type RateLimitDenial =
  | { kind: "quota"; retryAfterSecs: number }
  | { kind: "unavailable" };

const TooManyRequestsData = v.object({ retryAfterSecs: v.number() });

// Next docs/01-app/01-getting-started/10-error-handling.md: expected server-function
// errors model as return values, not throws — callers return this, never rethrow.
export function parseRateLimitError(error: unknown): RateLimitDenial | null {
  if (!(error instanceof ORPCError)) {
    return null;
  }
  if (error.code === "SERVICE_UNAVAILABLE") {
    return { kind: "unavailable" };
  }
  if (error.code === "TOO_MANY_REQUESTS") {
    const parsed = v.safeParse(TooManyRequestsData, error.data);
    return parsed.success
      ? { kind: "quota", retryAfterSecs: parsed.output.retryAfterSecs }
      : null;
  }
  return null;
}
