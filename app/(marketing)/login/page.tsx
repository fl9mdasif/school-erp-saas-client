import type { Metadata } from "next";
import { FindSchool } from "@/components/auth/FindSchool";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return <FindSchool />;
}
