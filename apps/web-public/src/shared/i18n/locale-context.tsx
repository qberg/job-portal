"use client";

import { createContext, type ReactNode, useContext } from "react";

export const Locales = {
  EN: "en",
  TA: "ta",
} as const;
export type Locale = (typeof Locales)[keyof typeof Locales];

const LocaleContext = createContext<Locale | null>(null);

// Locale flows down by context, never `useParams()` — that's a request-time API and
// under [id]/[slug] it can't resolve at shell prerender (cacheComponents blocking-route).
export function LocaleProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: ReactNode;
}) {
  return (
    <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>
  );
}

export function useLocale(): Locale {
  const locale = useContext(LocaleContext);
  if (locale === null) {
    throw new Error("useLocale must be used within a LocaleProvider");
  }
  return locale;
}
