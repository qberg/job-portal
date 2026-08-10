// import { readFile } from "node:fs/promises";
// import { serveStatic } from "@hono/node-server/serve-static";
import { getAuth } from "@jp/auth/init";
// import { getCitizenAuth } from "@jp/auth/init-citizen";
// import { getDb } from "@jp/database/init";
// import { isErr } from "@jp/domain-types/kernel/result";
// import { logger } from "@jp/logger";
import * as Sentry from "@sentry/node";
import { Hono } from "hono";
import { cors } from "hono/cors";
// import { etag } from "hono/etag";
import { env } from "./env";
// import { printTokenSecret } from "./env";
// import { ingestFunnel } from "./kernel/analytics/ingest.route";
// import { registerNotificationWebhooks } from "./kernel/notifications/webhooks.route";
// import { createContext } from "./kernel/orpc/context";
// import { openAPIHandler, rpcHandler } from "./kernel/orpc/handlers";
// import { getRateLimitClient } from "./kernel/rate-limit/client";
// import { createOtpSendDecider } from "./kernel/rate-limit/otp-send.composite";
// import {
//   createOtpSendThrottle,
//   OTP_SEND_PATH,
// } from "./kernel/rate-limit/otp-send.middleware";
// import { cacheControlFor } from "./kernel/static/cache-control";
// import { recordWaInbound } from "./modules/engagement/commands/record-wa-inbound.command";

export const app = new Hono();

// must precede all routes; handles preflight OPTIONS and cross-origin cookies (SPA 5173 → API 3001)
app.use(
  "*",
  cors({
    allowHeaders: ["Content-Type", "Authorization", "Cache-Control", "Pragma"],
    allowMethods: ["GET", "POST", "OPTIONS"],
    credentials: true,
    origin: [...env.AUTH_TRUSTED_ORIGINS, ...env.CITIZEN_AUTH_TRUSTED_ORIGINS],
  })
);

app.on(["POST", "GET"], "/api/auth/*", (c) => getAuth().handler(c.req.raw));

// Per-phone throttle, registered before the catch-all so it runs first. better-auth's
// own limiter keys on a spoofable client IP; the phone is the key an attacker can't rotate.
// app.use(
//   OTP_SEND_PATH,
//   createOtpSendThrottle(createOtpSendDecider(getRateLimitClient()), logger)
// );

// isolated citizen-auth instance, distinct basePath (ADR-0025)
// app.on(["POST", "GET"], "/api/citizen-auth/*", (c) =>
//   getCitizenAuth().handler(c.req.raw)
// );

app.get("/health", (c) =>
  c.json({
    memory_usage_mb: Math.round(process.memoryUsage().rss / 1024 / 1024),
    status: "ok",
    uptime_seconds: Math.floor(process.uptime()),
  })
);

app.get("/", (c) => c.json({ message: "Backend is working fine" }));
// app.post("/ingest/events", (c) => ingestFunnel(c));

// registerNotificationWebhooks(app, {
//   store: createDeliveryStore(getDb()),
//   logger,
//   recordInbound: async (message) => {
//     const result = await recordWaInbound(getDb(), message);
//     if (isErr(result)) {
//       logger.warn(
//         { code: result.error.code, wamid: message.id },
//         "[webhook/wa] inbound message not recorded"
//       );
//     }
//   },
//   config: {
//     waAppSecret: env.WA_APP_SECRET,
//     waVerifyToken: env.WA_WEBHOOK_VERIFY_TOKEN,
//     msg91Secret: env.MSG91_WEBHOOK_SECRET,
//   },
// });

// app.all("/rpc/*", async (c, next) => {
//   const result = await rpcHandler.handle(c.req.raw, {
//     prefix: "/rpc",
//     context: createContext(c, {
//       adminAppUrl: env.ADMIN_APP_URL,
//       printTokenSecret,
//       vapidPublicKey: env.VAPID_PUBLIC_KEY ?? null,
//       intakeBatchTranscribeEnabled: env.INTAKE_BATCH_TRANSCRIBE === "on",
//     }),
//   });

//   if (result.matched) {
//     return c.newResponse(result.response.body, result.response);
//   }

//   await next();
// });

// app.all("/docs/*", async (c, next) => {
//   const result = await openAPIHandler.handle(c.req.raw, {
//     prefix: "/docs",
//     context: createContext(c, {
//       adminAppUrl: env.ADMIN_APP_URL,
//       printTokenSecret,
//       vapidPublicKey: env.VAPID_PUBLIC_KEY ?? null,
//       intakeBatchTranscribeEnabled: env.INTAKE_BATCH_TRANSCRIBE === "on",
//     }),
//   });

//   if (result.matched) {
//     return c.newResponse(result.response.body, result.response);
//   }

//   await next();
// });

// crash lane: oRPC translates its own errors-as-values, so anything here is unexpected.
app.onError((err, c) => {
  Sentry.captureException(err);
  return c.json({ error: "internal_error" }, 500);
});

// prod only: mounted last so API routes win; static miss falls through to index.html for client routing
// if (env.NODE_ENV === "production") {
//   // ADR-0094 D4: serveStatic emits no cache headers nor validators; etag() digests streamed
//   // bodies (hono dist/middleware/etag/digest.js) so no-cache paths revalidate via 304.
//   app.use("*", etag());
//   app.use("*", async (c, next) => {
//     await next();
//     if (!c.res.headers.has("cache-control")) {
//       c.res.headers.set("cache-control", cacheControlFor(c.req.path));
//     }
//   });
//   app.use("*", serveStatic({ root: env.STATIC_DIR }));

//   const indexHtml = await readFile(`${env.STATIC_DIR}/index.html`, "utf8");
//   app.get("*", (c) => c.html(indexHtml));
// }
