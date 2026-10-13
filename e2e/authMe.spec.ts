import { expect, test } from "@playwright/test";
import { mockSession } from "./helpers/auth";

const ok = (data: unknown) => ({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true, data }) });
const owner = { id: "u1", name: "Platform Owner", role: "superAdmin", email: "owner@example.com" };

/** Every /auth/me request must carry the access token, whatever way the dashboard was reached. */
function trackMe(page: import("@playwright/test").Page) {
  const calls: { auth: string | undefined }[] = [];
  page.on("request", (req) => {
    if (req.url().endsWith("/api/v1/auth/me")) calls.push({ auth: req.headers()["authorization"] });
  });
  return calls;
}

test.describe("/auth/me always carries the token", () => {
  test("page load with a live session (silent refresh, then me)", async ({ page }) => {
    await mockSession(page, "superAdmin");
    await page.route("**/api/v1/platform/**", (r) => r.fulfill(ok([])));
    const calls = trackMe(page);
    await page.goto("/platform");
    await expect(page.getByRole("navigation").first()).toBeVisible();
    expect(calls.length).toBeGreaterThan(0);
    for (const c of calls) expect(c.auth).toBe("Bearer test-token");
  });

  test("platform sign in, then the dashboard loads", async ({ page }) => {
    const calls = trackMe(page);
    await page.route("**/api/v1/auth/refresh", (r) =>
      r.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ success: false, code: "UNAUTHORIZED", message: "Authentication required" }) })
    );
    await page.route("**/api/v1/platform/auth/login", (r) => r.fulfill(ok({ accessToken: "login-token", user: owner })));
    await page.route("**/api/v1/auth/me", (r) => r.fulfill(ok({ user: owner })));
    await page.route("**/api/v1/platform/**", (r) => r.fulfill(ok([])));

    await page.goto("/platform/login");
    await page.getByLabel(/email/i).fill("owner@example.com");
    await page.locator('input[type="password"]').fill("OwnerPass123!");
    await page.getByRole("button", { name: /sign in|log in|login|প্রবেশ|লগ/i }).click();
    await expect(page).toHaveURL(/\/platform$/);
    expect(calls.length).toBeGreaterThan(0);
    for (const c of calls) expect(c.auth).toBe("Bearer login-token");
  });
});
