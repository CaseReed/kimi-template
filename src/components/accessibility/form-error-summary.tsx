"use client";

import { useEffect, useRef } from "react";
import { AlertCircle } from "lucide-react";

interface FieldError {
  field: string;
  message: string;
  label: string;
}

interface FormErrorSummaryProps {
  errors: FieldError[];
  title?: string;
  className?: string;
}

/**
 * FormErrorSummary - Displays a summary of form errors with navigation links
 * 
 * Accessibility features:
 * - Automatically receives focus when errors appear
 * - Announces errors to screen readers via aria-live
 * - Provides clickable links to jump to each error field
 * - Uses proper heading structure
 * 
 * @example
 * <FormErrorSummary 
 *   errors={[
 *     { field: "email", message: "Invalid email", label: "Email" },
 *     { field: "password", message: "Too short", label: "Password" }
 *   ]}
 * />
 */
export function FormErrorSummary({
  errors,
  title = "Please correct the following errors:",
  className,
}: FormErrorSummaryProps) {
  const errorRef = useRef<HTMLDivElement>(null);

  // Auto-focus when errors appear
  useEffect(() => {
    if (errors.length > 0 && errorRef.current) {
      errorRef.current.focus();
    }
  }, [errors]);

  if (errors.length === 0) return null;

  const handleLinkClick = (fieldId: string) => {
    const field = document.getElementById(fieldId);
    if (field) {
      field.focus();
      field.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <div
      ref={errorRef}
      role="alert"
      aria-live="polite"
      aria-atomic="true"
      tabIndex={-1}
      className={`rounded-md bg-destructive/15 border border-destructive/20 p-4 ${className || ""}`}
    >
      <div className="flex items-start gap-3">
        <AlertCircle 
          className="h-5 w-5 text-destructive shrink-0 mt-0.5" 
          aria-hidden="true" 
        />
        <div className="flex-1">
          <h2 className="text-sm font-semibold text-destructive mb-2">
            {title}
          </h2>
          <ul className="space-y-1.5">
            {errors.map((error) => (
              <li key={error.field}>
                <button
                  type="button"
                  onClick={() => handleLinkClick(error.field)}
                  className="text-sm text-destructive underline underline-offset-2 hover:text-destructive/80 text-left focus:outline-none focus:ring-2 focus:ring-destructive/50 rounded px-1 -mx-1"
                >
                  <span className="font-medium">{error.label}:</span>{" "}
                  {error.message}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

/**
 * Helper function to convert form errors to FieldError array
 */
export function formatFormErrors(
  errors: Record<string, string[] | undefined>,
  fieldLabels: Record<string, string>
): FieldError[] {
  return Object.entries(errors)
    .filter(([, messages]) => messages && messages.length > 0)
    .map(([field, messages]) => ({
      field,
      message: messages![0],
      label: fieldLabels[field] || field,
    }));
}
