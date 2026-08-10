import { schema } from "@jp/database/schema";
import type { Database } from "@jp/database/types";
// import { isValidForKind } from "@jp/domain-types/kernel/text-kind";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { phoneNumber } from "better-auth/plugins";
import type { CitizenAuthConfig, CitizenAuthOpts } from "./citizen-types";
import { secondaryStorageOption } from "./secondary-storage";
import { sharedCookieConfig } from "./shared/cookie";

// Unvalidated, better-auth forwards ANY string to SMS — MSG91 "succeeds" on garbage.
const IN_PHONE_PREFIX = "+91";
export function isValidCitizenPhone(phone: string): boolean {
  return phone.startsWith(IN_PHONE_PREFIX);
}

// ADR-0025: isolated citizen instance — OTP-only, distinct basePath; structural (not role-based) staff isolation.
export function createCitizenAuth(
  config: CitizenAuthConfig,
  db: Database,
  opts: CitizenAuthOpts
) {
  const { onPhoneVerified } = opts;
  return betterAuth({
    appName: "Job Portal — Job Seekers",
    basePath: "/api/citizen-auth",
    baseURL: config.baseURL,
    secret: config.secret,
    trustedOrigins: config.trustedOrigins,

    ...secondaryStorageOption(config.secondaryStorage),
    advanced: {
      // Distinct prefix from staff's default "better-auth" — same origin, so a
      // shared cookie name would let a citizen login clobber a staff session.
      cookiePrefix: "pm-citizen",
      defaultCookieAttributes: sharedCookieConfig,
      ipAddress: {
        ipAddressHeaders: ["cf-connecting-ip"],
      },
    },

    database: drizzleAdapter(db, {
      provider: "pg",
      schema: {
        account: schema.citizenAccount,
        session: schema.citizenSession,
        user: schema.citizenUser,
        verification: schema.citizenVerification,
      },
    }),

    // OTP-only: password sign-up routes are disabled to keep the OTP-first contract.
    emailAndPassword: {
      enabled: false,
    },

    plugins: [
      phoneNumber({
        allowedAttempts: 3,
        expiresIn: 300,
        // explicit — defaults match but the 6-box UI contract must not be implicit
        otpLength: 6,
        phoneNumberValidator: isValidCitizenPhone,
        sendOTP: opts.sendOTP,
        // Phone is the identity; email/name are core-required temp fields, not
        // profile. Rich Citizen (Voter ID/ward) lives in modules/citizen by phone.
        signUpOnVerification: {
          getTempEmail: (phone) => `${phone}@citizen.job.local`,
          getTempName: (phone) => phone,
        },
        // Post-verify hook (NOT signUpOnVerification, which is signup config): fires on every
        // verify — sign-up + returning login (better-auth 1.6.17 phone-number/routes.mjs:331).
        ...(onPhoneVerified
          ? {
              callbackOnVerification: ({ phoneNumber: verifiedPhone, user }) =>
                onPhoneVerified({
                  phoneNumber: verifiedPhone,
                  userId: user.id,
                }),
            }
          : {}),
      }),
    ],
    // Postgres stays the session source of truth; secondaryStorage is a cache in front.
    // Omit this and better-auth stores sessions in Valkey ALONE (internal-adapter.mjs:227).
    session: { storeSessionInDatabase: true },
    // Omit this and the OTP lives in Valkey ALONE — with secondaryStorage set,
    // createVerificationValue skips the DB row (internal-adapter.mjs:581-588, with-hooks.mjs:25).
    verification: { storeInDatabase: true },
  });
}
