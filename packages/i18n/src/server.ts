import { type Messages, setupI18n } from "@lingui/core";
import { setI18n } from "@lingui/react/server";
import { cache } from "react";
import type { Locale } from "./locales";

type LoadMessages = (locale: Locale) => Messages;

// App injects its own compiled-catalog loader (catalogs are per-app, not in this package).
export function createI18nServer(loadMessages: LoadMessages) {
  const getI18nInstance = cache((locale: Locale) =>
    setupI18n({ locale, messages: { [locale]: loadMessages(locale) } })
  );

  // Call once per request (RSC): builds + binds the i18n instance for server components.
  const activate = (locale: Locale) => {
    const i18n = getI18nInstance(locale);
    setI18n(i18n);
    return i18n;
  };

  return { activate, getI18nInstance };
}
