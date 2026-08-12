import type { createCitizenAuth } from "./citizen";
import type { AuthSecondaryStorage } from "./secondary-storage";

export type CitizenAuthConfig = {
  // distinct from staff AUTH_SECRET — separate secret means a citizen token can't be validated by staff auth
  secret: string;
  baseURL: string;
  trustedOrigins: string[];
  // Valkey-backed KV; absent = in-memory rate limiter, lost on every restart
  secondaryStorage?: AuthSecondaryStorage;
};

// OTP transport seam injected at boot; phone is the identity, WhatsApp/SMS are interchangeable (ADR-0001/0008)
export type SendCitizenOtp = (params: {
  readonly phoneNumber: string;
  readonly code: string;
}) => Promise<void> | void;

// Fires after every phone verification (ADR-0087 OTP bridge);
// Kept optional so the auth package stays module-free.
export type OnCitizenPhoneVerified = (params: {
  readonly userId: string;
  readonly phoneNumber: string;
}) => Promise<void> | void;

export type CitizenAuthOpts = {
  sendOTP: SendCitizenOtp;
  onPhoneVerified?: OnCitizenPhoneVerified;
};

type CitizenAuthInstance = ReturnType<typeof createCitizenAuth>;

export type CitizenSession = CitizenAuthInstance["$Infer"]["Session"];
export type CitizenUser = CitizenAuthInstance["$Infer"]["Session"]["user"];
