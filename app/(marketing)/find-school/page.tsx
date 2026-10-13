import type { Metadata } from "next";
import { FindSchool } from "@/components/auth/FindSchool";

export const metadata: Metadata = { title: "Find my school" };

export default function FindSchoolPage() {
  return <FindSchool />;
}
