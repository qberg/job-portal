import { serve } from "@hono/node-server";
import type { CitizenAuthOpts, SendCitizenOtp } from "@jp/auth/citizen-types";
import { initCitizenAuth } from "@jp/auth/init-citizen";
import {
  CITIZEN_AUTH_PREFIX,
  createRedisSecondaryStorage,
} from "@jp/auth/secondary-storage";
import { initDatabase } from "@jp/database/init";
import { logger } from "@jp/logger";
import Redis from "ioredis";
import { env } from "./env";

// boot order is load-bearing: infra singletons must be ready before app.ts resolves getDb()/getAuth()/etc.
initDatabase({ logger, url: env.DATABASE_URL });
// initAuth({
//   secret: env.AUTH_SECRET,
//   baseURL: env.AUTH_BASE_URL,
//   trustedOrigins: env.AUTH_TRUSTED_ORIGINS,
// });

// Fail closed (ADR-0045): OTP must reach the citizen or sign-in must error.
const sendCitizenOtp: SendCitizenOtp = ({ phoneNumber, code }) => {
  console.log(`OTP for ${phoneNumber}: ${code}`);
};

const citizenOpts: CitizenAuthOpts = {
  sendOTP: sendCitizenOtp,
};

initCitizenAuth(
  {
    baseURL: env.AUTH_BASE_URL,
    secondaryStorage: createRedisSecondaryStorage(
      new Redis(env.REDIS_URL),
      CITIZEN_AUTH_PREFIX
    ),
    secret: env.CITIZEN_AUTH_SECRET,
    trustedOrigins: env.CITIZEN_AUTH_TRUSTED_ORIGINS,
  },
  citizenOpts
);
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
