import * as Sentry from "@sentry/node";
import { Hono } from "hono";

export const app = new Hono();

app.get("/health", (c) =>
  c.json({
    memory_usage_mb: Math.round(process.memoryUsage().rss / 1024 / 1024),
    status: "ok",
    uptime_seconds: Math.floor(process.uptime()),
  })
);

app.get("/", (c) => c.json({ message: "Backend is working fine" }));

// crash lane: oRPC translates its own errors-as-values, so anything here is unexpected.
app.onError((err, c) => {
  Sentry.captureException(err);
  return c.json({ error: "internal_error" }, 500);
});
