"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useMachine } from "@xstate/react";
import { useRouter } from "next/navigation";
import * as v from "valibot";
import type { EventFrom, SnapshotFrom } from "xstate";
import { fromPromise } from "xstate";
import { citizenAuthClient } from "../../../shared/auth/client";
import {
  AuthCallError,
  OtpSendDenied,
  type SignInError,
  signInMachine,
} from "./sign-in.machine";

export type SignInHook = {
  state: SnapshotFrom<typeof signInMachine>;
  send: (event: EventFrom<typeof signInMachine>) => void;
};

type AuthApiError = { status: number; code?: string | undefined };

// Deny body of the API's OTP-send throttle (kernel/rate-limit); better-fetch
// spreads the parsed body into result.error alongside status.
const RateLimitBody = v.object({
  reason: v.picklist(["cooldown", "daily_cap", "ip_cap"]),
  retryAfterSecs: v.number(),
});

export function toSendError(error: AuthApiError): Error {
  if (error.status === 429) {
    const parsed = v.safeParse(RateLimitBody, error);
    if (parsed.success) {
      return new OtpSendDenied(
        parsed.output.reason,
        parsed.output.retryAfterSecs
      );
    }
  }
  if (error.code === "INVALID_PHONE_NUMBER") {
    return new AuthCallError("invalid_phone");
  }
  return new AuthCallError("send_failed");
}

// better-auth's phone-number verify codes (error-codes.mts) that map to distinct copy.
const VERIFY_ERROR_CODES: Record<string, SignInError> = {
  INVALID_OTP: "otp_incorrect",
  OTP_EXPIRED: "otp_expired",
  OTP_NOT_FOUND: "otp_expired",
  TOO_MANY_ATTEMPTS: "otp_attempts",
};

export function toVerifyError(error: AuthApiError): Error {
  const mapped = error.code ? VERIFY_ERROR_CODES[error.code] : undefined;
  return new AuthCallError(mapped ?? "verify_failed");
}

// fetch() rejects ONLY on a network failure, and only with a TypeError — never
// after a response exists — so this is the whole test, no message sniffing.
export async function callAuthEndpoint<T>(
  request: () => Promise<T>
): Promise<T> {
  try {
    return await request();
  } catch (error) {
    if (error instanceof TypeError) {
      throw new AuthCallError("network", { cause: error });
    }
    throw error;
  }
}

// better-auth returns { data, error }, never throws. Throw manually so xstate routes to onError.
async function callSendOtp(phone: string): Promise<void> {
  const result = await callAuthEndpoint(() =>
    citizenAuthClient.phoneNumber.sendOtp({ phoneNumber: `+91${phone}` })
  );
  if (result.error) {
    throw toSendError(result.error);
  }
}

async function callVerifyOtp(phone: string, otp: string): Promise<void> {
  const result = await callAuthEndpoint(() =>
    citizenAuthClient.phoneNumber.verify({
      code: otp,
      phoneNumber: `+91${phone}`,
    })
  );
  if (result.error) {
    console.error("OTP verification error:", result.error);
    throw toVerifyError(result.error);
  }
}

export function useSignIn(): SignInHook {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [state, send] = useMachine(
    signInMachine.provide({
      actions: {
        navigateToMe: () => {
          // No push: this page's own AuthGate redirects (honoring `?redirect=`)
          // once refresh() sees the new session — avoids racing a push against it.
          queryClient.clear();
          router.refresh();
        },
      },
      actors: {
        sendOtp: fromPromise<void, { phone: string }>(async ({ input }) =>
          callSendOtp(input.phone)
        ),
        verifyOtp: fromPromise<void, { phone: string; otp: string }>(
          async ({ input }) => callVerifyOtp(input.phone, input.otp)
        ),
      },
    })
  );

  return { send, state };
}
