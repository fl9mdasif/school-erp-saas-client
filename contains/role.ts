// Role names are exactly what the server puts in the token and in /auth/me.
export const USER_ROLE = {
  SUPER_ADMIN: "superAdmin",
  ADMIN: "admin",
  TEACHER: "teacher",
  ACCOUNTANT: "accountant",
  STUDENT: "student",
  GUARDIAN: "guardian",
} as const;

export type TRole = (typeof USER_ROLE)[keyof typeof USER_ROLE];

export const TENANT_ROLES: TRole[] = [
  USER_ROLE.ADMIN,
  USER_ROLE.TEACHER,
  USER_ROLE.ACCOUNTANT,
  USER_ROLE.STUDENT,
  USER_ROLE.GUARDIAN,
];
