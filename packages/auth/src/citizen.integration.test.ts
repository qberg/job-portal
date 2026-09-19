import { createClient, createDb } from "@jp/database/client";
import { schema } from "@jp/database/schema";
import { testDatabaseUrl } from "@jp/database/test/db-url";
import { logger } from "@jp/logger";
import { eq } from "drizzle-orm";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { createCitizenAuth } from "./citizen";

const databaseUrl = testDatabaseUrl();

const client = createClient(
  {
    url: databaseUrl,
  },
  logger
);

const db = createDb(client);

describe("Citizen authentication integration", () => {
  const phoneNumber = "+919999999999";
  const secondPhoneNumber = "+918888888888";

  let otp: string | undefined;
  const verifiedPhones: Array<{ phoneNumber: string; userId: string }> = [];

  const auth = createCitizenAuth(
    {
      baseURL: "http://localhost:3000",
      secret: "test-secret-that-is-long-enough-for-better-auth",
      trustedOrigins: ["http://localhost:3000"],
    },
    db,
    {
      onPhoneVerified: ({ phoneNumber: verifiedPhone, userId }) => {
        verifiedPhones.push({ phoneNumber: verifiedPhone, userId });
      },
      sendOTP: ({ code }) => {
        otp = code;
      },
    }
  );

  beforeEach(async () => {
    otp = undefined;
    verifiedPhones.length = 0;

    await Promise.all(
      [phoneNumber, secondPhoneNumber].map(async (phone) => {
        const existingUsers = await db
          .select()
          .from(schema.citizenUser)
          .where(eq(schema.citizenUser.phoneNumber, phone));

        await Promise.all(
          existingUsers.map((user) =>
            db
              .delete(schema.citizenSession)
              .where(eq(schema.citizenSession.userId, user.id))
          )
        );

        await db
          .delete(schema.citizenVerification)
          .where(eq(schema.citizenVerification.identifier, phone));

        await db
          .delete(schema.citizenUser)
          .where(eq(schema.citizenUser.phoneNumber, phone));
      })
    );
  });

  afterAll(async () => {
    await client.end();
  });

  it("requests a code, verifies the code, creates a citizen user, and creates a session", async () => {
    await auth.api.sendPhoneNumberOTP({
      body: {
        phoneNumber,
      },
    });

    expect(otp).toHaveLength(6);

    if (!otp) {
      throw new Error("OTP was not sent");
    }

    const result = await auth.api.verifyPhoneNumber({
      body: {
        code: otp,
        phoneNumber,
      },
    });

    expect(result.user.phoneNumber).toBe(phoneNumber);
    expect(result.user.phoneNumberVerified).toBe(true);

    const users = await db
      .select()
      .from(schema.citizenUser)
      .where(eq(schema.citizenUser.phoneNumber, phoneNumber));
    const sessions = await db
      .select()
      .from(schema.citizenSession)
      .where(eq(schema.citizenSession.userId, result.user.id));

    expect(users).toHaveLength(1);
    expect(users[0]?.id).toBe(result.user.id);
    expect(users[0]?.email).toBe(`${phoneNumber}@citizen.job.local`);
    expect(users[0]?.name).toBe(phoneNumber);
    expect(sessions).toHaveLength(1);
    expect(sessions[0]?.userId).toBe(result.user.id);
    expect(verifiedPhones).toEqual([
      {
        phoneNumber,
        userId: result.user.id,
      },
    ]);
  });

  it("rejects an incorrect code without creating a citizen user or session", async () => {
    await auth.api.sendPhoneNumberOTP({
      body: {
        phoneNumber,
      },
    });

    await expect(
      auth.api.verifyPhoneNumber({
        body: {
          code: "000000",
          phoneNumber,
        },
      })
    ).rejects.toThrow();

    const users = await db
      .select()
      .from(schema.citizenUser)
      .where(eq(schema.citizenUser.phoneNumber, phoneNumber));
    const sessions = await db.select().from(schema.citizenSession);

    expect(users).toHaveLength(0);
    expect(sessions).toHaveLength(0);
    expect(verifiedPhones).toEqual([]);
  });

  it("logs in a returning citizen without creating a duplicate user", async () => {
    await auth.api.sendPhoneNumberOTP({
      body: {
        phoneNumber: secondPhoneNumber,
      },
    });

    if (!otp) {
      throw new Error("OTP was not sent");
    }

    const firstLogin = await auth.api.verifyPhoneNumber({
      body: {
        code: otp,
        phoneNumber: secondPhoneNumber,
      },
    });

    otp = undefined;

    await auth.api.sendPhoneNumberOTP({
      body: {
        phoneNumber: secondPhoneNumber,
      },
    });

    if (!otp) {
      throw new Error("OTP was not sent");
    }

    const secondLogin = await auth.api.verifyPhoneNumber({
      body: {
        code: otp,
        phoneNumber: secondPhoneNumber,
      },
    });

    const users = await db
      .select()
      .from(schema.citizenUser)
      .where(eq(schema.citizenUser.phoneNumber, secondPhoneNumber));
    const sessions = await db
      .select()
      .from(schema.citizenSession)
      .where(eq(schema.citizenSession.userId, firstLogin.user.id));

    expect(secondLogin.user.id).toBe(firstLogin.user.id);
    expect(users).toHaveLength(1);
    expect(sessions).toHaveLength(2);
    expect(verifiedPhones).toEqual([
      {
        phoneNumber: secondPhoneNumber,
        userId: firstLogin.user.id,
      },
      {
        phoneNumber: secondPhoneNumber,
        userId: firstLogin.user.id,
      },
    ]);
  });
});
