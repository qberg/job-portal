"use client";

import { useLingui } from "@lingui/react/macro";

const HOUR_SECS = 3600;
const MINUTE_SECS = 60;

// Ceil so we never promise a retry sooner than the server allows; shared by
// every rate-limit denial surface (sign-in, voice capture, petition register).
export function useWaitPhrase(secs: number): string {
  const { t } = useLingui();
  if (secs >= HOUR_SECS) {
    const hours = Math.ceil(secs / HOUR_SECS);
    return hours === 1 ? t`about an hour` : t`about ${hours} hours`;
  }
  if (secs >= MINUTE_SECS) {
    const minutes = Math.ceil(secs / MINUTE_SECS);
    return minutes === 1 ? t`about a minute` : t`about ${minutes} minutes`;
  }
  return t`a few seconds`;
}
