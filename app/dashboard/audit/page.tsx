import { Suspense } from "react";
import { AuditLogTable } from "@/components/audit/AuditLogTable";

export default function AuditPage() {
  return (
    <Suspense>
      <AuditLogTable />
    </Suspense>
  );
}
