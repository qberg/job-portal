"use client";

import { Field } from "@jp/tribune/components/field";
import { OtpInput } from "@jp/tribune/components/otp-input";
import { Trans } from "@lingui/react/macro";
import { ResendRow } from "./resend-row";
import { useResendCountdown } from "./use-resend-countdown";

const RESEND_COOLDOWN_SECS = 30;

export function OtpStep({
  value,
  onChange,
  disabled,
  invalid,
  otpSendCount,
  onResend,
}: {
  value: string;
  onChange: (next: string) => void;
  disabled: boolean;
  invalid: boolean;
  otpSendCount: number;
  onResend: () => void;
}) {
  const resendSecondsLeft = useResendCountdown(
    RESEND_COOLDOWN_SECS,
    otpSendCount
  );

  return (
    <div className="flex flex-col gap-3">
      <Field.Root>
        <Field.Label htmlFor="otp">
          <Trans>Enter OTP</Trans>
        </Field.Label>
        <OtpInput
          disabled={disabled}
          id="otp"
          invalid={invalid}
          length={6}
          onChange={onChange}
          value={value}
        />
      </Field.Root>
      <ResendRow onResend={onResend} secondsLeft={resendSecondsLeft} />
    </div>
  );
}
