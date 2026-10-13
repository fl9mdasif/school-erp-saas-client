import { Suspense } from "react";
import { StudentsList } from "@/components/students/StudentsList";

export default function StudentsPage() {
  return (
    <Suspense>
      <StudentsList />
    </Suspense>
  );
}
