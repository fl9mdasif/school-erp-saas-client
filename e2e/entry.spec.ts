import { expect, test } from "@playwright/test";
import { mockSession } from "./helpers/auth";

const json = (data: unknown, status = 200) => ({
  status,
  contentType: "application/json",
  body: JSON.stringify(status < 400 ? { success: true, data } : data),
});

test.describe("entry flows", () => {
  test("the home page loads on a phone with no horizontal scroll", async ({ page }) => {
    await page.route("**/api/v1/public/platform/plans", (r) =>
      r.fulfill(json([{ _id: "1", code: "starter", name: "Starter", priceMonthly: 150000, studentCap: 150, features: { csvImport: true, marksheetPdf: true, customDomain: false } }]))
    );
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });

  test("signup normalizes the address, checks it, and lands in the dashboard", async ({ page }) => {
    await page.route("**/api/v1/auth/slug-available**", (r) => {
      const slug = new URL(r.request().url()).searchParams.get("slug") ?? "";
      return r.fulfill(json({ normalized: slug, available: true }));
    });
    await page.route("**/api/v1/auth/register-institution", (r) =>
      r.fulfill(json({ accessToken: "t", tenant: { id: "t1", slug: "bright-model", name: "Bright Model School" } }, 201))
    );
    await mockSession(page, "admin");
    await page.context().clearCookies();

    await page.goto("/signup");
    await page.getByLabel(/Institution name|প্রতিষ্ঠানের নাম/).fill("Bright Model School");
    await page.getByRole("radio").first().click();
    await page.getByLabel(/mobile number|মোবাইল নম্বর/).fill("01712345678");
    await page.getByRole("button", { name: /Next|পরবর্তী/ }).click();

    await page.getByLabel(/Site address|সাইটের ঠিকানা/).fill("brightModel");
    await expect(page.getByText(/bright-model/).first()).toBeVisible();
    await expect(page.getByText(/is available|পাওয়া যাচ্ছে/)).toBeVisible();
    await page.getByRole("button", { name: /Next|পরবর্তী/ }).click();

    await page.getByLabel(/Your name|আপনার নাম/).fill("Head Teacher");
    await page.getByLabel(/Your email|আপনার ইমেইল/).fill("head@example.com");
    await page.getByLabel(/^Password|^পাসওয়ার্ড/).fill("Passw0rd!long");
    await page.getByRole("checkbox").check();
    await page.getByRole("button", { name: /Create my institution|আমার প্রতিষ্ঠান তৈরি করুন/ }).click();
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("a wrong password shows one generic message", async ({ page }) => {
    await page.route("**/api/v1/auth/login", (r) =>
      r.fulfill(json({ success: false, code: "INVALID_CREDENTIALS", message: "Invalid login details" }, 401))
    );
    await page.route("**/api/v1/auth/refresh", (r) => r.fulfill(json({ success: false, code: "SESSION_INVALID", message: "x" }, 401)));
    await page.goto("/schools/bright-model/login");
    await page.getByLabel(/Email, mobile|ইমেইল, মোবাইল/).fill("someone@example.com");
    await page.getByLabel(/^Password|^পাসওয়ার্ড/).fill("wrong-password");
    await page.getByRole("button", { name: /^Sign in$|^সাইন ইন$/ }).click();
    await expect(page.getByText(/not correct|সঠিক নয়/)).toBeVisible();
  });
});
