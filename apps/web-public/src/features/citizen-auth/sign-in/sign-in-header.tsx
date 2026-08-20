import { Heading } from "@jp/tribune/components/heading";
import { Text } from "@jp/tribune/components/text";
import { Trans } from "@lingui/react/macro";

export function SignInHeader() {
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <Heading as="h1" family="serif" size="heading-2" variant="accent">
        <Trans>Verify Identity</Trans>
      </Heading>
      <Text as="p" size="label-3" variant="primary">
        <Trans>
          Instant mobile verification to eliminate insecure passwords.
        </Trans>
      </Text>
    </div>
  );
}
