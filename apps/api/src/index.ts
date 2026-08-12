import { serve } from "@hono/node-server";
import { initDatabase } from "@jp/database/init";
import { logger } from "@jp/logger";
import { env } from "./env";

// boot order is load-bearing: infra singletons must be ready before app.ts resolves getDb()/getAuth()/etc.
initDatabase({ logger, url: env.DATABASE_URL });

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
