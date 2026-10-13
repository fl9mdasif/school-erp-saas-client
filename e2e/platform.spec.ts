import { expect, test } from "@playwright/test";
import { mockSession } from "./helpers/auth";

const ok = (data: unknown) => ({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true, data }) });

const plans = [
  { _id: "p1", code: "starter", name: "Starter", priceMonthly: 99900, studentCap: 150, features: { customDomain: false, csvImport: true, marksheetPdf: true }, isActive: true },
  { _id: "p2", code: "legacy", name: "Legacy", priceMonthly: 50000, studentCap: 80, features: { customDomain: false, csvImport: false, marksheetPdf: false }, isActive: false },
];

test.describe("platform console", () => {
  test("owner sees the console sidebar and the plans list", async ({ page }, info) => {
    test.skip(info.project.name !== "desktop", "sidebar is desktop only");
    await mockSession(page, "superAdmin");
    await page.route("**/api/v1/platform/plans", (r) => r.fulfill(ok(plans)));
    await page.goto("/platform/plans");

    const nav = page.getByRole("navigation", { name: /menu/i }).first();
    await expect(nav.getByText("Institutions", { exact: true }).first()).toBeVisible();
    await expect(nav.getByText("Plans", { exact: true }).first()).toBeVisible();
    await expect(nav.getByText("Academic", { exact: true })).toHaveCount(0);

    await expect(page.getByText("Starter", { exact: true })).toBeVisible();
    await expect(page.getByText("Hidden", { exact: true })).toBeVisible();
  });

  test("a school admin cannot open the console", async ({ page }) => {
    await mockSession(page, "admin");
    await page.goto("/platform/tenants");
    await expect(page).not.toHaveURL(/\/platform\/tenants$/);
  });
});
