import { expect, test } from "@playwright/test";
import { mockSession } from "./helpers/auth";

const ok = (data: unknown) => ({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true, data }) });
const paged = (rows: unknown[]) => ({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true, data: rows, meta: { page: 1, limit: 100, total: rows.length } }) });

/** Teacher sees their own classes on Home, and the admin-only actions are gone everywhere. */
test.describe("teacher golden path", () => {
  test("home shows my classes; students and exams stay read only", async ({ page }) => {
    await mockSession(page, "teacher");
    await page.route("**/api/v1/dashboard/summary", (r) =>
      r.fulfill(ok({ role: "teacher", date: "2026-01-01", myClasses: [{ sectionId: "s1", classId: "c1", name: "Section A", students: 30, attendanceTakenToday: false }], pendingAttendance: 1 }))
    );
    await page.goto("/dashboard");
    await expect(page.getByText("Section A")).toBeVisible();
    await expect(page.getByRole("link", { name: /Take now|এখনই নিন/ })).toBeVisible();

    await page.route("**/api/v1/students**", (r) => r.fulfill(paged([])));
    await page.goto("/dashboard/students");
    await expect(page.getByRole("link", { name: /^Add|যোগ করুন/ })).toHaveCount(0);

    await page.route("**/api/v1/exams**", (r) => r.fulfill(paged([])));
    await page.goto("/dashboard/exams");
    await expect(page.getByRole("button", { name: /Create exam|পরীক্ষা তৈরি করুন/ })).toHaveCount(0);
  });
});
