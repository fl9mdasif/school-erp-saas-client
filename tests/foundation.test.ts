import { describe, expect, it } from "vitest";
import { USER_ROLE, type TRole } from "@/contains/role";
import { addDays, dayOfWeek, formatLocalDate, formatMoney, normalizeBdPhone, poishaToTakaInput, takaToPoisha, todayLocal } from "@/lib/format";
import { getApiErrorMessage, getFieldErrors, isApiError } from "@/lib/errors";
import { bn, en } from "@/lib/i18n";
import { translate } from "@/lib/i18n/useT";
import { can, PERMISSIONS, roleHome } from "@/lib/permissions";
import { allowedPaths, bottomNavItems, sidebarItems } from "@/utils/drawerItems";

const ROLES = Object.values(USER_ROLE) as TRole[];

describe("money", () => {
  it("shows integer poisha as Taka without floating point artifacts", () => {
    expect(formatMoney(125050)).toBe("৳ 1,250.50");
    expect(formatMoney(100)).toBe("৳ 1.00");
    expect(formatMoney(5)).toBe("৳ 0.05");
    expect(formatMoney(0)).toBe("৳ 0.00");
    expect(formatMoney(1999999999)).toBe("৳ 19,999,999.99");
    expect(formatMoney(-2500)).toBe("-৳ 25.00");
  });
  it("can show Bangla digits when the user asks", () => {
    expect(formatMoney(125050, { lang: "bn", banglaDigits: true })).toBe("৳ ১,২৫০.৫০");
  });
  it("turns typed Taka into integer poisha", () => {
    expect(takaToPoisha("1250")).toBe(125000);
    expect(takaToPoisha("1,250.5")).toBe(125050);
    expect(takaToPoisha("0.07")).toBe(7);
    expect(takaToPoisha("19.99")).toBe(1999);
    expect(takaToPoisha("12.345")).toBeNull();
    expect(takaToPoisha("abc")).toBeNull();
    expect(poishaToTakaInput(125000)).toBe("1250");
    expect(poishaToTakaInput(125050)).toBe("1250.50");
  });
});

describe("dates and phones", () => {
  it("formats a business date without timezone drift", () => {
    expect(formatLocalDate("2026-03-09")).toBe("09 Mar 2026");
    expect(formatLocalDate("2026-12-31", { lang: "en", banglaDigits: true })).toBe("৩১ Dec ২০২৬");
  });
  it("uses Dhaka time for today", () => {
    expect(todayLocal(new Date("2026-03-10T20:00:00Z"))).toBe("2026-03-11");
    expect(todayLocal(new Date("2026-03-10T17:59:00Z"))).toBe("2026-03-10");
  });
  it("knows weekdays and adds days across a month end", () => {
    expect(dayOfWeek("2026-03-13")).toBe(5);
    expect(addDays("2026-02-28", 1)).toBe("2026-03-01");
  });
  it("normalizes Bangladesh mobile numbers", () => {
    expect(normalizeBdPhone("+8801712345678")).toBe("01712345678");
    expect(normalizeBdPhone("017 1234-5678")).toBe("01712345678");
    expect(normalizeBdPhone("12345")).toBeNull();
  });
});

describe("translations", () => {
  it("has a non-empty Bangla string for every English key", () => {
    for (const key of Object.keys(en) as (keyof typeof en)[]) {
      expect(bn[key], key).toBeTruthy();
    }
  });
  it("fills variables and falls back safely", () => {
    expect(translate("en", "common.page", { page: 2, pages: 5 })).toBe("Page 2 of 5");
    expect(translate("bn", "common.page", { page: 2, pages: 5 })).toBe("পাতা 2 / 5");
    expect(translate("en", "common.typeToConfirm", {})).toBe("Type {text} to confirm");
  });
});

describe("API errors", () => {
  const t = (k: Parameters<typeof translate>[1], v?: Record<string, string | number>) => translate("en", k, v);
  it("maps a server code to one clear sentence", () => {
    const e = { status: 403, code: "PLAN_LIMIT_REACHED", message: "x" };
    expect(isApiError(e)).toBe(true);
    expect(getApiErrorMessage(e, t)).toBe("Your plan's student limit is reached.");
  });
  it("shows the wait time on a rate limit", () => {
    expect(getApiErrorMessage({ status: 429, code: "RATE_LIMITED", message: "x", retryAfter: 42 }, t)).toBe(
      "Too many attempts. Try again in 42 seconds."
    );
  });
  it("falls back for unknown codes and non API errors", () => {
    expect(getApiErrorMessage({ status: 500, code: "SOMETHING_NEW", message: "x" }, t)).toBe(en["error.UNKNOWN_ERROR"]);
    expect(getApiErrorMessage(new Error("boom"), t)).toBe(en["error.UNKNOWN_ERROR"]);
  });
  it("reads field errors from validation details", () => {
    const e = { status: 400, code: "VALIDATION_ERROR", message: "x", details: [{ path: "phone", message: "bad" }] };
    expect(getFieldErrors(e)).toEqual({ phone: "bad" });
  });
});

