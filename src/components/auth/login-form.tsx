"use client";

import { useState, useEffect, useActionState } from "react";
import { useTranslations } from "next-intl";
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
import { Github, Chrome, Copy, Check, User, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { FadeIn } from "@/components/animations/fade-in";
import { AnimatedLogo } from "@/components/animations";
import { GradientText } from "@/components/animations";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { SubmitButton, SocialAuthButton } from "./submit-button";
import { validateLogin, type LoginState } from "@/app/actions/auth";
import {
  FormErrorSummary,
  formatFormErrors,
  FormStatusAnnouncer,
} from "@/components/accessibility";

// Test credentials - Must match scripts/seed-admin.ts defaults
const TEST_EMAIL = "admin@example.com";
const TEST_PASSWORD = "admin123456";

interface LoginFormProps {
  locale: string;
}

export function LoginForm({ locale }: LoginFormProps) {
  const t = useTranslations("auth");
  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  
  // React 19 useActionState for form state management
  const [state, action, isPending] = useActionState<LoginState, FormData>(
    validateLogin,
    null
  );

  // Handle successful validation and actual sign in
  useEffect(() => {
    if (state?.success) {
      setAuthError(null);
      // The form was valid, now perform actual authentication
      const form = document.getElementById("login-form") as HTMLFormElement;
      const formData = new FormData(form);
      const email = formData.get("email") as string;
      const password = formData.get("password") as string;

      authClient.signIn.email({
        email,
        password,
        callbackURL: `/${locale}/dashboard`,
      }).then(({ error }) => {
        if (error) {
          // Handle auth error
          setAuthError(error.message || t("errors.invalidCredentials"));
        }
        // On success, Better Auth handles the redirect via callbackURL
      });
    }
  }, [state, locale, t]);

  const handleSocialSignIn = async (provider: "github" | "google") => {
    try {
      await authClient.signIn.social({
        provider,
        callbackURL: `/${locale}/dashboard`,
      });
    } catch {
      // Error handling
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
    const emailInput = document.getElementById("email") as HTMLInputElement;
    const passwordInput = document.getElementById("password") as HTMLInputElement;
    if (emailInput) emailInput.value = TEST_EMAIL;
    if (passwordInput) passwordInput.value = TEST_PASSWORD;
    // Trigger change events to update React state if needed
    emailInput?.dispatchEvent(new Event("change", { bubbles: true }));
    passwordInput?.dispatchEvent(new Event("change", { bubbles: true }));
  };

  // Format errors for the error summary component
  const fieldErrors = state?.errors
    ? formatFormErrors(state.errors, {
        email: t("fields.email"),
        password: t("fields.password"),
      })
    : [];

  // Count total errors (field errors + auth error + general message)
  const totalErrorCount = fieldErrors.length + (authError ? 1 : 0) + (state?.message && !state.success ? 1 : 0);

  // Generate unique IDs for accessibility
  const formId = "login-form";
  const emailErrorId = "email-error";
  const passwordErrorId = "password-error";
  const authErrorId = "auth-error";

  return (
    <FadeIn direction="up" duration={0.5} className="w-full max-w-md">
      {/* Screen reader announcer for form status */}
      <FormStatusAnnouncer
        isSubmitting={isPending}
        errorCount={totalErrorCount}
        submittingMessage={t("login.loading")}
        errorMessage={
          totalErrorCount > 0
            ? `${t("errors.generic")} ${totalErrorCount} field(s) need attention.`
            : undefined
        }
      />

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
          {/* Error Summary - appears when there are validation errors */}
          {fieldErrors.length > 0 && (
            <FormErrorSummary
              errors={fieldErrors}
              title="Please correct the following errors:"
            />
          )}

          {/* Social Login Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <SocialAuthButton
              onClick={() => handleSocialSignIn("github")}
              isLoading={false}
              className="w-full"
              icon={<Github className="mr-2 h-4 w-4" />}
            >
              {t("social.github")}
            </SocialAuthButton>
            <SocialAuthButton
              onClick={() => handleSocialSignIn("google")}
              isLoading={false}
              className="w-full"
              icon={<Chrome className="mr-2 h-4 w-4" />}
            >
              {t("social.google")}
            </SocialAuthButton>
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
            <User className="h-4 w-4 text-amber-600 dark:text-amber-400" aria-hidden="true" />
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
                    aria-label={copiedField === "email" ? t("testCredentials.copied") : t("testCredentials.copy")}
                  >
                    {copiedField === "email" ? (
                      <Check className="h-3 w-3 mr-1" aria-hidden="true" />
                    ) : (
                      <Copy className="h-3 w-3 mr-1" aria-hidden="true" />
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
                    aria-label={copiedField === "password" ? t("testCredentials.copied") : t("testCredentials.copy")}
                  >
                    {copiedField === "password" ? (
                      <Check className="h-3 w-3 mr-1" aria-hidden="true" />
                    ) : (
                      <Copy className="h-3 w-3 mr-1" aria-hidden="true" />
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

          {/* Email/Password Form with React 19 useActionState */}
          <form 
            id={formId}
            action={action}
            className="space-y-4"
            aria-describedby={authError ? authErrorId : undefined}
            suppressHydrationWarning
          >
            {/* Hidden locale field */}
            <input type="hidden" name="locale" value={locale} />

            {/* Auth Error (from Better Auth) */}
            {authError && (
              <div 
                id={authErrorId}
                role="alert" 
                aria-live="polite"
                className="rounded-md bg-destructive/15 p-3 text-sm text-destructive"
              >
                {authError}
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email">
                {t("fields.email")} <span aria-label="required">*</span>
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder={t("fields.emailPlaceholder")}
                required
                disabled={isPending}
                aria-required="true"
                aria-invalid={!!state?.errors?.email}
                aria-describedby={state?.errors?.email ? emailErrorId : undefined}
                autoComplete="email"
                defaultValue={TEST_EMAIL}
              />
              {state?.errors?.email && (
                <p 
                  id={emailErrorId} 
                  role="alert" 
                  className="text-sm text-destructive"
                >
                  {state.errors.email[0]}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">
                  {t("fields.password")} <span aria-label="required">*</span>
                </Label>
                <Link
                  href={`/${locale}/forgot-password`}
                  className="text-xs text-primary hover:underline underline-offset-4"
                >
                  {t("fields.forgotPassword")}
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={t("fields.passwordPlaceholder")}
                  required
                  disabled={isPending}
                  aria-required="true"
                  aria-invalid={!!state?.errors?.password}
                  aria-describedby={state?.errors?.password ? passwordErrorId : undefined}
                  autoComplete="current-password"
                  defaultValue={TEST_PASSWORD}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  )}
                </Button>
              </div>
              {state?.errors?.password && (
                <p 
                  id={passwordErrorId} 
                  role="alert" 
                  className="text-sm text-destructive"
                >
                  {state.errors.password[0]}
                </p>
              )}
            </div>

            {/* Submit Button with useFormStatus */}
            <SubmitButton 
              className="w-full" 
              loadingText={t("login.loading")}
            >
              {t("login.submit")}
            </SubmitButton>
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
            <span aria-hidden="true">←</span>
            {t("backToHome", { fallback: "Back to home" })}
          </Link>
        </CardFooter>
      </Card>
    </FadeIn>
  );
}
