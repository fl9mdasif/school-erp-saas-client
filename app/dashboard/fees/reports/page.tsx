import { Suspense } from "react";
import { CollectionReports } from "@/components/fees/CollectionReports";

export default function FeeReportsPage() {
  return (
    <Suspense>
      <CollectionReports />
    </Suspense>
  );
}
