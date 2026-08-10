import type { Logger } from "@jp/logger";
import type postgres from "postgres";
import { createClient, createDb, type DatabaseConfig } from "./client";
import type { Database } from "./types";

export type InitDatabaseOptions = DatabaseConfig & { logger: Logger };

let _client: postgres.Sql | null = null;
let _db: Database | null = null;

export function getDb(): Database {
  if (!_db) {
    throw new Error(
      "[DB] ERR: getDb() called before initDatabase(). " +
        "Ensure initDatabase() runs before importing route handlers."
    );
  }
  return _db;
}

export function initDatabase({
  logger,
  ...config
}: InitDatabaseOptions): Database {
  _client = createClient(config, logger);
  _db = createDb(_client);
  logger.info(
    { subsystem: "db" },
    "[DB] BOOTSTRAPPED // POSTGRES CLIENT ACQUIRED"
  );
  return _db;
}

export async function closeDb(): Promise<void> {
  if (_client) {
    await _client.end();
    _client = null;
    _db = null;
  }
}
