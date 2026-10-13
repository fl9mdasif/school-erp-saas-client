import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/auth/PasswordForms";

export const metadata: Metadata = { title: "Set a new password" };

export default async function ResetPasswordPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { slug } = await params;
  const { token = "" } = await searchParams;
  return <ResetPasswordForm slug={slug} token={token} />;
}
