import { schema } from "@jp/database/schema";
import type { Database } from "@jp/database/types";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { secondaryStorageOption } from "./secondary-storage";
import type { AuthConfig } from "./types";

export function createAuth(config: AuthConfig, db: Database) {
  return betterAuth({
    advanced: {
      ipAddress: {
        ipAddressHeaders: ["cf-connecting-ip"],
      },
    },
    baseURL: config.baseURL,
    database: drizzleAdapter(db, {
      provider: "pg",
      schema: {
        account: schema.account,
        session: schema.session,
        user: schema.user,
        verification: schema.verification,
      },
    }),

    ...secondaryStorageOption(config.secondaryStorage),
    secret: config.secret,
    // Postgres stays the session source of truth; secondaryStorage is a cache in front.
    // Omit this and better-auth stores sessions in Valkey ALONE (internal-adapter.mjs:227).
    session: { storeSessionInDatabase: true },
    trustedOrigins: config.trustedOrigins,
    // Omit this and a reset token lives in Valkey ALONE — with secondaryStorage set,
    // createVerificationValue skips the DB row (internal-adapter.mjs:581-588, with-hooks.mjs:25).
    verification: { storeInDatabase: true },
  });
}
