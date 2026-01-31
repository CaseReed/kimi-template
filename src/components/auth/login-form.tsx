"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { z } from "zod";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Github, Chrome, Loader2, ArrowLeft, Copy, Check, User } from "lucide-react";
import Link from "next/link";
import { FadeIn } from "@/components/animations/fade-in";
import { AnimatedLogo } from "@/components/animations";
import { GradientText } from "@/components/animations";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Validation schema
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

interface LoginFormProps {
  locale: string;
}

// Test credentials - Must match scripts/seed-admin.ts defaults
const TEST_EMAIL = "admin@example.com";
const TEST_PASSWORD = "admin123456";

export function LoginForm({ locale }: LoginFormProps) {
  const t = useTranslations("auth");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState(TEST_EMAIL);
  const [password, setPassword] = useState(TEST_PASSWORD);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // Client-side validation
    const validation = loginSchema.safeParse({ email, password });
    if (!validation.success) {
      setError(validation.error.issues[0].message);
      setIsLoading(false);
      return;
    }

    try {
      const { error: signInError } = await authClient.signIn.email({
        email,
        password,
        callbackURL: `/${locale}/dashboard`,
      });

      if (signInError) {
        setError(signInError.message || t("errors.invalidCredentials"));
        setIsLoading(false);
      }
      // Redirect is handled by callbackURL on success
    } catch {
      setError(t("errors.generic"));
      setIsLoading(false);
    }
  };

  const handleSocialSignIn = async (provider: "github" | "google") => {
    setIsLoading(true);
    try {
      await authClient.signIn.social({
        provider,
        callbackURL: `/${locale}/dashboard`,
      });
    } catch {
      setError(t("errors.failedSocial", { provider }));
      setIsLoading(false);
    }
  };

  const handleCopy = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      // Fallback: silently fail
    }
  };

  const handleFillCredentials = () => {
    setEmail(TEST_EMAIL);
    setPassword(TEST_PASSWORD);
  };

  const errorId = "login-form-error";

  return (
    <FadeIn direction="up" duration={0.5} className="w-full max-w-md">
      {/* Logo link to home */}
      <Link href={`/${locale}`} className="flex items-center justify-center gap-2 mb-8">
        <AnimatedLogo />
        <span className="font-bold text-lg">
          <GradientText>kimi-template</GradientText>
        </span>
      </Link>
      <Card className="border shadow-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
            {t("login.title")}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {t("login.description")}
          </CardDescription>
        </CardHeader>
      <CardContent className="space-y-4">
        {/* Social Login Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleSocialSignIn("github")}
            disabled={isLoading}
            className="w-full"
          >
            <Github className="mr-2 h-4 w-4" />
            {t("social.github")}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleSocialSignIn("google")}
            disabled={isLoading}
            className="w-full"
          >
            <Chrome className="mr-2 h-4 w-4" />
            {t("social.google")}
          </Button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              {t("social.divider")}
            </span>
          </div>
        </div>

        {/* Test Credentials Alert */}
        <Alert className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30">
          <User className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <AlertTitle className="text-amber-800 dark:text-amber-200">
            {t("testCredentials.title")}
          </AlertTitle>
          <AlertDescription className="text-amber-700 dark:text-amber-300/80">
            <p className="mb-2">{t("testCredentials.description")}</p>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-2 rounded bg-amber-100/50 dark:bg-amber-900/20 px-2 py-1">
                <code className="text-xs font-mono">{TEST_EMAIL}</code>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(TEST_EMAIL, "email")}
                  className="h-6 px-2 text-xs text-amber-700 hover:text-amber-900 hover:bg-amber-200/50 dark:text-amber-300 dark:hover:text-amber-100 dark:hover:bg-amber-800/50"
                >
                  {copiedField === "email" ? (
                    <Check className="h-3 w-3 mr-1" />
                  ) : (
                    <Copy className="h-3 w-3 mr-1" />
                  )}
                  {copiedField === "email" ? t("testCredentials.copied") : t("testCredentials.copy")}
                </Button>
              </div>
              <div className="flex items-center justify-between gap-2 rounded bg-amber-100/50 dark:bg-amber-900/20 px-2 py-1">
                <code className="text-xs font-mono">{TEST_PASSWORD}</code>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(TEST_PASSWORD, "password")}
                  className="h-6 px-2 text-xs text-amber-700 hover:text-amber-900 hover:bg-amber-200/50 dark:text-amber-300 dark:hover:text-amber-100 dark:hover:bg-amber-800/50"
                >
                  {copiedField === "password" ? (
                    <Check className="h-3 w-3 mr-1" />
                  ) : (
                    <Copy className="h-3 w-3 mr-1" />
                  )}
                  {copiedField === "password" ? t("testCredentials.copied") : t("testCredentials.copy")}
                </Button>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleFillCredentials}
              className="mt-3 w-full text-xs border-amber-300 bg-amber-100/50 hover:bg-amber-200/50 dark:border-amber-800 dark:bg-amber-900/20 dark:hover:bg-amber-800/30"
            >
              {t("login.submit")}
            </Button>
          </AlertDescription>
        </Alert>

        {/* Email/Password Form */}
        <form 
          onSubmit={handleSubmit} 
          className="space-y-4"
          aria-describedby={error ? errorId : undefined}
          suppressHydrationWarning
        >
          <div className="space-y-2">
            <Label htmlFor="email">
              {t("fields.email")} <span aria-label="required">*</span>
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder={t("fields.emailPlaceholder")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              aria-required="true"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">
                {t("fields.password")} <span aria-label="required">*</span>
              </Label>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder={t("fields.passwordPlaceholder")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              aria-required="true"
            />
          </div>

          {error && (
            <div 
              id={errorId}
              role="alert" 
              aria-live="polite"
              className="rounded-md bg-destructive/15 p-3 text-sm text-destructive"
            >
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("login.loading")}
              </>
            ) : (
              t("login.submit")
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col gap-3 pt-2">
        <div className="text-sm text-muted-foreground">
          {t("login.noAccount")}{" "}
          <Link
            href={`/${locale}/register`}
            className="text-primary font-medium underline-offset-4 hover:underline transition-colors"
          >
            {t("login.signUp")}
          </Link>
        </div>
        <div className="h-px w-full bg-border" />
        <Link
          href={`/${locale}`}
          className="inline-flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("backToHome", { fallback: "Back to home" })}
        </Link>
      </CardFooter>
    </Card>
    </FadeIn>
  );
}
