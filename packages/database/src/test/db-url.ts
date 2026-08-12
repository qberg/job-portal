const DEFAULT_TEST_URL =
  "postgresql://postgres:postgres@localhost:5432/job_portal_test";
const LEADING_SLASH = /^\//;

// Never falls back to DATABASE_URL (dev DB): truncating tests must only hit a *_test database.
export function testDatabaseUrl(): string {
  const url = process.env.TEST_DATABASE_URL ?? DEFAULT_TEST_URL;
  const name = new URL(url).pathname.replace(LEADING_SLASH, "");
  if (!name.endsWith("_test")) {
    throw new Error(
      `[test-db] refusing to run: database "${name}" does not end in "_test". ` +
        "Point TEST_DATABASE_URL at a dedicated test database."
    );
  }
  return url;
}
