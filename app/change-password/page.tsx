"use client";

import { AuthGuard } from "@/components/auth/AuthGuard";
import { ChangePasswordForm } from "@/components/auth/PasswordForms";
import { TENANT_ROLES, USER_ROLE } from "@/contains/role";

export default function ChangePasswordPage() {
  return (
    <AuthGuard allow={[...TENANT_ROLES, USER_ROLE.SUPER_ADMIN]}>
      <ChangePasswordForm />
    </AuthGuard>
  );
}
