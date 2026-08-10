import { expect, test } from "@playwright/test";

const LOCALE_PATH = /\/(en|ta)$/;

test("renders the English string at /en", async ({ page }) => {
  await page.goto("/en");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Job Portal of Villivakkam Constituency"
  );
});

test("renders the Tamil string at /ta", async ({ page }) => {
  await page.goto("/ta");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "மனு மேலாண்மை பொது வாயில்"
  );
});

test("redirects a locale-less path to a negotiated locale", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page).toHaveURL(LOCALE_PATH);
});
