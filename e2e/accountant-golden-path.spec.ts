import { expect, test } from "@playwright/test";
import { mockSession } from "./helpers/auth";

const ok = (data: unknown) => ({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true, data }) });

/** Accountant lands on Collect fee with today's numbers, and cannot reverse a payment. */
test.describe("accountant golden path", () => {
  test("collect fee shows today's stats; payment detail has no reverse button", async ({ page }) => {
    await mockSession(page, "accountant");
    await page.route("**/api/v1/fees/reports/collection**", (r) => r.fulfill(ok({ from: "2026-01-01", to: "2026-01-01", groupBy: "day", total: 150000, rows: [] })));
    await page.route("**/api/v1/fees/dues**", (r) => r.fulfill(ok({ totalDue: 500000, rows: [] })));
    await page.goto("/dashboard/fees/collect");
    await expect(page.getByText(/Collected today|আজ সংগৃহীত/)).toBeVisible();

    await page.route("**/api/v1/payments/p1", (r) =>
      r.fulfill(ok({ _id: "p1", receiptNo: "R-1", studentId: "s1", allocations: [], amount: 50000, method: "cash", status: "succeeded", receivedAt: "2026-01-01T00:00:00.000Z" }))
    );
    await page.route("**/api/v1/payments/p1/receipt.pdf", (r) => r.fulfill({ status: 200, contentType: "application/pdf", body: "%PDF-1.4" }));
    await page.goto("/dashboard/fees/payments/p1");
    await expect(page.getByRole("button", { name: /Reverse payment|পরিশোধ বাতিল করুন/ })).toHaveCount(0);
  });
});
