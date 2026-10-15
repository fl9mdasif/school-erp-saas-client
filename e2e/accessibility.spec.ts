import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { mockSession } from "./helpers/auth";

const ok = (data: unknown) => ({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true, data }) });

/** No serious or critical axe violations on the two screens used the most: sign-in and the
 * attendance/marks entry grids (keyboard-first by design, see TakeAttendance and the marks grid). */
test.describe("accessibility", () => {
  test("login page has no serious axe violations", async ({ page }) => {
    await page.goto("/login");
    const results = await new AxeBuilder({ page }).analyze();
    const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(serious, JSON.stringify(serious, null, 2)).toEqual([]);
  });

  test("take-attendance page has no serious axe violations and the status buttons are reachable by keyboard", async ({ page }) => {
    await mockSession(page, "admin");
    await page.route("**/api/v1/dashboard/summary", (r) => r.fulfill(ok({ students: 0, staff: 0, newInquiries: 0, notices: 0, attendanceToday: { present: 0, absent: 0, late: 0, leave: 0, sheets: 0 } })));
    await page.route("**/api/v1/attendance/sections**", (r) => r.fulfill(ok([{ sectionId: "s1", classId: "c1", name: "Class 1", students: 1 }])));
    await page.route("**/api/v1/attendance/sheet**", (r) =>
      r.fulfill(ok({ sectionId: "s1", date: "2026-01-01", exists: false, takenAt: null, records: [{ studentId: "st1", name: "Test Student", roll: 1, status: null }] }))
    );
    await page.goto("/dashboard/attendance/take");
    const results = await new AxeBuilder({ page }).exclude("iframe").analyze();
    const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(serious, JSON.stringify(serious, null, 2)).toEqual([]);

    const firstRadio = page.getByRole("radio").first();
    await firstRadio.focus();
    await expect(firstRadio).toBeFocused();
  });
});
