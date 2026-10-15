import { expect, test } from "@playwright/test";
import { mockSession } from "./helpers/auth";

const ok = (data: unknown) => ({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true, data }) });
const student = { _id: "s1", studentId: "26-0001", name: "Test Student", gender: "male", dob: "2012-01-01", admittedOn: "2020-01-01", status: "active", guardianIds: [] };

test.describe("student portal", () => {
  test("home shows the student's own notices with no management actions", async ({ page }) => {
    await mockSession(page, "student");
    await page.route("**/api/v1/me/students", (r) => r.fulfill(ok([student])));
    await page.route("**/api/v1/notices**", (r) => r.fulfill(ok([])));
    await page.goto("/dashboard/portal");
    await expect(page.getByText(/^Notices$|^নোটিশ$/)).toBeVisible();
    await expect(page.getByRole("link", { name: /Add notice|নোটিশ যোগ/ })).toHaveCount(0);

    await page.route("**/api/v1/me/fees", (r) => r.fulfill(ok({ totalDue: 0, invoices: [], receipts: [] })));
    await page.goto("/dashboard/portal/fees");
    await expect(page.getByText(/No dues|কোনো বাকি নেই/)).toBeVisible();
  });
});
