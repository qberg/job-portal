import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import type { schema } from "./schema/registry";

export type Database = PostgresJsDatabase<typeof schema>;

export type DatabaseTransaction = Parameters<
  Parameters<Database["transaction"]>[0]
>[0];

export type DbOrTx = Database | DatabaseTransaction;
