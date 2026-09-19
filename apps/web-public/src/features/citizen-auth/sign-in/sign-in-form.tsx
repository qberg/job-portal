"use client";

import { Container } from "@jp/tribune/components/container";
import type React from "react";
import { useCallback, useState } from "react";
import { PageScroll } from "../../../shared/ui/page-scroll";
import { FormError } from "./form-error";
import { OtpStep } from "./otp-step";
import { PhoneField } from "./phone-field";
import { signInPhase } from "./sign-in.machine";
import { SignInHeader } from "./sign-in-header";
import { SubmitFooter } from "./submit-footer";
import { useSignIn } from "./use-sign-in";

export function SignInForm() {
  const { state, send } = useSignIn();
  // Local controlled-input state; machine context only stores validated/submitted values.
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");

  const phase = signInPhase(state);
  // Covers success too (phase maps it to verifying) so the OTP view stays
  // mounted until the post-verify redirect — no phone-field flash.
  const isOtpStep =
    phase === "otp" || phase === "resending" || phase === "verifying";
  const { error, otpSendCount } = state.context;

  const submit = useCallback(() => {
    if (isOtpStep) {
      send({ otp, type: "SUBMIT_OTP" });
      return;
    }
    send({ phone, type: "SUBMIT_PHONE" });
  }, [isOtpStep, otp, phone, send]);

  const editPhone = useCallback(() => {
    setOtp("");
    send({ type: "EDIT_PHONE" });
  }, [send]);

  const primaryDisabled = isOtpStep
    ? otp.length !== 6 || phase === "verifying"
    : phone.length !== 10 || phase === "sending";

  const handleSubmit = useCallback(
    (e: React.SubmitEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!primaryDisabled) {
        submit();
      }
    },
    [primaryDisabled, submit]
  );

  const handleResend = useCallback(() => send({ type: "RESEND" }), [send]);

  return (
    <form className="flex min-h-0 flex-1 flex-col" onSubmit={handleSubmit}>
      <PageScroll>
        <div className="flex flex-col gap-8 py-16">
          {/* Two measures, per Figma: the header reads wider (640) than the
              form column (352). Same 20px gutter, both centered. */}
          <Container gutter="outside" size="measure">
            <SignInHeader />
          </Container>
          <Container
            className="flex flex-col gap-8"
            gutter="outside"
            size="narrow"
          >
            <FormError error={error} />
            <PhoneField
              disabled={phase !== "phone"}
              locked={isOtpStep}
              onChange={setPhone}
              onEdit={editPhone}
              value={phone}
            />
            {!!isOtpStep && (
              <OtpStep
                disabled={phase === "verifying"}
                invalid={error !== null}
                onChange={setOtp}
                onResend={handleResend}
                otpSendCount={otpSendCount}
                value={otp}
              />
            )}
          </Container>
        </div>
      </PageScroll>
      <SubmitFooter disabled={primaryDisabled} phase={phase} />
    </form>
  );
}
