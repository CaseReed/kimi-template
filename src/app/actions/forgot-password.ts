"use server";

import { z } from "zod";

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export type ForgotPasswordState = {
  errors?: {
    email?: string[];
  };
  message?: string;
  success?: boolean;
} | null;

/**
 * Forgot Password Server Action
 * 
 * Note: This is a placeholder implementation.
 * In production, this would:
 * 1. Verify the email exists in the database
 * 2. Generate a reset token
 * 3. Send an email with a reset link
 * 4. Store the token with an expiration date
 */
export async function forgotPasswordAction(
  prevState: ForgotPasswordState,
  formData: FormData
): Promise<ForgotPasswordState> {
  const rawData = Object.fromEntries(formData);
  
  // Validate input
  const validated = forgotPasswordSchema.safeParse(rawData);
  
  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
      message: "Please check your input and try again.",
      success: false,
    };
  }

  const { email } = validated.data;

  try {
    // TODO: Implement actual password reset logic
    // 1. Check if email exists
    // 2. Generate reset token
    // 3. Send email
    // 4. Store token in database
    
    // For now, simulate a delay and return success
    // This prevents email enumeration attacks
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    // Always return success to prevent email enumeration
    // Even if the email doesn't exist, we don't reveal that information
    return {
      success: true,
      message: "If an account exists with this email, you will receive password reset instructions.",
    };
  } catch (error) {
    console.error("Forgot password error:", error);
    return {
      message: "An error occurred. Please try again later.",
      success: false,
    };
  }
}
