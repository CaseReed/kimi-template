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
import { Github, Chrome, Eye, EyeOff, Check, X } from "lucide-react";
import Link from "next/link";
import { FadeIn } from "@/components/animations/fade-in";
import { AnimatedLogo } from "@/components/animations";
import { GradientText } from "@/components/animations";
import { SubmitButton, SocialAuthButton } from "./submit-button";
import { validateRegister, type RegisterState } from "@/app/actions/auth";
import {
  FormErrorSummary,
  formatFormErrors,
  FormStatusAnnouncer,
} from "@/components/accessibility";
import { PasswordStrengthIndicator, usePasswordStrength } from "./password-strength-indicator";
import { usePasswordMatch } from "./use-form-validation";

interface RegisterFormProps {
  locale: string;
}

export function RegisterForm({ locale }: RegisterFormProps) {
  const t = useTranslations("auth");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  
  // Real-time form values for UX features
  const [formValues, setFormValues] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  
  // Track touched fields for onBlur validation
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  
  // React 19 useActionState for form state management
  const [state, action, isPending] = useActionState<RegisterState, FormData>(
    validateRegister,
    null
  );

  // Password strength analysis
  const passwordStrength = usePasswordStrength(formValues.password);
  
  // Password match validation
  const passwordMatch = usePasswordMatch(
    formValues.password,
    formValues.confirmPassword
  );

  // Handle successful validation and actual sign up
  useEffect(() => {
    if (state?.success) {
      setAuthError(null);
      // The form was valid, now perform actual registration
      const form = document.getElementById("register-form") as HTMLFormElement;
      const formData = new FormData(form);
      const name = formData.get("name") as string;
      const email = formData.get("email") as string;
      const password = formData.get("password") as string;

      authClient.signUp.email({
        name,
        email,
        password,
        callbackURL: `/${locale}/dashboard`,
      }).then(({ error }) => {
        if (error) {
          // Handle auth error
          setAuthError(error.message || t("errors.generic"));
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

  const handleInputChange = (field: keyof typeof formValues, value: string) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleBlur = (field: keyof typeof formValues) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  // Format errors for the error summary component
  const fieldErrors = state?.errors
    ? formatFormErrors(state.errors, {
        name: t("fields.name"),
        email: t("fields.email"),
        password: t("fields.password"),
        confirmPassword: t("fields.confirmPassword"),
      })
    : [];

  // Count total errors
  const totalErrorCount = fieldErrors.length + (authError ? 1 : 0);

  // Generate unique IDs for accessibility
  const formId = "register-form";
  const nameErrorId = "name-error";
  const emailErrorId = "email-error";
  const passwordErrorId = "password-error";
  const confirmPasswordErrorId = "confirm-password-error";
  const passwordStrengthId = "password-strength";
  const authErrorId = "auth-error";

  return (
    <FadeIn direction="up" duration={0.5} className="w-full max-w-md">
      {/* Screen reader announcer for form status */}
      <FormStatusAnnouncer
        isSubmitting={isPending}
        errorCount={totalErrorCount}
        submittingMessage={t("register.loading")}
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
            {t("register.title")}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {t("register.description")}
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

          {/* Registration Form with React 19 useActionState */}
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

            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name">
                {t("fields.name")} <span aria-label="required">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder={t("fields.namePlaceholder")}
                required
                disabled={isPending}
                aria-required="true"
                aria-invalid={!!state?.errors?.name || (touched.name && formValues.name.length < 2)}
                aria-describedby={state?.errors?.name ? nameErrorId : undefined}
                autoComplete="name"
                value={formValues.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                onBlur={() => handleBlur("name")}
              />
              {/* Real-time validation feedback */}
              {touched.name && formValues.name.length > 0 && formValues.name.length < 2 && !state?.errors?.name && (
                <p className="text-sm text-amber-600" role="alert">
                  Name must be at least 2 characters
                </p>
              )}
              {state?.errors?.name && (
                <p 
                  id={nameErrorId} 
                  role="alert" 
                  className="text-sm text-destructive"
                >
                  {state.errors.name[0]}
                </p>
              )}
            </div>

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
                value={formValues.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
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

            {/* Password Field with Strength Indicator */}
            <div className="space-y-2">
              <Label htmlFor="password">
                {t("fields.password")} <span aria-label="required">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={t("fields.createPasswordPlaceholder")}
                  required
                  disabled={isPending}
                  aria-required="true"
                  aria-invalid={!!state?.errors?.password}
                  aria-describedby={`${passwordStrengthId} ${state?.errors?.password ? passwordErrorId : ""}`}
                  autoComplete="new-password"
                  className="pr-10"
                  value={formValues.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
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
              
              {/* Password Strength Indicator */}
              <div id={passwordStrengthId}>
                <PasswordStrengthIndicator 
                  password={formValues.password}
                  showRequirements
                />
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

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">
                {t("fields.confirmPassword")} <span aria-label="required">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder={t("fields.confirmPasswordPlaceholder")}
                  required
                  disabled={isPending}
                  aria-required="true"
                  aria-invalid={!!state?.errors?.confirmPassword || (passwordMatch.showError)}
                  aria-describedby={state?.errors?.confirmPassword ? confirmPasswordErrorId : passwordMatch.showError ? confirmPasswordErrorId : undefined}
                  autoComplete="new-password"
                  className="pr-10"
                  value={formValues.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                  aria-pressed={showConfirmPassword}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  )}
                </Button>
              </div>
              
              {/* Real-time password match indicator */}
              {formValues.confirmPassword && (
                <div className="flex items-center gap-2 text-sm">
                  {passwordMatch.match ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-500" aria-hidden="true" />
                      <span className="text-emerald-600">Passwords match</span>
                    </>
                  ) : (
                    <>
                      <X className="h-4 w-4 text-destructive" aria-hidden="true" />
                      <span className="text-destructive">Passwords do not match</span>
                    </>
                  )}
                </div>
              )}
              
              {state?.errors?.confirmPassword && (
                <p 
                  id={confirmPasswordErrorId} 
                  role="alert" 
                  className="text-sm text-destructive"
                >
                  {state.errors.confirmPassword[0]}
                </p>
              )}
            </div>

            {/* Submit Button with useFormStatus */}
            <SubmitButton 
              className="w-full" 
              loadingText={t("register.loading")}
            >
              {t("register.submit")}
            </SubmitButton>
          </form>
        </CardContent>
        
        <CardFooter className="flex flex-col gap-3 pt-2">
          <div className="text-sm text-muted-foreground">
            {t("register.hasAccount")}{" "}
            <Link
              href={`/${locale}/login`}
              className="text-primary font-medium underline-offset-4 hover:underline transition-colors"
            >
              {t("register.signIn")}
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
