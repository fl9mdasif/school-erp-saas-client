import { Suspense } from "react";
import { PortalAttendance } from "@/components/portal/PortalAttendance";

export default function PortalAttendancePage() {
  return (
    <Suspense>
      <PortalAttendance />
    </Suspense>
  );
}
