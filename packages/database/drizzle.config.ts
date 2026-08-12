import process from "node:process";
import { parseEnv } from "@jp/env/parse";
import { databaseSchema } from "@jp/env/server";
import { defineConfig } from "drizzle-kit";

process.loadEnvFile(".env");
const { DATABASE_URL } = parseEnv(databaseSchema, process.env);

export default defineConfig({
  casing: "snake_case",
  dbCredentials: {
    url: DATABASE_URL,
  },
  dialect: "postgresql",
  // Keeps PostGIS-owned tables (spatial_ref_sys) out of the diff, else every generate drops them.
  extensionsFilters: ["postgis"],
  out: "./drizzle",
  schema: "./src/schema/**/*.schema.ts",
  strict: true,
  verbose: true,
});
