import * as v from "valibot";

export const viteSchema = v.object({
  VITE_API_URL: v.optional(
    v.pipe(v.string(), v.nonEmpty()),
    "http://localhost:3001/rpc"
  ),
  VITE_AUTH_URL: v.optional(
    v.pipe(v.string(), v.nonEmpty()),
    "http://localhost:3001"
  ),
});

// Crash lane (ADR-0048): browser DSN is public; unset -> Sentry off.
export const viteObservabilitySchema = v.object({
  VITE_GLITCHTIP_DSN: v.optional(v.string()),
  VITE_RELEASE: v.optional(v.string()),
});
