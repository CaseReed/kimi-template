"use server";

import { z } from "zod";

// ============================================================================
// Validation Schemas
// ============================================================================

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// ============================================================================
// Types
// ============================================================================

export type LoginState = {
  errors?: {
    email?: string[];
    password?: string[];
  };
  message?: string;
  success?: boolean;
} | null;

export type RegisterState = {
  errors?: {
    name?: string[];
    email?: string[];
    password?: string[];
    confirmPassword?: string[];
  };
  message?: string;
  success?: boolean;
} | null;

export type LoginInput = {
  email: string;
  password: string;
  locale: string;
};

export type RegisterInput = {
  name: string;
  email: string;
  password: string;
  locale: string;
};

// ============================================================================
// Server Actions - Validation Only
// ============================================================================

/**
 * Validates login form data on the server
 * Returns validated data or field errors
 * 
 * Note: Actual authentication happens client-side via Better Auth
 * to properly handle session cookies with nextCookies() plugin
 */
export async function validateLogin(
  prevState: LoginState,
  formData: FormData
): Promise<{ success: true; data: { email: string; password: string; locale: string } } | { success: false; state: LoginState }> {
  const rawData = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };
  
  const locale = (formData.get("locale") as string) || "en";
  
  // Validate input
  const validated = loginSchema.safeParse(rawData);
  
  if (!validated.success) {
    return {
      success: false,
      state: {
        errors: validated.error.flatten().fieldErrors,
        message: "Please check your input and try again.",
        success: false,
      },
    };
  }

  return {
    success: true,
    data: {
      ...validated.data,
      locale,
    },
  };
}

/**
 * Validates registration form data on the server
 * Returns validated data or field errors
 */
export async function validateRegister(
  prevState: RegisterState,
  formData: FormData
): Promise<{ success: true; data: { name: string; email: string; password: string; locale: string } } | { success: false; state: RegisterState }> {
  const rawData = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string,
  };
  
  const locale = (formData.get("locale") as string) || "en";
  
  // Validate input
  const validated = registerSchema.safeParse(rawData);
  
  if (!validated.success) {
    return {
      success: false,
      state: {
        errors: validated.error.flatten().fieldErrors,
        message: "Please check your input and try again.",
        success: false,
      },
    };
  }

  return {
    success: true,
    data: {
      name: validated.data.name,
      email: validated.data.email,
      password: validated.data.password,
      locale,
    },
  };
}

// ============================================================================
// Legacy exports for backward compatibility during migration
// Will be removed after full migration to useActionState
// ============================================================================

export async function loginAction(
  prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const result = await validateLogin(prevState, formData);
  
  if (!result.success) {
    return (result as { success: false; state: LoginState }).state;
  }
  
  // Return success - actual auth happens client-side
  return { success: true };
}

export async function registerAction(
  prevState: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const result = await validateRegister(prevState, formData);
  
  if (!result.success) {
    return (result as { success: false; state: RegisterState }).state;
  }
  
  // Return success - actual auth happens client-side
  return { success: true };
}
