import { parseEnv } from "@jp/env/parse";
import {
  // appEnvSchema,
  authSchema,
  citizenAuthSchema,
  databaseSchema,
  //   intakeTranscribeSchema,
  //   msg91Schema,
  nodeEnvSchema,
  //   notificationWebhookSchema,
  //   observabilitySchema,
  printTokenSchema,
  //   publicSiteSchema,
  //   redisSchema,
  //   whatsappSchema,
} from "@jp/env/server";
import * as v from "valibot";

const baseSchema = v.object({
  ...nodeEnvSchema.entries,
  //   ...appEnvSchema.entries,
  PORT: v.pipe(
    v.optional(v.string(), "3001"),
    v.transform((s) => Number.parseInt(s, 10)),
    v.number()
  ),
  ...databaseSchema.entries,
  //   ...redisSchema.entries,
  ...authSchema.entries,
  ...citizenAuthSchema.entries,
  //   ...whatsappSchema.entries,
  //   ...msg91Schema.entries,
  //   ...notificationWebhookSchema.entries,
  //   ...publicSiteSchema.entries,
  //   ...observabilitySchema.entries,
  ...printTokenSchema.entries,
  //   ...intakeTranscribeSchema.entries,
  // Built SPA dir, served same-origin in prod. Relative to cwd (/app → ./public).
  STATIC_DIR: v.optional(v.string(), "./public"),
  // ADR-0094 D8/D11: unset -> FE hides push UI entirely, never throws (worker owns the
  // matching VAPID_PRIVATE_KEY for actually sending, out of this slice's scope).
  VAPID_PUBLIC_KEY: v.optional(v.string()),
});

type BaseEnv = v.InferOutput<typeof baseSchema>;

// Isolation invariant: the citizen instance must not share the staff secret.
const secretsAreIsolated = (input: BaseEnv): boolean =>
  input.CITIZEN_AUTH_SECRET !== input.AUTH_SECRET;

// Print secret is fail-closed like the storage/STT seams: production must supply it,
// dev/tests fall back (below). Unset in prod = boot crash, never a shared weak key.
const printSecretSetInProd = (input: BaseEnv): boolean =>
  input.NODE_ENV !== "production" || Boolean(input.PRINT_TOKEN_SECRET);

const schema = v.pipe(
  baseSchema,
  v.check(
    secretsAreIsolated,
    "CITIZEN_AUTH_SECRET must differ from AUTH_SECRET (auth isolation)"
  ),
  v.check(
    printSecretSetInProd,
    "PRINT_TOKEN_SECRET must be set when NODE_ENV=production"
  )
);

export type Env = v.InferOutput<typeof schema>;
export const env: Env = parseEnv(schema, process.env);

// const DEV_PRINT_TOKEN_SECRET = "dev-insecure-print-token-secret-000000000000";

// function resolvePrintTokenSecret(e: Env): string {
//   if (e.PRINT_TOKEN_SECRET) {
//     return e.PRINT_TOKEN_SECRET;
//   }
//   // biome-ignore lint/suspicious/noConsole: one-time dev-only misconfig warning
//   console.warn("[print-token] PRINT_TOKEN_SECRET unset -- using dev fallback");
//   return DEV_PRINT_TOKEN_SECRET;
// }

// export const printTokenSecret: string = resolvePrintTokenSecret(env);
