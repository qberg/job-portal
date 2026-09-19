import { LinguiClientProvider } from "@jp/i18n/client";
import { notFound } from "next/navigation";
import { type ReactNode, ViewTransition } from "react";
import { activate } from "../../../shared/i18n/activate";
import {
  type Locale,
  LocaleProvider,
} from "../../../shared/i18n/locale-context";
import { StampTrans } from "../../../shared/i18n/tolgee-in-context/stamp-trans";
import { PortalProviders } from "./providers";

const locales = ["en", "ta"] as const satisfies readonly Locale[];
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}
export const isLocale = (value: string): value is Locale =>
  (locales as readonly string[]).includes(value);

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    notFound();
  }

  const i18n = activate(locale);
  const tolgeeInContext = process.env.NODE_ENV !== "production";
  return (
    <html lang={locale}>
      <body>
        <LocaleProvider locale={locale}>
          <LinguiClientProvider
            initialLocale={locale}
            initialMessages={i18n.messages}
            {...(tolgeeInContext ? { defaultComponent: StampTrans } : {})}
          >
            <PortalProviders>
              <ViewTransition
                default="none"
                enter={{
                  default: "none",
                  "locale-switch": "locale-fade",
                  "nav-back": "nav-back",
                  "nav-forward": "nav-forward",
                }}
                exit={{
                  default: "none",
                  "locale-switch": "locale-fade",
                  "nav-back": "nav-back",
                  "nav-forward": "nav-forward",
                }}
              >
                {children}
              </ViewTransition>
            </PortalProviders>
          </LinguiClientProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
