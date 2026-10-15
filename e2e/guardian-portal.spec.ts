import { expect, test } from "@playwright/test";
import { mockSession } from "./helpers/auth";

const ok = (data: unknown) => ({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true, data }) });
const child = (id: string, name: string) => ({ _id: id, studentId: id, name, gender: "male", dob: "2012-01-01", admittedOn: "2020-01-01", status: "active", guardianIds: [] });

test.describe("guardian portal", () => {
  test("switching child updates the URL and shows only that child's results", async ({ page }) => {
    await mockSession(page, "guardian");
    await page.route("**/api/v1/me/students", (r) => r.fulfill(ok([child("c1", "Child One"), child("c2", "Child Two")])));
    await page.route("**/api/v1/me/results", (r) =>
      r.fulfill(
        ok([
          { _id: "r1", examId: "e1", examName: "Term 1", studentId: "c1", totalMarks: 400, fullMarks: 500, percent: 80, passed: true },
          { _id: "r2", examId: "e1", examName: "Term 1", studentId: "c2", totalMarks: 300, fullMarks: 500, percent: 60, passed: true },
        ])
      )
    );

    await page.goto("/dashboard/portal/results");
    await expect(page.getByRole("tab", { name: "Child One" })).toHaveAttribute("aria-selected", "true");
    await expect(page.getByText("Term 1")).toBeVisible();

    await page.getByRole("tab", { name: "Child Two" }).click();
    await expect(page).toHaveURL(/child=c2/);
    await expect(page.getByRole("tab", { name: "Child Two" })).toHaveAttribute("aria-selected", "true");
  });
});
