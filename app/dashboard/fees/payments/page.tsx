import { Suspense } from "react";
import { PaymentsList } from "@/components/fees/PaymentsList";

export default function PaymentsPage() {
  return (
    <Suspense>
      <PaymentsList />
    </Suspense>
  );
}
