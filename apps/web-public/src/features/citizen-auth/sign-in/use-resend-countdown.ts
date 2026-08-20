"use client";

import { useEffect, useState } from "react";

// Restarts whenever `restartKey` changes (fresh OTP-step entry); 0 = not started.
export function useResendCountdown(
  durationSecs: number,
  restartKey: number
): number {
  // Lazy-init to the full cooldown when already started, so the actionable
  // resend link never flashes for one frame before the effect arms the timer.
  const [secondsLeft, setSecondsLeft] = useState(() =>
    restartKey === 0 ? 0 : durationSecs
  );

  useEffect(() => {
    if (restartKey === 0) {
      return;
    }
    setSecondsLeft(durationSecs);
    const id = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(id);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [restartKey, durationSecs]);

  return secondsLeft;
}
