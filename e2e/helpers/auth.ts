import type { Page } from "@playwright/test";

export type TTestRole = "superAdmin" | "admin" | "teacher" | "accountant" | "student" | "guardian";

const ok = (data: unknown) => ({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true, data }) });

const tenant = {
  id: "t1",
  name: "Bright Model School",
  slug: "bright-model",
  institutionType: "school",
  status: "trial",
  trialEndsAt: "2099-01-01T00:00:00.000Z",
  terminology: { class: { en: "Class", bn: "শ্রেণি" }, section: { en: "Section", bn: "শাখা" } },
  settings: { locale: "bn", weekendDays: [5], defaultFeeCycle: "monthly" },
  plan: { code: "standard", name: "Standard", studentCap: 500, features: { customDomain: true, csvImport: true, marksheetPdf: true } },
};

/**
 * Pretends the API signed this role in. The refresh call returns a token and /auth/me returns the
 * user, so the real app boots into an authenticated session without a server. Add routes with
 * page.route() for the screens under test.
 */
export async function mockSession(page: Page, role: TTestRole, over: { mustChangePassword?: boolean } = {}) {
  await page.context().addCookies([{ name: "asm_session", value: "1", url: "http://localhost:3000" }]);
  await page.route("**/api/v1/auth/refresh", (r) => r.fulfill(ok({ accessToken: "test-token" })));
  await page.route("**/api/v1/auth/me", (r) =>
    r.fulfill(
      ok(
        role === "superAdmin"
          ? { user: { id: "u1", name: "Platform Owner", role, email: "owner@example.com" } }
          : { user: { id: "u1", name: `Test ${role}`, role, mustChangePassword: over.mustChangePassword ?? false }, tenant }
      )
    )
  );
}

export async function mockSignedOut(page: Page) {
  await page.route("**/api/v1/auth/refresh", (r) =>
    r.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ success: false, code: "SESSION_INVALID", message: "Session expired" }) })
  );
}
