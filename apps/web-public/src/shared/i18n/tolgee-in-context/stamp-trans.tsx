"use client";

import type { TransRenderProps } from "@lingui/react";

// DEV-ONLY: stamps the Lingui msgid (== Tolgee key name) onto a zero-box wrapper so
// the Alt+click bridge can resolve DOM -> Tolgee key. display:contents = no layout box.
export function StampTrans({ id, translation, children }: TransRenderProps) {
  return (
    <span data-l10n-id={id} style={{ display: "contents" }}>
      {translation ?? children}
    </span>
  );
}
