"use client";

import { type Messages, setupI18n } from "@lingui/core";
import { I18nProvider, type TransRenderProps } from "@lingui/react";
import { type ComponentType, type ReactNode, useEffect, useState } from "react";
import type { Locale } from "./locales";

// Hydrates the server-activated locale into client components via React context.
export function LinguiClientProvider({
  children,
  initialLocale,
  initialMessages,
  defaultComponent,
}: {
  children: ReactNode;
  initialLocale: Locale;
  initialMessages: Messages;
  defaultComponent?: ComponentType<TransRenderProps>;
}) {
  const [i18n] = useState(() =>
    setupI18n({
      locale: initialLocale,
      messages: { [initialLocale]: initialMessages },
    })
  );

  // Single instance re-activated in place — a client locale switch changes props, not identity.
  useEffect(() => {
    i18n.loadAndActivate({ locale: initialLocale, messages: initialMessages });
  }, [i18n, initialLocale, initialMessages]);

  return (
    <I18nProvider
      i18n={i18n}
      {...(defaultComponent ? { defaultComponent } : {})}
    >
      {children}
    </I18nProvider>
  );
}
