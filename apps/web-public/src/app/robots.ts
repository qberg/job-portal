// import { locales } from "@jp/i18n/locales";
import type { MetadataRoute } from "next";
import { env } from "../shared/config/env";

// Temporary fix
const locales = ["en"];

// /portal omitted on purpose: it serves `robots: {index:false}`, and a Disallow would
// block the crawl that reads that tag, leaving linked portal URLs stuck in the index.

export default function robots(): MetadataRoute.Robots {
  const disallow = locales.flatMap((locale) => [
    `/${locale}/debug`,
    `/${locale}/api/`,
  ]);

  return {
    rules: { disallow: [...disallow, "/api/"], userAgent: "*" },
    sitemap: `${env.SITE_URL}/sitemap.xml`,
  };
}
