import { parseEnv } from "@jp/env/parse";
import { nodeEnvSchema } from "@jp/env/server";
import * as v from "valibot";

// Server-only env for the public site. SITE_URL backs metadataBase + hreflang.
const schema = v.object({
  ...nodeEnvSchema.entries,
  // ...observabilitySchema.entries,
  // Internal apps/api origin for RSC oRPC reads + the /api/citizen-auth rewrite
  // (ADR-0044). Server-only — never NEXT_PUBLIC (browser stays same-origin).
  API_INTERNAL_URL: v.pipe(v.string(), v.url()),
  // CMS_SERVER_URL: v.optional(v.pipe(v.string(), v.url())),
  // Geocoding key, proxied through /portal/api/location/* so it never ships to
  // the browser — unlike the tiles key, which the GL canvas forces us to expose.
  // OLA_API_KEY: v.pipe(v.string(), v.nonEmpty()),
  // A/B wizard split % bucketed into `single` (ADR-0048 §4); absent -> 50. Ramp = redeploy.
  EXPERIMENT_WIZARD_SPLIT: v.optional(
    v.pipe(
      v.string(),
      v.transform(Number),
      v.number(),
      v.integer(),
      v.minValue(0),
      v.maxValue(100)
    ),
    "50"
  ),
  // Draft preview (ADR-0026). PREVIEW_SECRET must match the CMS; CMS_SERVER_URL is
  // the Payload admin origin that posts live-preview messages. Absent -> preview off.
  PREVIEW_SECRET: v.optional(v.string()),
  SITE_URL: v.pipe(v.string(), v.url()),
});

export type Env = v.InferOutput<typeof schema>;
export const env: Env = parseEnv(schema, process.env);
