"use client";

import { Link } from "@jp/tribune/components/link";
import { SiteText } from "@jp/tribune/components/site-text";
import { Trans } from "@lingui/react/macro";

const formatCountdown = (secs: number): string => {
  const mins = Math.floor(secs / 60);
  const rem = String(secs % 60).padStart(2, "0");
  return `${mins}:${rem}`;
};

function CooldownPrompt({ secondsLeft }: { secondsLeft: number }) {
  return (
    <Trans>Didn't get a code? Resend in {formatCountdown(secondsLeft)}</Trans>
  );
}

function ResendPrompt({ onResend }: { onResend: () => void }) {
  return (
    <Trans>
      Didn't get a code?{" "}
      <Link
        onClick={onResend}
        render={<button type="button" />}
        tone="brand"
        underline="hover"
      >
        Resend code
      </Link>
    </Trans>
  );
}

// One message per state, link/countdown interpolated inline: the prompt and the
// action are a single sentence, so ta can reorder across them and it wraps as prose.
export function ResendRow({
  secondsLeft,
  onResend,
}: {
  secondsLeft: number;
  onResend: () => void;
}) {
  return (
    <SiteText
      as="p"
      className="text-balance text-center"
      size="ui-2"
      variant="tertiary"
    >
      {secondsLeft > 0 && <CooldownPrompt secondsLeft={secondsLeft} />}
      {secondsLeft === 0 && <ResendPrompt onResend={onResend} />}
    </SiteText>
  );
}
