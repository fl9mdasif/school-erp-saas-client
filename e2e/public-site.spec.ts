import { expect, test } from "@playwright/test";

/**
 * The public school pages are Server Components that fetch the API directly over HTTP (for SEO,
 * not through the browser), so `page.route()` cannot mock them the way the dashboard's client-side
 * calls are mocked elsewhere in this folder. A real pass against real data needs the API running;
 * here we only prove the page degrades to a clean 404 instead of crashing when the API (or the
 * school) is unreachable, and that no sign-in wall appears on a public path.
 */
test.describe("public school site", () => {
  test("an unknown or unreachable school is a clean 404, never a server-error page", async ({ page }) => {
    const res = await page.goto("/schools/no-such-school-xyz");
    expect(res?.status()).toBe(404);
    await expect(page.getByText(/This page could not be found|404/i)).toBeVisible();
  });

  test("the admission page needs no sign-in", async ({ page }) => {
    await page.goto("/schools/no-such-school-xyz/admission");
    await expect(page).not.toHaveURL(/\/login$/);
  });
});
