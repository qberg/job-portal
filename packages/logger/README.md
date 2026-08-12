# @jp/logger

Pino-based logger: pretty (colorized) in development, JSON in production.
Log level controlled via `LOG_LEVEL` env var (default `"info"`).
Use `createLogger(bindings)` to get a child logger with fixed context fields.
