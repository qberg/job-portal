import { provisionDatabase } from "../migrate";
import { testDatabaseUrl } from "./db-url";

export default async function setup() {
  await provisionDatabase(testDatabaseUrl());
}
