import { Suspense } from "react";
import { NoticesList } from "@/components/notices/NoticesList";

export default function NoticesPage() {
  return (
    <Suspense>
      <NoticesList />
    </Suspense>
  );
}
