import { describe, expect, it } from "vitest";
import { changePasswordSchema, loginSchema, signupSchema, SIGNUP_STEP_FIELDS } from "@/utils/interface";
import { passwordStrength } from "@/utils/passwordStrength";
import { normalizeSlug, slugSuggestions } from "@/utils/slug";

describe("slug helper (mirrors the server rules)", () => {
  it("turns brightModel into bright-model while typing", () => {
    expect(normalizeSlug("brightModel")).toBe("bright-model");
    expect(normalizeSlug("  Bright   Model  ")).toBe("bright-model");
    expect(normalizeSlug("bright__model--school")).toBe("bright-model-school");
    expect(normalizeSlug("BrightModelSchool")).toBe("bright-model-school");
    expect(normalizeSlug("Dhaka City!")).toBe("dhaka-city");
  });
  it("suggests two alternatives when the address is taken", () => {
    expect(slugSuggestions("bright-model", "Dhaka")).toEqual(["bright-model-2", "bright-model-dhaka"]);
    expect(slugSuggestions("bright-model")).toEqual(["bright-model-2", "bright-model-school"]);
    for (const s of slugSuggestions("a".repeat(40), "Dhaka")) expect(s.length).toBeLessThanOrEqual(40);
  });
});

describe("password strength hint", () => {
  it("rates weak, okay and strong", () => {
    expect(passwordStrength("abc").level).toBe("weak");
    expect(passwordStrength("abcdefgh").level).toBe("weak");
    expect(passwordStrength("Abcdefgh1").level).toBe("okay");
    expect(passwordStrength("Correct-Horse-9-Battery").level).toBe("strong");
  });
});

describe("form schemas", () => {
  const valid = {
    institutionName: "Bright Model School",
    institutionType: "school",
    phone: "01712345678",
    slug: "bright-model",
    adminName: "Head Teacher",
    adminEmail: "head@example.com",
    password: "Passw0rd!long",
    terms: true,
  };
  it("accepts a complete signup", () => {
    expect(signupSchema.safeParse(valid).success).toBe(true);
  });
  it("returns dictionary keys as messages so Bangla and English share one schema", () => {
    const r = signupSchema.safeParse({ ...valid, phone: "123", password: "short", terms: undefined, adminEmail: "no" });
    expect(r.success).toBe(false);
    const messages = r.success ? [] : r.error.issues.map((i) => i.message);
    expect(messages).toEqual(expect.arrayContaining(["val.phone", "val.min8", "val.terms", "val.email"]));
  });
  it("validates each wizard step on its own fields", () => {
    expect(SIGNUP_STEP_FIELDS[0]).toEqual(["institutionName", "institutionType", "phone"]);
    expect(SIGNUP_STEP_FIELDS[1]).toEqual(["slug"]);
    expect(SIGNUP_STEP_FIELDS[2]).toContain("terms");
  });
  it("login needs a school, an identifier and a password", () => {
    expect(loginSchema.safeParse({ tenantSlug: "a", identifier: "26-0001", password: "x" }).success).toBe(true);
    expect(loginSchema.safeParse({ tenantSlug: "", identifier: "", password: "" }).success).toBe(false);
  });
  it("change password needs matching, different passwords", () => {
    const base = { oldPassword: "Temp1234", newPassword: "NewPassw0rd!", confirmPassword: "NewPassw0rd!" };
    expect(changePasswordSchema.safeParse(base).success).toBe(true);
    const mismatch = changePasswordSchema.safeParse({ ...base, confirmPassword: "other" });
    expect(!mismatch.success && mismatch.error.issues[0].message).toBe("val.passwordsMatch");
    const same = changePasswordSchema.safeParse({ oldPassword: "Same1234!", newPassword: "Same1234!", confirmPassword: "Same1234!" });
    expect(!same.success && same.error.issues[0].message).toBe("val.passwordDiffer");
  });
});
