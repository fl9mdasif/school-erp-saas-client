import { expect, test } from "@playwright/test";
import { mockSession, mockSignedOut, type TTestRole } from "./helpers/auth";

// What each role sees in the sidebar, checked on the desktop project. The phone project has no sidebar.
const EXPECTED: Record<Exclude<TTestRole, "superAdmin">, { home: string; sees: string[]; hidden: string[] }> = {
  admin: { home: "/dashboard", sees: ["Academic", "Staff", "Website", "Settings"], hidden: ["Collect fee"] },
  teacher: { home: "/dashboard", sees: ["Attendance", "Marks", "Notices"], hidden: ["Staff", "Website", "Settings", "Fees"] },
  accountant: { home: "/dashboard/fees/collect", sees: ["Collect fee", "Dues", "Payments"], hidden: ["Staff", "Website", "Attendance"] },
  student: { home: "/dashboard/portal", sees: ["Attendance", "Fees", "Results"], hidden: ["Staff", "Students", "Settings"] },
  guardian: { home: "/dashboard/portal", sees: ["Attendance", "Fees", "Results"], hidden: ["Staff", "Students", "Settings"] },
};

test.describe("signed-out visitors", () => {
  test("cannot open the dashboard or the platform console", async ({ page }) => {
    await mockSignedOut(page);
    await page.context().clearCookies();
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login$/);
    await page.goto("/platform");
    await expect(page).toHaveURL(/\/platform\/login$/);
  });
});

for (const [role, rule] of Object.entries(EXPECTED)) {
  test(`${role} sees only its own sidebar items`, async ({ page }, info) => {
    test.skip(info.project.name !== "desktop", "sidebar is desktop only");
    await mockSession(page, role as TTestRole);
    await page.goto(rule.home);
    const nav = page.getByRole("navigation", { name: /menu/i }).first();
    for (const label of rule.sees) await expect(nav.getByText(label, { exact: true }).first()).toBeVisible();
    for (const label of rule.hidden) await expect(nav.getByText(label, { exact: true })).toHaveCount(0);
  });
}

test("a role sent to a page that is not for it lands on its own home", async ({ page }) => {
  await mockSession(page, "teacher");
  await page.goto("/platform");
  await expect(page).not.toHaveURL(/\/platform$/);
});
