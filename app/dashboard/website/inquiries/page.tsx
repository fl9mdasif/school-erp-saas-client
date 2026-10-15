import { Suspense } from "react";
import { InquiriesInbox } from "@/components/website/InquiriesInbox";

export default function InquiriesPage() {
  return (
    <Suspense>
      <InquiriesInbox />
    </Suspense>
  );
}
