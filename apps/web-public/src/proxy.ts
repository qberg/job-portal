// import { ROUTE_REGISTRY } from "@jp/cms/route-registry";
// import { isLocale, locales, sourceLocale } from "@jp/i18n/locales";
// import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
// // import { LOCALE_COOKIE } from "./shared/i18n/locale-cookie";
// import { applyNoindex, seoIsNoindexed } from "./shared/seo/noindex";

// // Parses Accept-Language honoring q-values, returns the highest-ranked active locale.
// function negotiate(header: string | null): string {
//   if (header === null) {
//     return sourceLocale;
//   }
//   const ranked = header
//     .split(",")
//     .map((part) => {
//       const [tag, ...params] = part.trim().split(";");
//       const q = params.find((p) => p.startsWith("q="));
//       const quality = q ? Number.parseFloat(q.slice(2)) : 1;
//       return {
//         base: tag?.split("-")[0] ?? "",
//         quality: Number.isNaN(quality) ? 0 : quality,
//       };
//     })
//     .sort((a, b) => b.quality - a.quality);
//   return ranked.find((entry) => isLocale(entry.base))?.base ?? sourceLocale;
// }

// // better-auth cookiePrefix "pm-citizen"; https deploys get the __Secure- variant.
// const CITIZEN_SESSION_COOKIES = [
//   "pm-citizen.session_token",
//   "__Secure-pm-citizen.session_token",
// ];

// const hasCitizenSessionCookie = (request: NextRequest): boolean =>
//   CITIZEN_SESSION_COOKIES.some((name) =>
//     Boolean(request.cookies.get(name)?.value)
//   );

// function isPortalPath(pathname: string, locale: string): boolean {
//   const portalRoot = ROUTE_REGISTRY.citizenDashboard.path(locale);
//   return pathname === portalRoot || pathname.startsWith(`${portalRoot}/`);
// }

// // Sensitive doc → no-store (web.dev "Back/forward cache"): historically bars bfcache;
// // Chrome 2025 admits it but evicts on cookie change, which sign-out triggers either way.
// function noStore(response: NextResponse): NextResponse {
//   response.headers.set("Cache-Control", "no-store");
//   return response;
// }

// // Optimistic presence check, NOT validity: kills the portal-skeleton flash for
// // signed-out visitors before the PPR shell paints; the RSC gate stays authoritative.
// function portalGate(request: NextRequest, locale: string): NextResponse | null {
//   const { pathname, search } = request.nextUrl;
//   const signInPath = ROUTE_REGISTRY.citizenSignIn.path(locale);
//   if (!isPortalPath(pathname, locale) || pathname.startsWith(signInPath)) {
//     return null;
//   }
//   if (hasCitizenSessionCookie(request)) {
//     return null;
//   }
//   const url = request.nextUrl.clone();
//   url.pathname = signInPath;
//   url.search = `?redirect=${encodeURIComponent(pathname + search)}`;
//   return NextResponse.redirect(url);
// }

// function localeScoped(request: NextRequest, locale: string): NextResponse {
//   const gated = portalGate(request, locale);
//   if (gated !== null) {
//     return gated;
//   }
//   const passthrough = NextResponse.next();
//   return isPortalPath(request.nextUrl.pathname, locale)
//     ? noStore(passthrough)
//     : passthrough;
// }

// function route(request: NextRequest): NextResponse {
//   const { pathname } = request.nextUrl;
//   const pathLocale = locales.find(
//     (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
//   );
//   if (pathLocale !== undefined) {
//     return localeScoped(request, pathLocale);
//   }

//   const cookie = request.cookies.get(LOCALE_COOKIE)?.value;
//   const locale =
//     cookie !== undefined && isLocale(cookie)
//       ? cookie
//       : negotiate(request.headers.get("accept-language"));
//   const url = request.nextUrl.clone();
//   url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
//   return NextResponse.redirect(url);
// }

// // Next 16 middleware→proxy: locale-less paths keep their path, gain the negotiated locale.
// export function proxy(request: NextRequest): NextResponse {
//   return applyNoindex(route(request), seoIsNoindexed());
// }

// // Skip Next internals, API routes, and any path with a file extension (assets,
// // favicon, .well-known) so only navigable pages get locale-redirected.
// export const config = {
//   matcher: ["/((?!api|_next|.*\\..*).*)"],
// };

// Just a temporary function to make the frontend up and running
export function proxy() {
  return NextResponse.next();
}
