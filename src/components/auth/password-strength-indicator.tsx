"use client";

import { useMemo } from "react";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface PasswordRequirement {
  label: string;
  test: (password: string) => boolean;
}

interface PasswordStrengthIndicatorProps {
  password: string;
  className?: string;
  showRequirements?: boolean;
}

/**
 * Password strength levels
 */
type StrengthLevel = 0 | 1 | 2 | 3 | 4;

/**
 * Password requirements configuration
 */
const REQUIREMENTS: PasswordRequirement[] = [
  {
    label: "At least 8 characters",
    test: (pwd) => pwd.length >= 8,
  },
  {
    label: "Contains uppercase letter",
    test: (pwd) => /[A-Z]/.test(pwd),
  },
  {
    label: "Contains lowercase letter",
    test: (pwd) => /[a-z]/.test(pwd),
  },
  {
    label: "Contains number",
    test: (pwd) => /[0-9]/.test(pwd),
  },
  {
    label: "Contains special character",
    test: (pwd) => /[^A-Za-z0-9]/.test(pwd),
  },
];

/**
 * Calculate password strength (0-4)
 */
function calculateStrength(password: string): StrengthLevel {
  if (!password) return 0;
  
  let score = 0;
  
  // Length check
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  
  // Character variety checks
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  
  const varietyCount = [hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;
  
  if (varietyCount >= 2) score++;
  if (varietyCount >= 3) score++;
  if (varietyCount >= 4 && password.length >= 12) score++;
  
  // Cap at 4
  return Math.min(score, 4) as StrengthLevel;
}

/**
 * Get strength label and color
 */
function getStrengthInfo(strength: StrengthLevel): { label: string; color: string; bgColor: string } {
  switch (strength) {
    case 0:
      return { label: "Very Weak", color: "text-muted-foreground", bgColor: "bg-muted" };
    case 1:
      return { label: "Weak", color: "text-destructive", bgColor: "bg-destructive" };
    case 2:
      return { label: "Fair", color: "text-amber-500", bgColor: "bg-amber-500" };
    case 3:
      return { label: "Good", color: "text-emerald-500", bgColor: "bg-emerald-500" };
    case 4:
      return { label: "Strong", color: "text-emerald-600", bgColor: "bg-emerald-600" };
  }
}

/**
 * PasswordStrengthIndicator - Visual feedback for password strength
 * 
 * Features:
 * - Strength meter bar (0-4 segments)
 * - Strength label (Very Weak → Strong)
 * - Optional requirements checklist
 * 
 * @example
 * <PasswordStrengthIndicator 
 *   password={password} 
 *   showRequirements 
 * />
 */
export function PasswordStrengthIndicator({
  password,
  className,
  showRequirements = true,
}: PasswordStrengthIndicatorProps) {
  const strength = useMemo(() => calculateStrength(password), [password]);
  const { label, color, bgColor } = getStrengthInfo(strength);
  
  // Calculate met requirements
  const metRequirements = useMemo(() => {
    return REQUIREMENTS.map((req) => ({
      ...req,
      met: req.test(password),
    }));
  }, [password]);
  
  const metCount = metRequirements.filter((r) => r.met).length;
  
  // Don't show if no password
  if (!password) {
    return showRequirements ? (
      <div className={cn("space-y-2", className)}>
        <p className="text-xs text-muted-foreground font-medium">Password requirements:</p>
        <ul className="space-y-1">
          {REQUIREMENTS.map((req, index) => (
            <li
              key={index}
              className="flex items-center gap-2 text-xs text-muted-foreground"
            >
              <div className="w-4 h-4 rounded-full border border-muted-foreground/30 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
              </div>
              {req.label}
            </li>
          ))}
        </ul>
      </div>
    ) : null;
  }
  
  return (
    <div className={cn("space-y-3", className)}>
      {/* Strength Meter */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">
            Password strength
          </span>
          <span className={cn("text-xs font-semibold", color)}>
            {label}
          </span>
        </div>
        
        {/* Progress bars */}
        <div className="flex gap-1" role="meter" aria-label="Password strength" aria-valuenow={strength} aria-valuemin={0} aria-valuemax={4}>
          {[1, 2, 3, 4].map((level) => (
            <div
              key={level}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-all duration-300",
                strength >= level ? bgColor : "bg-muted"
              )}
            />
          ))}
        </div>
      </div>
      
      {/* Requirements Checklist */}
      {showRequirements && (
        <ul className="space-y-1.5" aria-label="Password requirements">
          {metRequirements.map((req, index) => (
            <li
              key={index}
              className={cn(
                "flex items-center gap-2 text-xs transition-colors duration-200",
                req.met ? "text-emerald-600" : "text-muted-foreground"
              )}
            >
              <div
                className={cn(
                  "w-4 h-4 rounded-full flex items-center justify-center transition-colors duration-200",
                  req.met
                    ? "bg-emerald-100 text-emerald-600"
                    : "border border-muted-foreground/30"
                )}
                aria-hidden="true"
              >
                {req.met ? (
                  <Check className="w-3 h-3" />
                ) : (
                  <X className="w-3 h-3 text-muted-foreground/50" />
                )}
              </div>
              <span className={req.met ? "line-through opacity-70" : undefined}>
                {req.label}
              </span>
            </li>
          ))}
        </ul>
      )}
      
      {/* Screen reader only summary */}
      <p className="sr-only" role="status">
        Password strength: {label}. {metCount} of {REQUIREMENTS.length} requirements met.
      </p>
    </div>
  );
}

/**
 * PasswordRequirementCheck - Simple checklist without strength meter
 * 
 * @example
 * <PasswordRequirementCheck password={password} />
 */
export function PasswordRequirementCheck({
  password,
  className,
}: {
  password: string;
  className?: string;
}) {
  const metRequirements = useMemo(() => {
    return REQUIREMENTS.map((req) => ({
      ...req,
      met: req.test(password),
    }));
  }, [password]);
  
  return (
    <ul className={cn("space-y-1.5", className)} aria-label="Password requirements">
      {metRequirements.map((req, index) => (
        <li
          key={index}
          className={cn(
            "flex items-center gap-2 text-xs transition-colors duration-200",
            req.met ? "text-emerald-600" : "text-muted-foreground"
          )}
        >
          {req.met ? (
            <Check className="w-3.5 h-3.5 text-emerald-500" aria-hidden="true" />
          ) : (
            <div className="w-3.5 h-3.5 rounded-full border border-muted-foreground/30" aria-hidden="true" />
          )}
          {req.label}
        </li>
      ))}
    </ul>
  );
}

/**
 * Hook to check if password meets minimum requirements
 */
export function usePasswordStrength(password: string) {
  return useMemo(() => {
    const strength = calculateStrength(password);
    const requirements = REQUIREMENTS.map((req) => ({
      ...req,
      met: req.test(password),
    }));
    const isStrong = strength >= 3;
    const allRequirementsMet = requirements.every((r) => r.met);
    
    return {
      strength,
      requirements,
      isStrong,
      allRequirementsMet,
      ...getStrengthInfo(strength),
    };
  }, [password]);
}
