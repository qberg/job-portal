import * as v from "valibot";

export const nodeEnvSchema = v.object({
  NODE_ENV: v.optional(
    v.picklist(["development", "production", "test"]),
    "development"
  ),
});

// Crash lane (ADR-0048): DSN unset -> Sentry off. RELEASE tags every event.
// export const observabilitySchema = v.object({
//   GLITCHTIP_DSN: v.optional(v.string()),
//   RELEASE: v.optional(v.string()),
// });

// Deployment identity, orthogonal to NODE_ENV's build-mode role: staging runs
// NODE_ENV=production to mirror prod, so a separate signal marks the staging box.
// export const appEnvSchema = v.object({
//   APP_ENV: v.optional(
//     v.picklist(["development", "staging", "production"]),
//     "production"
//   ),
// });

const splitCsv = (s: string): string[] => {
  const trimmed = s.trim();
  if (trimmed === "") {
    return [];
  }
  return trimmed.split(",").map((x) => x.trim());
};

export const databaseSchema = v.object({
  DATABASE_URL: v.pipe(v.string(), v.nonEmpty()),
});

// export const redisSchema = v.object({
//   REDIS_URL: v.pipe(v.string(), v.nonEmpty()),
// });

// Asset storage (ADR-0019): each group all-or-nothing; bucket unset -> fake adapter.
// export const storageSchema = v.object({
//   R2_BUCKET: v.optional(v.string()),
//   // Environment segment for R2 keys (one bucket shared across envs). Defaults to
//   // `dev` so an unset prod never silently writes into another env's namespace.
//   R2_PREFIX: v.optional(v.string(), "dev"),
//   R2_ACCESS_KEY_ID: v.optional(v.string()),
//   R2_SECRET_ACCESS_KEY: v.optional(v.string()),
//   R2_ENDPOINT: v.optional(v.string()),
//   R2_PUBLIC_URL: v.optional(v.string()),
//   SPACES_BUCKET: v.optional(v.string()),
//   SPACES_REGION: v.optional(v.string()),
//   SPACES_ENDPOINT: v.optional(v.string()),
//   SPACES_ACCESS_KEY_ID: v.optional(v.string()),
//   SPACES_SECRET_ACCESS_KEY: v.optional(v.string()),
// });

// type StorageEnv = v.InferOutput<typeof storageSchema>;

// export const r2AllOrNothing = (e: StorageEnv): boolean =>
//   !e.R2_BUCKET ||
//   Boolean(
//     e.R2_ACCESS_KEY_ID &&
//       e.R2_SECRET_ACCESS_KEY &&
//       e.R2_ENDPOINT &&
//       e.R2_PUBLIC_URL
//   );

// export const spacesAllOrNothing = (e: StorageEnv): boolean =>
//   !e.SPACES_BUCKET ||
//   Boolean(
//     e.SPACES_REGION &&
//       e.SPACES_ENDPOINT &&
//       e.SPACES_ACCESS_KEY_ID &&
//       e.SPACES_SECRET_ACCESS_KEY
//   );

// WhatsApp Cloud API creds (ADR-0044/0045). Optional: absent in dev = sink path;
// the api composition root requires them outside development.
// export const whatsappSchema = v.object({
//   WHATSAPP_PHONE_NUMBER_ID: v.optional(v.string()),
//   WHATSAPP_ACCESS_TOKEN: v.optional(v.string()),
//   WHATSAPP_GRAPH_VERSION: v.optional(v.string(), "v22.0"),
// });

// MSG91 SMS creds (ADR-0076 S1). Optional: absent = dev-log fake; the api
// composition root resolves this via resolveAdapter, no per-flow env vars.
// export const msg91Schema = v.object({
//   MSG91_AUTH_KEY: v.optional(v.string()),
//   MSG91_SENDER_ID: v.optional(v.string(), "AAAVOC"),
// });

// Provider status webhooks (ADR-0076 S3). Optional per provider: absent = the webhook
// route returns 503 (not configured). Set to enable signature/secret verification.
// export const notificationWebhookSchema = v.object({
//   WA_APP_SECRET: v.optional(v.string()),
//   WA_WEBHOOK_VERIFY_TOKEN: v.optional(v.string()),
//   MSG91_WEBHOOK_SECRET: v.optional(v.string()),
// });

// STT vendor creds (ADR-0007). Optional: absent = Fake adapter (dev/tests);
// STT_MODEL_ID overrides the default Scribe model after the Tanglish bake-off (#63).
// export const sttSchema = v.object({
//   ELEVENLABS_API_KEY: v.optional(v.string()),
//   STT_MODEL_ID: v.optional(v.string()),
// });

