import type { Metadata } from "next";

import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export async function generateMetadata({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  params: _params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  return {
    title: "Reset Password",
    description: "Request a password reset for your account",
  };
}

export default async function ForgotPasswordPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return <ForgotPasswordForm locale={locale} />;
}
