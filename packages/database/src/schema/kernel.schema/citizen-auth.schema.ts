import { boolean, index, pgTable, text, timestamp } from "drizzle-orm/pg-core";

// Citizen auth credential: a second, isolated better-auth instance (phoneNumber
// OTP), separate from staff auth (ADR-0025). Phone is the identity; email/name are
// better-auth-core-required temp fields (signUpOnVerification), NOT rich profile —
// Voter ID / ward / demographics live in modules/citizen, linked by phone.
export const citizenUser = pgTable("citizen_user", {
  createdAt: timestamp("created_at").defaultNow().notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  id: text("id").primaryKey(),
  image: text("image"),
  name: text("name").notNull(),
  phoneNumber: text("phone_number").unique(),
  phoneNumberVerified: boolean("phone_number_verified").default(false),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const citizenSession = pgTable(
  "citizen_session",
  {
    createdAt: timestamp("created_at").defaultNow().notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    id: text("id").primaryKey(),
    ipAddress: text("ip_address"),
    token: text("token").notNull().unique(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => new Date())
      .notNull(),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => citizenUser.id, { onDelete: "cascade" }),
  },
  (table) => [index("citizen_session_userId_idx").on(table.userId)]
);

export const citizenAccount = pgTable(
  "citizen_account",
  {
    accessToken: text("access_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    accountId: text("account_id").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    id: text("id").primaryKey(),
    idToken: text("id_token"),
    password: text("password"),
    providerId: text("provider_id").notNull(),
    refreshToken: text("refresh_token"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => new Date())
      .notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => citizenUser.id, { onDelete: "cascade" }),
  },
  (table) => [index("citizen_account_userId_idx").on(table.userId)]
);

export const citizenVerification = pgTable(
  "citizen_verification",
  {
    createdAt: timestamp("created_at").defaultNow().notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    value: text("value").notNull(),
  },
  (table) => [index("citizen_verification_identifier_idx").on(table.identifier)]
);
