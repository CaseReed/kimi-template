"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { ArrowLeft, Mail, CheckCircle } from "lucide-react";
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
import { FadeIn } from "@/components/animations/fade-in";
import { AnimatedLogo } from "@/components/animations";
import { GradientText } from "@/components/animations";
import { SubmitButton } from "./submit-button";
import { forgotPasswordAction, type ForgotPasswordState } from "@/app/actions/forgot-password";
import { FormErrorSummary, formatFormErrors, FormStatusAnnouncer } from "@/components/accessibility";

interface ForgotPasswordFormProps {
  locale: string;
}

export function ForgotPasswordForm({ locale }: ForgotPasswordFormProps) {
  const t = useTranslations("auth");
  
  // React 19 useActionState for form state management
  const [state, action, isPending] = useActionState<ForgotPasswordState, FormData>(
    forgotPasswordAction,
    null
  );

  const isSuccess = state?.success === true;
  
  // Format errors for the error summary component
  const fieldErrors = state?.errors
    ? formatFormErrors(state.errors, {
        email: t("fields.email"),
      })
    : [];

  // Generate unique IDs for accessibility
  const formId = "forgot-password-form";
  const emailErrorId = "email-error";
  const successMessageId = "success-message";

  return (
    <FadeIn direction="up" duration={0.5} className="w-full max-w-md">
      {/* Screen reader announcer for form status */}
      <FormStatusAnnouncer
        isSubmitting={isPending}
        isSuccess={isSuccess}
        successMessage="Password reset email sent successfully"
        errorCount={fieldErrors.length}
        submittingMessage="Sending reset instructions..."
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
            Reset Password
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Enter your email address and we&apos;ll send you instructions to reset your password.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Error Summary */}
          {fieldErrors.length > 0 && !isSuccess && (
            <FormErrorSummary
              errors={fieldErrors}
              title="Please correct the following error:"
            />
          )}

          {/* Success Message */}
          {isSuccess ? (
            <div 
              id={successMessageId}
              role="alert"
              aria-live="polite"
              className="rounded-md bg-emerald-50 border border-emerald-200 p-4 text-center"
            >
              <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto mb-3" aria-hidden="true" />
              <h3 className="text-lg font-semibold text-emerald-800 mb-2">
                Check Your Email
              </h3>
              <p className="text-sm text-emerald-700">
                {state?.message}
              </p>
            </div>
          ) : (
            <form 
              id={formId}
              action={action}
              className="space-y-4"
              suppressHydrationWarning
            >
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email">
                  {t("fields.email")} <span aria-label="required">*</span>
                </Label>
                <div className="relative">
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
                    className="pl-10"
                  />
                  <Mail 
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" 
                    aria-hidden="true" 
                  />
                </div>
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

              {/* Submit Button */}
              <SubmitButton 
                className="w-full" 
                loadingText="Sending..."
              >
                Send Reset Instructions
              </SubmitButton>
            </form>
          )}
        </CardContent>
        
        <CardFooter className="flex flex-col gap-3 pt-2">
          <div className="h-px w-full bg-border" />
          <div className="flex flex-col gap-2 text-center">
            <Link
              href={`/${locale}/login`}
              className="inline-flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Sign In
            </Link>
            <Link
              href={`/${locale}`}
              className="inline-flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <span aria-hidden="true">←</span>
              {t("backToHome", { fallback: "Back to home" })}
            </Link>
          </div>
        </CardFooter>
      </Card>
    </FadeIn>
  );
}
