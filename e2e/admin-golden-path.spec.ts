import { expect, test } from "@playwright/test";
import { mockSession } from "./helpers/auth";

const ok = (data: unknown, status = 200) => ({ status, contentType: "application/json", body: JSON.stringify({ success: true, data }) });
const paged = (rows: unknown[]) => ({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true, data: rows, meta: { page: 1, limit: 100, total: rows.length } }) });

/**
 * A representative slice of the admin's setup-to-publish path: sign in, open the dashboard,
 * add a fee head, see it listed, then open the website publish checklist.
 */
test.describe("admin golden path", () => {
  test("adds a fee head and sees the publish checklist", async ({ page }) => {
    await mockSession(page, "admin");
    await page.route("**/api/v1/dashboard/summary", (r) => r.fulfill(ok({ students: 0, staff: 0, dues: 0, notices: [], inquiries: [] })));

    const heads: { _id: string; name: string; code: string; kind: string; isActive: boolean }[] = [];
    await page.route("**/api/v1/fee-heads**", async (r) => {
      if (r.request().method() === "GET") return r.fulfill(paged(heads));
      const body = JSON.parse(r.request().postData() ?? "{}");
      const head = { _id: "h1", name: body.name, code: body.code, kind: body.kind, isActive: true };
      heads.push(head);
      return r.fulfill(ok(head, 201));
    });

    await page.goto("/dashboard/fees/heads");
    await page.getByRole("button", { name: /Add fee head|ফি খাত যোগ করুন/ }).click();
    await page.getByLabel(/^Name$|^নাম$/).fill("Tuition");
    await page.getByLabel(/Code/).fill("TUITION");
    await page.getByRole("button", { name: /Save|সংরক্ষণ/ }).click();
    await expect(page.getByText("Tuition")).toBeVisible();

    await page.route("**/api/v1/site", (r) => {
      if (r.request().method() === "GET")
        return r.fulfill(
          ok({
            _id: "s1",
            isPublished: false,
            theme: { primaryColor: "#0f766e", template: "classic" },
            hero: { title: "" },
            about: "",
            gallery: [],
            sectionsVisible: { about: true, teachers: true, notices: true, gallery: true, admission: true, results: true },
          })
        );
      return r.fulfill(ok({}));
    });
    await page.goto("/dashboard/website");
    await expect(page.getByText(/Draft, not public|খসড়া, প্রকাশিত নয়/)).toBeVisible();
    await expect(page.getByRole("button", { name: /^Publish$|প্রকাশ করুন/ })).toBeDisabled();
  });
});
