import { AuthGuard } from "@/components/auth/AuthGuard";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { TENANT_ROLES } from "@/contains/role";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard allow={TENANT_ROLES}>
      <DashboardShell>{children}</DashboardShell>
    </AuthGuard>
  );
}
