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

// Validation schema with confirm password
const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

interface RegisterFormProps {
  locale: string;
}

export function RegisterForm({ locale }: RegisterFormProps) {
  const router = useRouter();
  const t = useTranslations("auth");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // Client-side validation
    const validation = registerSchema.safeParse({
      name,
      email,
      password,
      confirmPassword,
    });
    if (!validation.success) {
      setError(validation.error.issues[0].message);
      setIsLoading(false);
      return;
    }

    try {
      const { error: signUpError } = await authClient.signUp.email({
        email,
        password,
        name,
        callbackURL: `/${locale}/dashboard`,
      });

      if (signUpError) {
        setError(signUpError.message || t("errors.generic"));
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

  const errorId = "register-form-error";

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">{t("register.title")}</CardTitle>
        <CardDescription>{t("register.description")}</CardDescription>
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

        {/* Registration Form */}
        <form 
          onSubmit={handleSubmit} 
          className="space-y-4"
          aria-describedby={error ? errorId : undefined}
          suppressHydrationWarning
        >
          <div className="space-y-2">
            <Label htmlFor="name">
              {t("fields.name")} <span aria-label="required">*</span>
            </Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder={t("fields.namePlaceholder")}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={isLoading}
              aria-required="true"
            />
          </div>
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
            <Label htmlFor="password">
              {t("fields.password")} <span aria-label="required">*</span>
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder={t("fields.createPasswordPlaceholder")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              aria-required="true"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">
              {t("fields.confirmPassword")} <span aria-label="required">*</span>
            </Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder={t("fields.confirmPasswordPlaceholder")}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
                {t("register.loading")}
              </>
            ) : (
              t("register.submit")
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <div className="text-sm text-muted-foreground">
          {t("register.hasAccount")}{" "}
          <Link
            href={`/${locale}/login`}
            className="text-primary underline-offset-4 hover:underline"
          >
            {t("register.signIn")}
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
