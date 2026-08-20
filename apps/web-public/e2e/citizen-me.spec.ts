import { execSync } from "node:child_process";
import { expect, test } from "@playwright/test";

// OTP read from DB: better-auth phoneNumber stores plaintext as `code:attemptCount`.
const API = "http://localhost:3001";
const PG_CONTAINER = "petition-management-postgres-1";
const SIGNIN_URL = /\/en\/portal\/sign-in/;
const DASHBOARD_URL = /\/en\/portal\/me/;

function readOtp(phoneNumber: string): string {
  const sql = `select value from citizen_verification where identifier='${phoneNumber}' order by created_at desc limit 1;`;
  const out = execSync(
    `docker exec ${PG_CONTAINER} psql -U postgres -d job_portal -t -c "${sql}"`
  )
    .toString()
    .trim();
  return (out.split(":")[0] ?? "").trim();
}

async function login(
  request: import("@playwright/test").APIRequestContext,
  phoneNumber: string
): Promise<void> {
  const send = await request.post(
    `${API}/api/citizen-auth/phone-number/send-otp`,
    { data: { phoneNumber } }
  );
  expect(send.ok()).toBeTruthy();

  const verify = await request.post(
    `${API}/api/citizen-auth/phone-number/verify`,
    { data: { code: readOtp(phoneNumber), phoneNumber } }
  );
  expect(verify.ok()).toBeTruthy();
}

test("OTP login then RSC citizenMe renders the authenticated citizen", async ({
  page,
}) => {
  const phoneNumber = `+9190000${Date.now().toString().slice(-5)}`;
  await login(page.request, phoneNumber);

  await page.goto("/en/portal/me");
  await expect(page.getByTestId("citizen-id")).not.toBeEmpty();
});

test("a citizen session does not reach staff procedures", async ({ page }) => {
  const phoneNumber = `+9190001${Date.now().toString().slice(-5)}`;
  await login(page.request, phoneNumber);

  // pm-citizen cookie is invisible to staff `authed` middleware — separate better-auth instance, distinct cookie prefix
  const staff = await page.request.post(`${API}/rpc/me`, {
    headers: { "Content-Type": "application/json" },
  });
  expect(staff.status()).toBe(401);
});

test("unauthenticated /en/portal/me redirects to sign-in", async ({ page }) => {
  await page.goto("/en/portal/me");
  await expect(page).toHaveURL(SIGNIN_URL);
});

test("sign-in form: phone then OTP lands an authenticated citizen on /me", async ({
  page,
}) => {
  const digits = `90002${Date.now().toString().slice(-5)}`;
  await page.goto("/en/portal/sign-in");

  await page.locator("#phone").fill(digits);
  const sendOtp = page.getByRole("button", { name: "Send OTP" });
  await expect(sendOtp).toBeEnabled();
  await sendOtp.click();

  await expect(page.locator("#otp")).toBeVisible();
  // Segmented OTP: #otp is the first slot input; type and base-ui advances across slots.
  await page.locator("#otp").focus();
  await page.keyboard.type(readOtp(`+91${digits}`));
  await page.getByRole("button", { name: "Verify" }).click();

  await expect(page).toHaveURL(DASHBOARD_URL);
  await expect(page.getByTestId("citizen-id")).not.toBeEmpty();
});

test("sign-in form: wrong OTP shows an error and creates no session", async ({
  page,
}) => {
  const digits = `90003${Date.now().toString().slice(-5)}`;
  await page.goto("/en/portal/sign-in");

  await page.locator("#phone").fill(digits);
  const sendOtp = page.getByRole("button", { name: "Send OTP" });
  await expect(sendOtp).toBeEnabled();
  await sendOtp.click();

  await expect(page.locator("#otp")).toBeVisible();
  await page.locator("#otp").focus();
  await page.keyboard.type("000000");
  await page.getByRole("button", { name: "Verify" }).click();

  await expect(page.getByRole("alert")).toBeVisible();
  await expect(page).toHaveURL(SIGNIN_URL);
});
