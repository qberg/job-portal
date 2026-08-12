// Structural mirror of better-auth's SecondaryStorage (it lives in @better-auth/core/db,
// a transitive dep we don't declare). betterAuth() accepts it structurally.
export type AuthSecondaryStorage = {
  get: (key: string) => Promise<string | null>;
  getAndDelete: (key: string) => Promise<string | null>;
  set: (key: string, value: string, ttl?: number) => Promise<void>;
  delete: (key: string) => Promise<void>;
  increment: (key: string, ttl: number) => Promise<number>;
};

// Prefixed so @jp/cache's invalidatePrefix (SCAN+UNLINK over `db:*`) can never evict a
// live session, and so the two auth instances can share one Valkey without key collision.
export const STAFF_AUTH_PREFIX = "ba:staff:";
export const CITIZEN_AUTH_PREFIX = "ba:citizen:";

// exactOptionalPropertyTypes: omit the key entirely when absent, never pass undefined.
export function secondaryStorageOption(storage?: AuthSecondaryStorage) {
  return storage ? { secondaryStorage: storage } : {};
}
