"use client";

// import { Trans } from "@lingui/react/macro";
// import { ROUTE_REGISTRY } from "@jp/cms/route-registry";
// import { Button } from "@jp/tribune/components/button";
// import { SiteHeading } from "@jp/tribune/components/site-heading";
// import { Text } from "@jp/tribune/components/text";
import { CircleInfoIcon } from "@jp/tribune/icons/circle-info";
import { captureException } from "@sentry/react";
// import { useRouter } from "next/navigation";
import { useEffect } from "react";
// import { useLocale } from "../../../shared/i18n/locale-context";

// crash lane (ADR-0048): portal-segment boundary. Keeps SiteChrome, offers reset
// so a citizen mid-job recovers in place instead of the global blank document.
export default function PortalError({
  error,
  // reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // const router = useRouter();
  // const locale = useLocale();
  // const locale = "en"

  useEffect(() => {
    captureException(error);
  }, [error]);

  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-8 px-6 text-center">
      <div className="flex flex-col items-center gap-4">
        <span className="flex size-16 items-center justify-center rounded-2xl bg-tbn-bg-surface-tertiary text-tbn-text-inverse">
          <CircleInfoIcon size={28} />
        </span>
        <div className="flex max-w-sm flex-col gap-2">
          Some Error Has Occurred.
          {/* <SiteHeading size="title-3" variant="primary">
            <Trans>Something went wrong</Trans>
          </SiteHeading> */}
          {/* <Text size="label-3" variant="secondary">
            <Trans>
              We hit a snag loading this page. Your details are safe.
            </Trans>
          </Text> */}
        </div>
      </div>
      {/* <div className="flex w-full max-w-xs flex-col gap-2">
        <Button fullWidth intent="primary" onClick={reset}>
          <Trans>Try again</Trans>
        </Button>
        <Button
          fullWidth
          intent="neutral"
          onClick={() =>
            router.push(ROUTE_REGISTRY.citizenDashboard.path(locale))
          }
          variant="ghost"
        >
          <Trans>Back to home</Trans>
        </Button>
      </div> */}
    </div>
  );
}
