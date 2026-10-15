import { Suspense } from "react";
import { PortalFees } from "@/components/portal/PortalFees";

export default function PortalFeesPage() {
  return (
    <Suspense>
      <PortalFees />
    </Suspense>
  );
}
