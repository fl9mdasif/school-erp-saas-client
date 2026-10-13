import type { Metadata } from "next";
import { PlatformLoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = { title: "Platform sign in" };

export default function PlatformLoginPage() {
  return <PlatformLoginForm />;
}
