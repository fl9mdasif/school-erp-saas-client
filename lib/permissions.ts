import { USER_ROLE, type TRole } from "@/contains/role";

// The one permissions map for the whole UI (PRD 7.2). It only decides what to SHOW.
// The server is the only authority: a 403 from the API is rendered as a forbidden state.
const { ADMIN, TEACHER, ACCOUNTANT, STUDENT, GUARDIAN, SUPER_ADMIN } = USER_ROLE;

export const PERMISSIONS = {
  "platform.access": [SUPER_ADMIN],

  "students.view": [ADMIN, TEACHER, ACCOUNTANT, STUDENT, GUARDIAN],
  "students.list": [ADMIN, TEACHER, ACCOUNTANT],
  "students.manage": [ADMIN],
  "academic.view": [ADMIN, TEACHER, ACCOUNTANT],
  "academic.manage": [ADMIN],
  "staff.manage": [ADMIN],

  "attendance.take": [ADMIN, TEACHER],
  "attendance.view": [ADMIN, TEACHER, STUDENT, GUARDIAN],
  "attendance.report": [ADMIN, TEACHER, ACCOUNTANT],

  "notices.view": [ADMIN, TEACHER, ACCOUNTANT, STUDENT, GUARDIAN],
  "notices.create": [ADMIN, TEACHER],

  "website.manage": [ADMIN],

  "fees.setup": [ADMIN, ACCOUNTANT],
  "fees.adjustments": [ADMIN],
  "fees.invoices": [ADMIN, ACCOUNTANT],
  "fees.collect": [ADMIN, ACCOUNTANT],
  "fees.reverse": [ADMIN],
  "fees.reports": [ADMIN, ACCOUNTANT],
  "fees.viewOwn": [STUDENT, GUARDIAN],

  "exams.manage": [ADMIN],
  "exams.view": [ADMIN, TEACHER],
  "marks.enter": [ADMIN, TEACHER],
  "results.view": [ADMIN, TEACHER],
  "results.viewOwn": [STUDENT, GUARDIAN],

  "settings.manage": [ADMIN],
  "audit.view": [ADMIN],
} as const satisfies Record<string, readonly TRole[]>;

export type TPermission = keyof typeof PERMISSIONS;

export const can = (role: TRole | null | undefined, permission: TPermission): boolean =>
  !!role && (PERMISSIONS[permission] as readonly TRole[]).includes(role);

/** Where each role lands after sign-in (PRD 7.1). */
export const roleHome = (role: TRole): string => {
  switch (role) {
    case USER_ROLE.SUPER_ADMIN:
      return "/platform";
    case USER_ROLE.ACCOUNTANT:
      return "/dashboard/fees/collect";
    case USER_ROLE.STUDENT:
    case USER_ROLE.GUARDIAN:
      return "/dashboard/portal";
    default:
      return "/dashboard";
  }
};
