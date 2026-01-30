"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Loader2, LogOut } from "lucide-react";

interface LogoutButtonProps {
  locale: string;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function LogoutButton({
  locale,
  variant = "ghost",
  size = "default",
  className,
}: LogoutButtonProps) {
  const router = useRouter();
  const t = useTranslations("auth");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogout = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await authClient.signOut();
      router.push(`/${locale}/login`);
      router.refresh();
    } catch {
      setError(t("errors.logoutFailed"));
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={handleLogout}
        disabled={isLoading}
        className={className}
        aria-label={t("logout")}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          <>
            <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
            {t("logout")}
          </>
        )}
      </Button>
      {error && (
        <span className="sr-only" role="alert">
          {error}
        </span>
      )}
    </>
  );
}
