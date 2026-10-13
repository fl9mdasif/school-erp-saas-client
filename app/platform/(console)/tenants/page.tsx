import { Suspense } from "react";
import { TenantsList } from "@/components/platform/TenantsList";

export default function TenantsPage() {
  return (
    <Suspense>
      <TenantsList />
    </Suspense>
  );
}
