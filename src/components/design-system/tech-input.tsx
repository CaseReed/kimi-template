"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Search, Lock, Mail, User, Terminal } from "lucide-react";

// ============================================
// Tech Input Props
// ============================================
export interface TechInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  variant?: "default" | "ghost" | "glow";
  glowColor?: string;
}

// ============================================
// Tech Input Component
// ============================================
const TechInput = React.forwardRef<HTMLInputElement, TechInputProps>(
  (
    {
      className,
      label,
      error,
      hint,
      icon,
      iconPosition = "left",
      variant = "default",
      glowColor = "rgba(0, 217, 255, 0.3)",
      type = "text",
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = React.useState(false);
    const [showPassword, setShowPassword] = React.useState(false);
    const isPassword = type === "password";
    const inputType = isPassword ? (showPassword ? "text" : "password") : type;

    return (
      <div className={cn("space-y-2", className)}>
        {label && (
          <Label
            htmlFor={props.id}
            className={cn(
              "text-sm font-medium transition-colors",
              error ? "text-destructive" : "text-foreground"
            )}
          >
            {label}
            {props.required && <span className="text-destructive ml-1">*</span>}
          </Label>
        )}
        
        <div className="relative">
          {/* Left Icon */}
          {icon && iconPosition === "left" && (
            <div
              className={cn(
                "absolute left-3 top-1/2 -translate-y-1/2 transition-colors duration-200",
                isFocused ? "text-primary" : "text-muted-foreground",
                error && "text-destructive"
              )}
            >
              {icon}
            </div>
          )}

          {/* Input */}
          <Input
            ref={ref}
            type={inputType}
            className={cn(
              // Base styles
              "h-10 bg-background transition-all duration-200",
              
              // Variant styles
              variant === "default" && [
                "border-border focus:border-primary",
                "focus:ring-1 focus:ring-primary/30",
                error && "border-destructive focus:border-destructive focus:ring-destructive/30",
              ],
              
              variant === "ghost" && [
                "border-transparent bg-muted/50 hover:bg-muted",
                "focus:bg-background focus:border-primary",
                error && "focus:border-destructive",
              ],
              
              variant === "glow" && [
                "border-border/50 bg-background/50 backdrop-blur-sm",
                isFocused && `border-primary/50 shadow-[0_0_20px_${glowColor}]`,
                error && "border-destructive/50",
              ],
              
              // Icon padding
              icon && iconPosition === "left" && "pl-10",
              (icon && iconPosition === "right" || isPassword) && "pr-10",
              
              // Placeholder
              "placeholder:text-muted-foreground/60"
            )}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            {...props}
          />

          {/* Right Icon / Password Toggle */}
          {isPassword ? (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          ) : (
            icon &&
            iconPosition === "right" && (
              <div
                className={cn(
                  "absolute right-3 top-1/2 -translate-y-1/2 transition-colors duration-200",
                  isFocused ? "text-primary" : "text-muted-foreground"
                )}
              >
                {icon}
              </div>
            )
          )}
        </div>

        {/* Error or Hint */}
        {(error || hint) && (
          <p
            className={cn(
              "text-xs transition-colors",
              error ? "text-destructive" : "text-muted-foreground"
            )}
          >
            {error || hint}
          </p>
        )}
      </div>
    );
  }
);
TechInput.displayName = "TechInput";

// ============================================
// Pre-configured Input Variants
// ============================================
export function TechSearchInput(props: Omit<TechInputProps, "icon">) {
  return (
    <TechInput
      icon={<Search className="h-4 w-4" />}
      placeholder="Search..."
      variant="ghost"
      {...props}
    />
  );
}

export function TechEmailInput(props: Omit<TechInputProps, "icon" | "type">) {
  return (
    <TechInput
      type="email"
      icon={<Mail className="h-4 w-4" />}
      placeholder="email@example.com"
      {...props}
    />
  );
}

export function TechPasswordInput(props: Omit<TechInputProps, "icon" | "type">) {
  return (
    <TechInput
      type="password"
      icon={<Lock className="h-4 w-4" />}
      placeholder="••••••••"
      {...props}
    />
  );
}

export function TechUsernameInput(props: Omit<TechInputProps, "icon" | "type">) {
  return (
    <TechInput
      type="text"
      icon={<User className="h-4 w-4" />}
      placeholder="username"
      {...props}
    />
  );
}

export function TechCommandInput(props: Omit<TechInputProps, "icon">) {
  return (
    <TechInput
      icon={<Terminal className="h-4 w-4" />}
      placeholder="Type a command..."
      variant="glow"
      className={cn("font-mono text-sm", props.className)}
      {...props}
    />
  );
}

export { TechInput };
