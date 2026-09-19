import { logger } from "@jp/logger";
import type Redis from "ioredis";

// Structural mirror of better-auth's SecondaryStorage (it lives in @better-auth/core/db,
// a transitive dep we don't declare). betterAuth() accepts it structurally.
export type AuthSecondaryStorage = {
  get: (key: string) => Promise<string | null>;
  getAndDelete: (key: string) => Promise<string | null>;
  set: (key: string, value: string, ttl?: number) => Promise<void>;
  delete: (key: string) => Promise<void>;
  increment: (key: string, ttl: number) => Promise<number>;
};

export const CITIZEN_AUTH_PREFIX = "ba:citizen:";

// exactOptionalPropertyTypes: omit the key entirely when absent, never pass undefined.
export function secondaryStorageOption(storage?: AuthSecondaryStorage) {
  return storage ? { secondaryStorage: storage } : {};
}

type CachedSessionRef = { token: string };

function parseSessionRefs(raw: string): CachedSessionRef[] {
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as CachedSessionRef[]) : [];
  } catch {
    return [];
  }
}

// A user/role write that bypasses better-auth leaves its cached session blobs stale, and
// no FK constrains Valkey — so the writer must purge them, as better-auth does internally.
export async function purgeCachedSessions(
  client: Redis,
  prefix: string,
  userId: string
): Promise<number> {
  const listKey = `${prefix}active-sessions-${userId}`;
  const raw = await client.get(listKey);
  if (!raw) {
    return 0;
  }

  const tokens = parseSessionRefs(raw)
    .map((ref) => ref.token)
    .filter(Boolean);
  await client.unlink(...tokens.map((token) => `${prefix}${token}`), listKey);
  return tokens.length;
}

// Revocation walks this index to delete each cached blob, then drops the index itself
// (node_modules/better-auth/dist/db/internal-adapter.mjs:396-400) — a null orphans them.
const SESSION_INDEX_PREFIX = "active-sessions-";

export function createRedisSecondaryStorage(
  client: Redis,
  prefix: string
): AuthSecondaryStorage {
  const k = (key: string): string => `${prefix}${key}`;
  const log = logger.child({ prefix, subsystem: "auth-cache" });

  return {
    // NOT swallowed: a swallowed delete leaves a revoked session live in cache until TTL.
    delete: async (key) => {
      await client.del(k(key));
    },
    // Session-blob null falls through to the session table under storeSessionInDatabase
    // (create.ts:31, citizen.ts:37 — internal-adapter.mjs:226-227); the index has no such path.
    get: async (key) => {
      try {
        return await client.get(k(key));
      } catch (err) {
        if (key.startsWith(SESSION_INDEX_PREFIX)) {
          throw err;
        }
        log.warn(
          { err },
          "[AUTH] CACHE READ FAILED // FALLING THROUGH TO POSTGRES"
        );
        return null;
      }
    },

    // Consumes single-use verification values, so a null reads as "wrong code" for a right OTP.
    // Unused while verification.storeInDatabase is on (internal-adapter.mjs:656 → DB branch).
    getAndDelete: (key) => client.getdel(k(key)),

    // EXPIRE only on the first hit, so a rolling window can't be extended indefinitely
    // by the very requests it is meant to reject.
    increment: async (key, ttl) => {
      try {
        const count = await client.incr(k(key));
        if (count === 1) {
          await client.expire(k(key), ttl);
        }
        return count;
      } catch (err) {
        // Declared FAIL-OPEN (mirrors the kernel OTP gate): better-auth's prod limiter awaits
        // this bare in the router (better-auth/dist/api/rate-limiter/index.mjs:224,343-344).
        log.warn({ err }, "[AUTH] RATE-LIMIT INCR FAILED // FAIL-OPEN");
        return 0;
      }
    },
    // Index writes rethrow like index reads: a swallowed index SET + succeeding blob SET
    // (createSession, internal-adapter.mjs:206→215) = orphan blob revocation can't find.
    set: async (key, value, ttl) => {
      try {
        await (ttl
          ? client.set(k(key), value, "EX", ttl)
          : client.set(k(key), value));
      } catch (err) {
        if (key.startsWith(SESSION_INDEX_PREFIX)) {
          throw err;
        }
        log.warn(
          { err },
          "[AUTH] CACHE WRITE FAILED // SESSION SERVED FROM POSTGRES"
        );
      }
    },
  };
}
