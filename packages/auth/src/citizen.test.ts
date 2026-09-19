import { describe, expect, it } from "vitest";
import { isValidCitizenPhone } from "./citizen";

describe("isValidCitizenPhone", () => {
  it("accepts Indian E.164 phone numbers", () => {
    expect(isValidCitizenPhone("+919999999999")).toBe(true);
  });

  it("rejects local 10-digit phone numbers", () => {
    expect(isValidCitizenPhone("9999999999")).toBe(false);
  });

  it("rejects non-Indian E.164 phone numbers", () => {
    expect(isValidCitizenPhone("+15555555555")).toBe(false);
  });
});
