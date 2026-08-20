import { getAuth } from "@jp/auth/init";
import { getCitizenAuth } from "@jp/auth/init-citizen";
import * as Sentry from "@sentry/node";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { env } from "./env";
import { createContext } from "./kernel/orpc/context";
import { rpcHandler } from "./kernel/orpc/handlers";

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

// isolated citizen-auth instance, distinct basePath (ADR-0025)
app.on(["POST", "GET"], "/api/citizen-auth/*", (c) =>
  getCitizenAuth().handler(c.req.raw)
);

app.get("/health", (c) =>
  c.json({
    memory_usage_mb: Math.round(process.memoryUsage().rss / 1024 / 1024),
    status: "ok",
    uptime_seconds: Math.floor(process.uptime()),
  })
);

app.get("/", (c) => c.json({ message: "Backend is working fine" }));

app.all("/rpc/*", async (c, next) => {
  const result = await rpcHandler.handle(c.req.raw, {
    context: createContext(c),
    prefix: "/rpc",
  });

  if (result.matched) {
    return c.newResponse(result.response.body, result.response);
  }

  await next();
});

// crash lane: oRPC translates its own errors-as-values, so anything here is unexpected.
app.onError((err, c) => {
  Sentry.captureException(err);
  return c.json({ error: "internal_error" }, 500);
});
