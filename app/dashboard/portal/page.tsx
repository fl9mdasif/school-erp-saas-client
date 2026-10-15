import { Suspense } from "react";
import { PortalHome } from "@/components/portal/PortalHome";

export default function PortalPage() {
  return (
    <Suspense>
      <PortalHome />
    </Suspense>
  );
}
