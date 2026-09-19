"use client";

import { Text } from "@jp/tribune/components/text";
import { useLingui } from "@lingui/react/macro";
import { useWaitPhrase } from "../../../shared/lib/use-wait-phrase";
import type { SignInFailure } from "./sign-in.machine";

// Every code maps to copy; the default keeps an unknown failure from going silent.
function useErrorText(failure: SignInFailure): string {
  const { t } = useLingui();
  const wait = useWaitPhrase(failure.retryAfterSecs ?? 0);
  switch (failure.code) {
    case "invalid_phone":
      return t`Enter a valid 10-digit mobile number.`;
    case "send_failed":
      return t`Could not send the code. Please try again.`;
    case "send_cooldown":
      return t`A code was just sent. You can request another in ${wait}.`;
    case "send_daily_cap":
      return t`Daily limit for codes reached. Try again in ${wait}.`;
    case "send_ip_cap":
      return t`Too many attempts from your network. Try again in ${wait}.`;
    case "invalid_otp":
      return t`Enter the 6-digit code.`;
    case "otp_incorrect":
      return t`That code didn't match. Check the SMS and try again.`;
    case "otp_expired":
      return t`This code has expired. Tap Resend below for a new one.`;
    case "otp_attempts":
      return t`Too many tries. Request a fresh code to continue.`;
    case "network":
      return t`You're offline. Check your connection and try again.`;
    case "verify_failed":
      return t`Incorrect or expired code. Please try again.`;
    default:
      return t`Something went wrong. Please try again.`;
  }
}

export function FormError({ error }: { error: SignInFailure | null }) {
  if (error === null) {
    return null;
  }
  return <FormErrorText failure={error} />;
}

function FormErrorText({ failure }: { failure: SignInFailure }) {
  const text = useErrorText(failure);
  return (
    <Text className="text-center" role="alert" variant="destructive">
      {text}
    </Text>
  );
}
