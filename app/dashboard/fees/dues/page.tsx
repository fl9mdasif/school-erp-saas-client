import { Suspense } from "react";
import { Dues } from "@/components/fees/Dues";

export default function DuesPage() {
  return (
    <Suspense>
      <Dues />
    </Suspense>
  );
}
