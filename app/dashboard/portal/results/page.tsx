import { Suspense } from "react";
import { PortalResults } from "@/components/portal/PortalResults";

export default function PortalResultsPage() {
  return (
    <Suspense>
      <PortalResults />
    </Suspense>
  );
}
