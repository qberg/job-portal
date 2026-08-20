"use client";

import { Button } from "@jp/tribune/components/button";
import { Text } from "@jp/tribune/components/text";
import { useLingui } from "@lingui/react/macro";
import { ArrowRight } from "iconsax-reactjs";
import type { SignInPhase } from "./sign-in.machine";

export function SubmitFooter({
  phase,
  disabled,
}: {
  phase: SignInPhase;
  disabled: boolean;
}) {
  const { t } = useLingui();
  const label: Record<SignInPhase, string> = {
    otp: t`Verify`,
    phone: t`Send OTP`,
    resending: t`Verify`,
    sending: t`Sending…`,
    verifying: t`Verifying…`,
  };

  return (
    <footer className="flex flex-col items-center gap-2 px-6 pb-6">
      <Button
        className="w-full md:w-auto md:min-w-48"
        disabled={disabled}
        intent="destructive"
        size="lg"
        type="submit"
      >
        {label[phase]}
        <ArrowRight color="var(--tbn-icon-inverse)" size={18} />
      </Button>
      <Text as="p" size="label-4" variant="tertiary">
        Powered by Villivakkam MLA Office
      </Text>
    </footer>
  );
}
