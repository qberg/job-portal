import { schema } from "@jp/database/schema";
import type { Database } from "@jp/database/types";
// import { Roles } from "@jp/domain-types/modules/access/roles";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
// import { admin, openAPI } from "better-auth/plugins";
// import { createAccessControl } from "better-auth/plugins/access";
// import { adminAc, defaultStatements } from "better-auth/plugins/admin/access";
// import { captureReset } from "./invite";
import { secondaryStorageOption } from "./secondary-storage";
import type { AuthConfig } from "./types";

// Coarse AC: registers role names + admin-plugin capability only (account-lifecycle
// endpoints). Domain authz is ABAC via @jp/auth/can. See ADR 0017.
// const ac = createAccessControl(defaultStatements);
// const roles = {
//   [Roles.SUPER_ADMIN]: adminAc,
//   [Roles.ADMIN]: adminAc,
//   [Roles.INTERNAL_USER]: ac.newRole({}),
// };

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

    // emailAndPassword: {
    //   enabled: true,
    //   requireEmailVerification: false,
    //   resetPasswordTokenExpiresIn: 60 * 60 * 24 * 7,
    //   sendResetPassword: ({ url, token }) => {
    //     captureReset(token, url);
    //     return Promise.resolve();
    //   },
    // },

    // plugins: [
    //   openAPI(),
    //   admin({
    //     ac,
    //     roles,
    //     defaultRole: Roles.INTERNAL_USER,
    //   }),
    // ],
  });
}
