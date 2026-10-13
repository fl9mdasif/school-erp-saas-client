import type { Metadata } from "next";
import { SchoolLoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = { title: "Sign in" };

export default async function SchoolLoginPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <SchoolLoginForm slug={slug} />;
}
