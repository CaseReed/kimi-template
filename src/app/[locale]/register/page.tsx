import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { RegisterForm } from "@/components/auth/register-form";

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });

  return {
    title: t("register.title"),
    description: t("register.description"),
  };
}

export default async function RegisterPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Check if user is already authenticated
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Redirect to dashboard if already logged in
  if (session) {
    redirect(`/${locale}/dashboard`);
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <RegisterForm locale={locale} />
    </main>
  );
}
