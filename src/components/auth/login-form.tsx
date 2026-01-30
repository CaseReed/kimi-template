"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { Github, Chrome, Loader2 } from "lucide-react";
import Link from "next/link";
import { FadeIn } from "@/components/animations/fade-in";

// Validation schema
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

interface LoginFormProps {
  locale: string;
}

export function LoginForm({ locale }: LoginFormProps) {
  const router = useRouter();
  const t = useTranslations("auth");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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

  const errorId = "login-form-error";

  return (
    <FadeIn direction="up" duration={0.5} className="w-full max-w-md">
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
      <CardFooter className="flex flex-col space-y-2 pt-2">
        <div className="text-sm text-muted-foreground">
          {t("login.noAccount")}{" "}
          <Link
            href={`/${locale}/register`}
            className="text-primary font-medium underline-offset-4 hover:underline transition-colors"
          >
            {t("login.signUp")}
          </Link>
        </div>
      </CardFooter>
    </Card>
    </FadeIn>
  );
}
