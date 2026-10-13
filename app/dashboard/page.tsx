"use client";

import { AdminHome } from "@/components/dashboard/AdminHome";
import { PageHeader } from "@/components/common/PageHeader";
import { useAppSelector } from "@/redux/hooks";

// One home per role. Each role stage adds its own branch here.
export default function DashboardHomePage() {
  const role = useAppSelector((s) => s.auth.user?.role);
  if (role === "admin") return <AdminHome />;
  return <PageHeader title="Dashboard" description="This role's home page is built in its own stage." />;
}
