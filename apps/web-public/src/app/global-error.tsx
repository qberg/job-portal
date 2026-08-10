"use client";

import { captureException } from "@sentry/react";
import { useEffect } from "react";

// crash lane (ADR-0048): last-resort boundary; two root layouts mean no shared
// parent, so this replaces the document when an uncaught error bubbles to the root.
export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    captureException(error);
  }, [error]);
  return (
    <html lang="en">
      <body>
        <p>Something went wrong. Please reload the page.</p>
      </body>
    </html>
  );
}
