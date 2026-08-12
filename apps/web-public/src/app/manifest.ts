import type { MetadataRoute } from "next";

// --color-brand-500 (packages/tribune/src/styles/tokens/colors.css:13) --
// "Figma-true anchor", oklch(0.443184 0.181862 29.2339) -> srgb #a00000.
const BRAND_RED = "#a00000";

// App-root, locale-agnostic (PWA manifest has one name across locales) -- icons
// generated from public/favicon.png via ImageMagick, see build report.
export default function manifest(): MetadataRoute.Manifest {
  return {
    background_color: BRAND_RED,
    display: "standalone",
    icons: [
      { sizes: "192x192", src: "/icons/icon-192.png", type: "image/png" },
      { sizes: "512x512", src: "/icons/icon-512.png", type: "image/png" },
    ],
    name: "Namma Aadhav, Namma Villivakkam",
    short_name: "Namma Aadhav",
    start_url: "/",
    theme_color: BRAND_RED,
  };
}
