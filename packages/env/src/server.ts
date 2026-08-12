import * as v from "valibot";

export const nodeEnvSchema = v.object({
  NODE_ENV: v.optional(
    v.picklist(["development", "production", "test"]),
    "development"
  ),
});

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

export const authSchema = v.object({
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
