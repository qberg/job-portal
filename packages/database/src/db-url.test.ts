import { afterEach, describe, expect, it } from "vitest";
import { testDatabaseUrl } from "./test/db-url";

const originalTestDatabaseUrl = process.env.TEST_DATABASE_URL;
const defaultTestDatabaseUrl =
  "postgresql://postgres:postgres@localhost:5432/job_portal_test";

afterEach(() => {
  process.env.TEST_DATABASE_URL = originalTestDatabaseUrl;
});

describe("testDatabaseUrl", () => {
  it("returns the default test database URL when TEST_DATABASE_URL is unset", () => {
    delete process.env.TEST_DATABASE_URL;

    expect(testDatabaseUrl()).toBe(defaultTestDatabaseUrl);
  });

  it("returns TEST_DATABASE_URL when it points at a test database", () => {
    const url = "postgresql://postgres:postgres@localhost:5432/custom_test";
    process.env.TEST_DATABASE_URL = url;

    expect(testDatabaseUrl()).toBe(url);
  });

  it("rejects a database name that does not end with _test", () => {
    process.env.TEST_DATABASE_URL =
      "postgresql://postgres:postgres@localhost:5432/job_portal";

    expect(() => testDatabaseUrl()).toThrow(
      '[test-db] refusing to run: database "job_portal" does not end in "_test".'
    );
  });
});
