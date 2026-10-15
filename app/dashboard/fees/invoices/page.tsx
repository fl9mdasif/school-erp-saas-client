import { Suspense } from "react";
import { InvoicesList } from "@/components/fees/InvoicesList";

export default function InvoicesPage() {
  return (
    <Suspense>
      <InvoicesList />
    </Suspense>
  );
}
