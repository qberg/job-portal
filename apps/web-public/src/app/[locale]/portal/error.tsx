"use client";

import { CircleInfoIcon } from "@jp/tribune/icons/circle-info";
import { captureException } from "@sentry/react";
import { useEffect } from "react";

// crash lane (ADR-0048): portal-segment boundary. Keeps SiteChrome, offers reset
// so a citizen mid-job recovers in place instead of the global blank document.
export default function PortalError({
  error,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
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
        </div>
      </div>
    </div>
  );
}