describe("permissions map", () => {
  it("follows the visibility matrix (PRD 7.2)", () => {
    expect(can(USER_ROLE.ADMIN, "fees.reverse")).toBe(true);
    expect(can(USER_ROLE.ACCOUNTANT, "fees.reverse")).toBe(false);
    expect(can(USER_ROLE.ACCOUNTANT, "fees.collect")).toBe(true);
    expect(can(USER_ROLE.TEACHER, "fees.collect")).toBe(false);
    expect(can(USER_ROLE.TEACHER, "attendance.take")).toBe(true);
    expect(can(USER_ROLE.ACCOUNTANT, "attendance.take")).toBe(false);
    expect(can(USER_ROLE.TEACHER, "students.manage")).toBe(false);
    expect(can(USER_ROLE.STUDENT, "fees.viewOwn")).toBe(true);
    expect(can(USER_ROLE.ADMIN, "fees.viewOwn")).toBe(false);
    expect(can(USER_ROLE.SUPER_ADMIN, "students.view")).toBe(false);
    expect(can(null, "students.view")).toBe(false);
  });
  it("only the admin can touch website, settings, audit and exams setup", () => {
    for (const p of ["website.manage", "settings.manage", "audit.view", "exams.manage", "academic.manage", "staff.manage"] as const) {
      expect(PERMISSIONS[p]).toEqual([USER_ROLE.ADMIN]);
    }
  });
  it("sends every role to its own home", () => {
    expect(roleHome(USER_ROLE.SUPER_ADMIN)).toBe("/platform");
    expect(roleHome(USER_ROLE.ADMIN)).toBe("/dashboard");
    expect(roleHome(USER_ROLE.TEACHER)).toBe("/dashboard");
    expect(roleHome(USER_ROLE.ACCOUNTANT)).toBe("/dashboard/fees/collect");
    expect(roleHome(USER_ROLE.STUDENT)).toBe("/dashboard/portal");
    expect(roleHome(USER_ROLE.GUARDIAN)).toBe("/dashboard/portal");
  });
});

describe("role navigation", () => {
  it("shows exactly the sidebar items each role may use", () => {
    const keys = (r: TRole) => sidebarItems(r).map((i) => i.key);
    expect(keys(USER_ROLE.ADMIN)).toEqual(["home", "academic", "staff", "students", "attendance", "notices", "fees", "exams", "website", "settings", "audit"]);
    expect(keys(USER_ROLE.TEACHER)).toEqual(["home", "students", "attendance", "marks", "notices", "academic"]);
    expect(keys(USER_ROLE.ACCOUNTANT)).toEqual(["collect", "dues", "payments", "fees", "students", "academic"]);
    expect(keys(USER_ROLE.STUDENT)).toEqual(["home", "attendance", "fees", "results", "notices"]);
    expect(keys(USER_ROLE.GUARDIAN)).toEqual(keys(USER_ROLE.STUDENT));
    expect(keys(USER_ROLE.SUPER_ADMIN)).toEqual(["overview", "tenants", "plans"]);
  });
  it("never offers admin-only pages to other roles", () => {
    const adminOnly = ["/dashboard/staff", "/dashboard/website", "/dashboard/settings", "/dashboard/audit", "/dashboard/exams/grading-scales", "/dashboard/fees/adjustments"];
    for (const role of ROLES.filter((r) => r !== USER_ROLE.ADMIN)) {
      const paths = allowedPaths(role);
      for (const p of adminOnly) expect(paths, `${role} must not see ${p}`).not.toContain(p);
    }
  });
  it("keeps platform pages out of tenant roles and tenant pages out of the platform", () => {
    for (const role of ROLES.filter((r) => r !== USER_ROLE.SUPER_ADMIN)) {
      expect(allowedPaths(role).some((p) => p.startsWith("/platform"))).toBe(false);
    }
    expect(allowedPaths(USER_ROLE.SUPER_ADMIN).every((p) => p.startsWith("/platform"))).toBe(true);
  });
  it("gives phones at most four bottom items drawn from the role's own list", () => {
    for (const role of ROLES) {
      const bottom = bottomNavItems(role);
      expect(bottom.length).toBeLessThanOrEqual(4);
      const all = new Set(sidebarItems(role).map((i) => i.key));
      for (const b of bottom) expect(all.has(b.key)).toBe(true);
    }
  });
  it("hides SMS and custom domain screens (the server no longer has them)", () => {
    const all = ROLES.flatMap((r) => allowedPaths(r));
    expect(all.some((p) => p.includes("/sms") || p.includes("/domain"))).toBe(false);
  });
});
