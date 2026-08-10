import type { Logger } from "@jp/logger";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { schema } from "./schema/registry";
import type { Database } from "./types";

const DB_POOL_MAX = 10;
const DB_IDLE_TIMEOUT_SEC = 30;
const DB_CONNECT_TIMEOUT_SEC = 10;
const STATEMENT_TIMEOUT_MS = 30_000;

export type DatabaseConfig = {
  url: string;
  ssl?: boolean;
  maxConn?: number;
  idleTimeout?: number;
  connectTimeout?: number;
};

export function createClient(
  config: DatabaseConfig,
  logger: Logger
): postgres.Sql {
  const client = postgres(config.url, {
    connect_timeout: config.connectTimeout ?? DB_CONNECT_TIMEOUT_SEC,
    // postgres-js sends `connection: {...}` entries as startup parameters, statement_timeout
    // typed number (ms) — postgres@3.4.8 README.md:1008-1010 + types/index.d.ts:335
    connection: { statement_timeout: STATEMENT_TIMEOUT_MS },
    idle_timeout: config.idleTimeout ?? DB_IDLE_TIMEOUT_SEC,
    max: config.maxConn ?? DB_POOL_MAX,
    ssl: config.ssl ? "require" : false,
  });

  logger.info(
    { subsystem: "db" },
    "[DB] ACQUIRING LOCK // POSTGRES CONNECTING"
  );

  return client;
}

export function createDb(client: postgres.Sql): Database {
  return drizzle(client, { schema });
}
