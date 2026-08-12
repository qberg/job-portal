import path from "node:path";
import type { NextConfig } from "next";
import { env } from "./src/shared/config/env"; // boot-validate env (ADR-0026)

const nextConfig: NextConfig = {
  allowedDevOrigins: ["*.ngrok-free.app", "https://*.loca.lt"],
  cacheComponents: true,
  // Absolute is safe across the Docker path shift: build rewrites it to a distDir-relative
  // path in required-server-files.json (next/dist/build/index.js:1001 path.relative).
  // cacheHandlers: {
  //   default: path.join(import.meta.dirname, "cache-handlers/default.mjs"),
  // },
  // experimental: {
  //   viewTransition: true,
  // },
  images: {
    remotePatterns: [
      new URL("https://jpassets.minsky.studio/**"),
      new URL("https://img.youtube.com/**"),
      new URL("https://i.ytimg.com/**"),
    ],
  },
  // Self-contained server for Docker; trace from the monorepo root.
  output: "standalone",
  // sharp's @img/* libvips is a DYNAMIC require the tracer drops in the pruned Docker
  // build (works locally) -> force it into standalone or SSR image opt ERR_DLOPEN_FAILEDs.
  // outputFileTracingIncludes: {
  //   "/**": [
  //     "../../node_modules/.pnpm/sharp@*/node_modules/sharp/**/*",
  //     "../../node_modules/.pnpm/@img+*/node_modules/@img/**/*",
  //   ],
  // },
  outputFileTracingRoot: path.join(import.meta.dirname, "../../"),
  // Same-origin citizen auth (ADR-0044): proxy to apps/api so the cookie is
  // first-party. Only /api/citizen-auth — RSC oRPC hits api directly.
  rewrites() {
    return Promise.resolve([
      {
        destination: `${env.API_INTERNAL_URL}/api/citizen-auth/:path*`,
        source: "/api/citizen-auth/:path*",
      },
    ]);
  },
  // Payload local API (ADR-0026): keep core + native deps out of RSC bundle.
  serverExternalPackages: [
    // "payload",
    // "@payloadcms/db-postgres",
    // "@payloadcms/richtext-lexical",
    // "sharp",
    "graphql",
    "postgres",
    "pino",
    "pino-pretty",
  ],
  transpilePackages: [
    "@jp/tribune",
    // "@jp/observability",
    "@jp/logger",
    // "@jp/formatting",
  ],
};

export default nextConfig;
