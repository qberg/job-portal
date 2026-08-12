import pino from "pino";

const isDev = process.env.NODE_ENV !== "production";
const level = process.env.LOG_LEVEL ?? "info";

export const logger: pino.Logger = pino(
  { level },
  isDev
    ? pino.transport({
        options: {
          colorize: true,
          ignore: "pid,hostname",
          translateTime: "SYS:standard",
        },
        target: "pino-pretty",
      })
    : undefined
);

export function createLogger(bindings: Record<string, unknown>): pino.Logger {
  return logger.child(bindings);
}

export type Logger = pino.Logger;
