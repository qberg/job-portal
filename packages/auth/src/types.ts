import type { createAuth } from "./create";
import type { AuthSecondaryStorage } from "./secondary-storage";

export type AuthConfig = {
  /** Min 32-char random string. Corresponds to AUTH_SECRET env var. */
  secret: string;
  /** Canonical base URL of the API server (e.g. http://localhost:3001). */
  baseURL: string;
  /** Origins allowed to make cross-site auth requests (e.g. admin SPA). */
  trustedOrigins: string[];
  /** Valkey-backed KV. Absent = in-memory rate limiter, lost on restart. */
  secondaryStorage?: AuthSecondaryStorage;
};

// Derive the instance type so Session/User always track the real shape.
type AuthInstance = ReturnType<typeof createAuth>;

export type Session = AuthInstance["$Infer"]["Session"];
export type User = AuthInstance["$Infer"]["Session"]["user"];
