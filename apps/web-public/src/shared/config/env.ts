import { parseEnv } from "@jp/env/parse";
import { nodeEnvSchema } from "@jp/env/server";
import * as v from "valibot";

// Server-only env for the public site. SITE_URL backs metadataBase + hreflang.
const schema = v.object({
  ...nodeEnvSchema.entries,
  // Internal apps/api origin for RSC oRPC reads + the /api/citizen-auth rewrite
  // (ADR-0044). Server-only — never NEXT_PUBLIC (browser stays same-origin).
  API_INTERNAL_URL: v.pipe(v.string(), v.url()),
});

export type Env = v.InferOutput<typeof schema>;
export const env: Env = parseEnv(schema, process.env);
