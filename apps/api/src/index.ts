import { serve } from "@hono/node-server";
// import type { CitizenAuthOpts, SendCitizenOtp } from "@jp/auth/citizen-types";
// import { initAuth } from "@jp/auth/init";
// import { initCitizenAuth } from "@jp/auth/init-citizen";
import { initDatabase } from "@jp/database/init";
import { logger } from "@jp/logger";
import { env } from "./env";

// earliest so boot-time exceptions are captured (ADR-0048 crash lane).
// initNode(env.GLITCHTIP_DSN, env.NODE_ENV, {
//   surface: "api",
//   ...(env.RELEASE ? { release: env.RELEASE } : {}),
// });

// boot order is load-bearing: infra singletons must be ready before app.ts resolves getDb()/getAuth()/etc.
initDatabase({ logger, url: env.DATABASE_URL });
// initCache({ url: env.REDIS_URL, logger });
// initAuth({
//   secret: env.AUTH_SECRET,
//   baseURL: env.AUTH_BASE_URL,
//   trustedOrigins: env.AUTH_TRUSTED_ORIGINS,
//   secondaryStorage: createRedisSecondaryStorage(
//     getCacheClient(),
//     STAFF_AUTH_PREFIX
//   ),
// });

// const notifier = createCitizenNotifier({
//   whatsapp: {
//     phoneNumberId: env.WHATSAPP_PHONE_NUMBER_ID,
//     accessToken: env.WHATSAPP_ACCESS_TOKEN,
//     graphVersion: env.WHATSAPP_GRAPH_VERSION,
//   },
//   sms: { authKey: env.MSG91_AUTH_KEY, senderId: env.MSG91_SENDER_ID },
//   publicBaseUrl: env.SITE_URL,
//   store: createDeliveryStore(getDb()),
//   logger,
//   onTerminalFailure: captureDeliveryFailure,
// });

// Fail closed (ADR-0045): OTP must reach the citizen or sign-in must error.
// const sendCitizenOtp: SendCitizenOtp = async ({ phoneNumber, code }) => {
//   const outcomes = await notifier.notify("otp-login", {
//     recipient: { phone: phoneNumber },
//     vars: { code },
//     locale: "en",
//   });
//   if (!outcomes.some((o) => o.outcome === "sent")) {
//     throw new Error("otp delivery failed on every channel");
//   }
// };

// const citizenOpts: CitizenAuthOpts = {
//   sendOTP: sendCitizenOtp,
//   onPhoneVerified: (params) =>
//     linkOrphansOnPhoneVerified({ getDb, logger }, params),
// };

// initCitizenAuth(
//   {
//     secret: env.CITIZEN_AUTH_SECRET,
//     baseURL: env.AUTH_BASE_URL,
//     trustedOrigins: env.CITIZEN_AUTH_TRUSTED_ORIGINS,
//     secondaryStorage: createRedisSecondaryStorage(
//       getCacheClient(),
//       CITIZEN_AUTH_PREFIX
//     ),
//   },
//   citizenOpts
// );

// dynamic import keeps route handlers from running before infra is ready
const { app } = await import("./app.js");

const server = serve(
  {
    fetch: app.fetch,
    port: env.PORT,
  },
  (info) => {
    logger.info(
      { port: info.port },
      `[jp/api] ONLINE // listening on http://localhost:${info.port}`
    );
  }
);

const shutdown = (signal: string) => {
  logger.info(`${signal} received — shutting down`);
  server.close(() => {
    logger.info("[jp/api] server closed");
    process.exit(0);
  });
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