// Batch transcribe staging (ADR-0050 §6): "off" skips intake.transcribe outbox jobs.
// export const intakeTranscribeSchema = v.object({
//   INTAKE_BATCH_TRANSCRIBE: v.optional(v.picklist(["on", "off"]), "on"),
// });

// LLM structured-output creds (ADR-0052). Absent = Fake adapter (dev/tests);
// OPENAI_MODEL is required at resolve when the key is present (never hardcoded).
// export const llmSchema = v.object({
//   OPENAI_API_KEY: v.optional(v.string()),
//   OPENAI_MODEL: v.optional(v.string()),
// });

// Search read-model (ADR-0056). Both apps/api (list read path) and apps/worker
// (indexer) need these for real; unset -> Fake provider (dev/tests only).
// export const meiliSchema = v.object({
//   MEILI_URL: v.optional(v.string()),
//   MEILI_MASTER_KEY: v.optional(v.string()),
// });

// Canonical public site origin (web-public); backs the notification trackUrl.
// Same var the public site + CMS already use; dev default matches the root .env.
// export const publicSiteSchema = v.object({
//   SITE_URL: v.optional(v.pipe(v.string(), v.url()), "http://localhost:3000"),
// });

export const authSchema = v.object({
  // Web-admin origin: destination of the staff set-password invite link (ADR-0057).
  ADMIN_APP_URL: v.pipe(v.string(), v.nonEmpty()),
  AUTH_BASE_URL: v.pipe(v.string(), v.nonEmpty()),
  AUTH_SECRET: v.pipe(v.string(), v.minLength(32)),
  AUTH_TRUSTED_ORIGINS: v.pipe(
    v.optional(v.string(), ""),
    v.transform(splitCsv)
  ),
});

// Citizen auth = isolated better-auth instance (ADR-0025): own secret, shared
// baseURL (AUTH_BASE_URL), distinct basePath (/api/citizen-auth).
export const citizenAuthSchema = v.object({
  CITIZEN_AUTH_SECRET: v.pipe(v.string(), v.minLength(32)),
  CITIZEN_AUTH_TRUSTED_ORIGINS: v.pipe(
    v.optional(v.string(), ""),
    v.transform(splitCsv)
  ),
});

// Social import (ADR-0062): fetch-at-save only. `syndication` is keyless and cannot
// read follower counts; `x-api` is pay-per-use and needs a bearer, all-or-nothing.
// export const socialImportSchema = v.pipe(
//   v.object({
//     SOCIAL_IMPORT_PROVIDER: v.optional(
//       v.picklist(["syndication", "x-api", "fake"]),
//       "syndication"
//     ),
//     X_API_BEARER: v.optional(v.string()),
//   }),
//   v.check(
//     (env) =>
//       env.SOCIAL_IMPORT_PROVIDER !== "x-api" || Boolean(env.X_API_BEARER),
//     "SOCIAL_IMPORT_PROVIDER=x-api requires X_API_BEARER -- set the bearer or pick another provider."
//   )
// );

// Video import (ADR-0065): fetch-at-save validator only, keyless. `oembed` is the sole
// real adapter -- no paid provider exists because nothing stored requires a refresh.
// export const videoImportSchema = v.object({
//   VIDEO_IMPORT_PROVIDER: v.optional(v.picklist(["oembed", "fake"]), "oembed"),
// });

// Media transformations (ADR-0088 A1): path to the owned ffmpeg binary. Unset = Fake,
// which resolveAdapter refuses in production.
// export const mediaTransformSchema = v.object({
//   FFMPEG_PATH: v.optional(v.string()),
// });

// Print token secret (#111): HMAC key for the short-lived print bearer the worker
// hands the headless renderer. Prod requires it; dev falls back (apps/api env.ts).
export const printTokenSchema = v.object({
  PRINT_TOKEN_SECRET: v.optional(v.string()),
});

// Print render origin (#111): web-admin base the worker's headless Chromium visits
// (`${PRINT_BASE_URL}/print/<reportId>?token=`). Unset -> report.render seam refuses.
// export const printRenderSchema = v.object({
//   PRINT_BASE_URL: v.optional(v.string()),
// });

// Web push VAPID identity (ADR-0094 D8). apps/api serves the public key to the browser;
// apps/worker needs all three to sign. Unset -> Fake, which resolveAdapter refuses in prod.
// export const webPushSchema = v.object({
//   VAPID_PUBLIC_KEY: v.optional(v.string()),
//   VAPID_PRIVATE_KEY: v.optional(v.string()),
//   VAPID_SUBJECT: v.optional(v.string()),
// });
