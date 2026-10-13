import { AuthGuard } from "@/components/auth/AuthGuard";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { USER_ROLE } from "@/contains/role";

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard allow={[USER_ROLE.SUPER_ADMIN]}>
      <DashboardShell>{children}</DashboardShell>
    </AuthGuard>
  );
}
