import { Suspense } from "react";
import { StaffList } from "@/components/staff/StaffList";

export default function StaffPage() {
  return (
    <Suspense>
      <StaffList />
    </Suspense>
  );
}
