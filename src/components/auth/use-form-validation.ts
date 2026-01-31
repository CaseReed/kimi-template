"use client";

import { useState, useCallback } from "react";
import { z } from "zod";

interface FieldError {
  message: string;
}

interface FormValidationState<T extends Record<string, string>> {
  errors: Partial<Record<keyof T, FieldError>>;
  touched: Partial<Record<keyof T, boolean>>;
  isValid: boolean;
}

interface UseFormValidationOptions<T extends Record<string, string>> {
  schema: z.ZodType<T>;
  initialValues: T;
  validateOnBlur?: boolean;
  validateOnChange?: boolean;
}

/**
 * useFormValidation - Hook for real-time form validation with Zod
 * 
 * Features:
 * - Validation on blur
 * - Optional validation on change
 * - Tracks touched fields
 * - Returns validation state and handlers
 * 
 * @example
 * const { errors, touched, handleBlur, validateField } = useFormValidation({
 *   schema: loginSchema,
 *   initialValues: { email: "", password: "" },
 *   validateOnBlur: true,
 * });
 */
export function useFormValidation<T extends Record<string, string>>({
  schema,
  initialValues,
  validateOnBlur = true,
  validateOnChange = false,
}: UseFormValidationOptions<T>) {
  const [errors, setErrors] = useState<Partial<Record<keyof T, FieldError>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});

  /**
   * Validate a single field
   */
  const validateField = useCallback(
    (fieldName: keyof T, value: string, allValues?: T) => {
      try {
        // Create partial object for single field validation
        const partialData = { ...allValues, [fieldName]: value } as T;
        schema.parse(partialData);
        
        // If parsing succeeds, clear error for this field
        setErrors((prev) => {
          const next = { ...prev };
          delete next[fieldName];
          return next;
        });
        return true;
      } catch (error) {
        if (error instanceof z.ZodError) {
          const fieldError = error.issues.find((e: z.ZodIssue) => 
            e.path[0] === fieldName
          );
          
          if (fieldError) {
            setErrors((prev) => ({
              ...prev,
              [fieldName]: { message: fieldError.message },
            }));
            return false;
          } else {
            // Clear error if this field passes but others fail
            setErrors((prev) => {
              const next = { ...prev };
              delete next[fieldName];
              return next;
            });
            return true;
          }
        }
        return false;
      }
    },
    [schema]
  );

  /**
   * Validate all fields
   */
  const validateAll = useCallback(
    (values: T) => {
      try {
        schema.parse(values);
        setErrors({});
        return true;
      } catch (error) {
        if (error instanceof z.ZodError) {
          const newErrors: Partial<Record<keyof T, FieldError>> = {};
          error.issues.forEach((err: z.ZodIssue) => {
            const field = err.path[0] as keyof T;
            if (!newErrors[field]) {
              newErrors[field] = { message: err.message };
            }
          });
          setErrors(newErrors);
        }
        return false;
      }
    },
    [schema]
  );

  /**
   * Handle blur event
   */
  const handleBlur = useCallback(
    (fieldName: keyof T, value: string, allValues?: T) => {
      setTouched((prev) => ({ ...prev, [fieldName]: true }));
      
      if (validateOnBlur) {
        validateField(fieldName, value, allValues);
      }
    },
    [validateOnBlur, validateField]
  );

  /**
   * Handle change event
   */
  const handleChange = useCallback(
    (fieldName: keyof T, value: string, allValues?: T) => {
      if (validateOnChange && touched[fieldName]) {
        validateField(fieldName, value, allValues);
      }
    },
    [validateOnChange, touched, validateField]
  );

  /**
   * Mark all fields as touched
   */
  const touchAll = useCallback(() => {
    const allTouched = Object.keys(initialValues).reduce(
      (acc, key) => ({ ...acc, [key]: true }),
      {} as Record<keyof T, boolean>
    );
    setTouched(allTouched);
  }, [initialValues]);

  /**
   * Clear all errors
   */
  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  /**
   * Clear a specific field error
   */
  const clearFieldError = useCallback((fieldName: keyof T) => {
    setErrors((prev) => {
      const next = { ...prev };
      delete next[fieldName];
      return next;
    });
  }, []);

  /**
   * Check if form is valid
   */
  const isValid = Object.keys(errors).length === 0;

  return {
    errors,
    touched,
    isValid,
    validateField,
    validateAll,
    handleBlur,
    handleChange,
    touchAll,
    clearErrors,
    clearFieldError,
  };
}

/**
 * Simple hook for password confirmation validation
 */
export function usePasswordMatch(password: string, confirmPassword: string) {
  const match = password === confirmPassword;
  const hasValue = confirmPassword.length > 0;
  
  return {
    match,
    hasValue,
    showError: hasValue && !match,
    message: hasValue && !match ? "Passwords do not match" : undefined,
  };
}

/**
 * Debounced validation hook for performance
 */
export function useDebouncedValidation<T extends Record<string, string>>(
  options: UseFormValidationOptions<T>,
  delay = 300
) {
  const validation = useFormValidation(options);
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  const debouncedValidateField = useCallback(
    (fieldName: keyof T, value: string, allValues?: T) => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      
      const timer = setTimeout(() => {
        validation.validateField(fieldName, value, allValues);
      }, delay);
      
      setDebounceTimer(timer);
    },
    [debounceTimer, delay, validation]
  );

  return {
    ...validation,
    debouncedValidateField,
  };
}
