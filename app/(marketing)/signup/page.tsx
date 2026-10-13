import type { Metadata } from "next";
import { SignupWizard } from "@/components/auth/SignupWizard";

export const metadata: Metadata = { title: "Create your institution" };

export default function SignupPage() {
  return <SignupWizard />;
}
