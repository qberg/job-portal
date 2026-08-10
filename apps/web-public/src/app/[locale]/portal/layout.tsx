// import "../../portal.css";
// import { msg } from "@lingui/core/macro";
// import { LinguiClientProvider } from "@jp/i18n/client";
// import { isLocale, locales } from "@jp/i18n/locales";
// import type { Metadata } from "next";
// import { notFound } from "next/navigation";
// import { NuqsAdapter } from "nuqs/adapters/next/app";
// import { type ReactNode, Suspense, ViewTransition } from "react";
// import { ReportProblem } from "../../../features/support/report-problem/report-problem";
// import { activate } from "../../../shared/i18n/activate";
// import { LocaleProvider } from "../../../shared/i18n/locale-context";
// import { LocaleSync } from "../../../shared/i18n/locale-sync";
// import { TolgeeAltClickBridge } from "../../../shared/i18n/tolgee-in-context/alt-click-bridge";
// import { StampTrans } from "../../../shared/i18n/tolgee-in-context/stamp-trans";
// import { SiteChrome } from "../../../widgets/site-chrome/site-chrome";
// import { PortalProviders } from "./providers";

// // Separate root from (marketing): admin surface in its own document, no html-zoom.
// export function generateStaticParams() {
//   return locales.map((locale) => ({ locale }));
// }

// // Citizen portal is behind auth and carries no crawlable content -- kept out of the
// // index entirely (robots.ts also disallows /portal per locale as a second layer).
// export async function generateMetadata({
//   params,
// }: {
//   params: Promise<{ locale: string }>;
// }): Promise<Metadata> {
//   const { locale } = await params;
//   if (!isLocale(locale)) {
//     notFound();
//   }
//   const i18n = activate(locale);
//   const brand = i18n._(msg`Namma Aadhav`);

//   return {
//     title: `${i18n._(msg`Citizen Portal`)} · ${brand}`,
//     robots: { index: false },
//   };
// }

// export default async function PortalLayout({
//   children,
//   params,
// }: {
//   children: ReactNode;
//   params: Promise<{ locale: string }>;
// }) {
//   const locale = "en"
//   const { locale } = await params;
//   if (!isLocale(locale)) {
//     notFound();
//   }

//   const i18n = activate(locale);
//   const tolgeeInContext = process.env.NODE_ENV !== "production";

//   return (
//     <html lang={locale}>
//       <body>
//         <Suspense fallback={null}>
//           <LocaleSync />
//         </Suspense>
//         {tolgeeInContext && <TolgeeAltClickBridge />}
//         <LocaleProvider locale={locale}>
//           <LinguiClientProvider
//             initialLocale={locale}
//             initialMessages={i18n.messages}
//             {...(tolgeeInContext ? { defaultComponent: StampTrans } : {})}
//           >
//             <NuqsAdapter>
//               <PortalProviders>
//                 <div className="flex h-dvh flex-col">
//                   <div
//                     className="shrink-0"
//                     style={{ viewTransitionName: "portal-nav" }}
//                   >
//                     <SiteChrome locale={locale} portal />
//                   </div>
//                   <main className="flex min-h-0 flex-1 flex-col bg-tbn-bg-surface-secondary">
//                     {/* Untyped navs (tabs, back gesture, router.back) get no page
//                      slide — the shared jobs-* morph alone carries continuity. */}
//                     <ViewTransition
//                       default="none"
//                       enter={{
//                         "nav-forward": "nav-forward",
//                         "nav-back": "nav-back",
//                         "locale-switch": "locale-fade",
//                         default: "none",
//                       }}
//                       exit={{
//                         "nav-forward": "nav-forward",
//                         "nav-back": "nav-back",
//                         "locale-switch": "locale-fade",
//                         default: "none",
//                       }}
//                     >
//                       {children}
//                     </ViewTransition>
//                   </main>
//                   <ReportProblem />
//                 </div>
//               </PortalProviders>
//             </NuqsAdapter>
//           </LinguiClientProvider>
//         </LocaleProvider>
//       </body>
//     </html>
//   );
// }

// Temporary fix
import { type ReactNode, ViewTransition } from "react";

const locales = ["en"];
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}
export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
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
      </body>
    </html>
  );
}
