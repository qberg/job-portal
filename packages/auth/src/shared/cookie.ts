// Shared cookie attributes for every better-auth instance (staff + citizen).
// Mirrors apm's shared/cookie.ts so both trust domains agree on cookie hardening.
export const sharedCookieConfig = {
  httpOnly: true,
  sameSite: "strict",
  secure: true,
} as const;
