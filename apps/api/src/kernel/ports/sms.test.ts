import { afterEach, describe, expect, it, vi } from "vitest";

const originalNodeEnv = process.env.NODE_ENV;
const mockEnv: { SMS_PROVIDER?: string | undefined } = {};

vi.mock("../../env", () => ({
  env: mockEnv,
}));

afterEach(() => {
  process.env.NODE_ENV = originalNodeEnv;
  mockEnv.SMS_PROVIDER = undefined;
  vi.restoreAllMocks();
  vi.resetModules();
});

describe("resolveAdapter", () => {
  it("uses the real adapter when credentials are present", async () => {
    const { resolveAdapter } = await import("./sms");
    const real = vi.fn(() => "real");
    const fake = vi.fn(() => "fake");

    const adapter = resolveAdapter({
      credsPresent: true,
      fake,
      real,
      seam: "sms",
    });

    expect(adapter).toBe("real");
    expect(real).toHaveBeenCalledOnce();
    expect(fake).not.toHaveBeenCalled();
  });

  it("uses the fake adapter outside production and warns once per seam", async () => {
    process.env.NODE_ENV = "test";
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const { resolveAdapter } = await import("./sms");
    const real = vi.fn(() => "real");
    const fake = vi.fn(() => "fake");

    const first = resolveAdapter({
      credsPresent: false,
      fake,
      real,
      seam: "sms",
    });
    const second = resolveAdapter({
      credsPresent: false,
      fake,
      real,
      seam: "sms",
    });

    expect(first).toBe("fake");
    expect(second).toBe("fake");
    expect(real).not.toHaveBeenCalled();
    expect(fake).toHaveBeenCalledTimes(2);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledWith(
      "[sms] required credentials unset -- using in-memory Fake"
    );
  });

  it("refuses the fake adapter in production when credentials are missing", async () => {
    process.env.NODE_ENV = "production";
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const { resolveAdapter } = await import("./sms");
    const real = vi.fn(() => "real");
    const fake = vi.fn(() => "fake");

    expect(() =>
      resolveAdapter({
        credsPresent: false,
        fake,
        real,
        seam: "sms",
      })
    ).toThrow(
      "[sms] misconfigured: required credentials unset; refusing the Fake fallback in production"
    );
    expect(real).not.toHaveBeenCalled();
    expect(fake).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
  });
});

describe("createFakeSms", () => {
  it("logs the destination and message", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => undefined);
    const { createFakeSms } = await import("./sms");

    const sendSms = createFakeSms();
    await sendSms("+919999999999", "Your OTP is 123456");

    expect(log).toHaveBeenCalledWith(
      "[FAKE SMS] To +919999999999: Your OTP is 123456"
    );
  });
});

describe("resolveSms", () => {
  it("returns the fake SMS adapter when SMS_PROVIDER is unset outside production", async () => {
    process.env.NODE_ENV = "test";
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const log = vi.spyOn(console, "log").mockImplementation(() => undefined);
    const { resolveSms } = await import("./sms");

    const sendSms = resolveSms();
    await sendSms("+919999999999", "Your OTP is 123456");

    expect(warn).toHaveBeenCalledWith(
      "[sms] required credentials unset -- using in-memory Fake"
    );
    expect(log).toHaveBeenCalledWith(
      "[FAKE SMS] To +919999999999: Your OTP is 123456"
    );
  });

  it("fails explicitly when SMS_PROVIDER is set but no real provider is implemented", async () => {
    process.env.NODE_ENV = "production";
    mockEnv.SMS_PROVIDER = "twilio";
    const { resolveSms } = await import("./sms");

    expect(() => resolveSms()).toThrow("SMS provider is not configured");
  });
});
