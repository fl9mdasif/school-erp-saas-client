import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const ok = (data: unknown) => ({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true, data }) });

test.describe("features page", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("**/api/v1/public/platform/plans", (r) => r.fulfill(ok([])));
  });

  test("lists every area, the category bar jumps to a section, no horizontal scroll", async ({ page }) => {
    await page.goto("/features");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("navigation", { name: /Feature areas|ফিচারের ক্ষেত্র/ }).getByRole("link")).toHaveCount(9);
    await page.getByRole("navigation", { name: /Feature areas|ফিচারের ক্ষেত্র/ }).getByRole("link").nth(4).click();
    await expect(page).toHaveURL(/#fees$/);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });

  test("home has Show all features and it opens the page", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /Show all features|সব ফিচার দেখুন/ }).click();
    await expect(page).toHaveURL(/\/features$/);
  });

  test("no serious axe violations", async ({ page }) => {
    await page.goto("/features");
    await page.waitForTimeout(800);
    const results = await new AxeBuilder({ page }).analyze();
    const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(serious, JSON.stringify(serious.map((v) => ({ id: v.id, n: v.nodes.length, t: v.nodes[0]?.target })), null, 2)).toEqual([]);
  });
});
