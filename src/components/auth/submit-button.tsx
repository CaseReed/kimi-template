"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SubmitButtonProps {
  children: React.ReactNode;
  loadingText?: string;
  className?: string;
  variant?: "default" | "secondary" | "outline" | "ghost" | "link" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
}

/**
 * SubmitButton - A button that automatically shows loading state
 * Uses React 19's useFormStatus hook to track form submission state
 * 
 * @example
 * <form action={action}>
 *   <input name="email" />
 *   <SubmitButton loadingText="Signing in...">Sign In</SubmitButton>
 * </form>
 */
export function SubmitButton({
  children,
  loadingText = "Loading...",
  className,
  variant = "default",
  size = "default",
}: SubmitButtonProps) {
  const { pending, data } = useFormStatus();

  // Extract email from form data for personalized loading message
  const submittingEmail = data?.get("email") as string | undefined;

  return (
    <Button
      type="submit"
      variant={variant}
      size={size}
      className={className}
      disabled={pending}
      aria-busy={pending}
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
          <span>
            {submittingEmail && loadingText.includes("...")
              ? `${loadingText.replace("...", "")} ${submittingEmail}...`
              : loadingText}
          </span>
        </>
      ) : (
        children
      )}
    </Button>
  );
}

/**
 * SocialAuthButton - A button for social authentication (GitHub, Google, etc.)
 * Tracks its own pending state since it's not part of a form submission
 */
interface SocialAuthButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  isLoading?: boolean;
  className?: string;
  variant?: "default" | "secondary" | "outline" | "ghost" | "link" | "destructive";
  icon?: React.ReactNode;
}

export function SocialAuthButton({
  children,
  onClick,
  isLoading = false,
  className,
  variant = "outline",
  icon,
}: SocialAuthButtonProps) {
  return (
    <Button
      type="button"
      variant={variant}
      onClick={onClick}
      disabled={isLoading}
      className={className}
      aria-busy={isLoading}
    >
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
      ) : (
        icon
      )}
      {children}
    </Button>
  );
}
