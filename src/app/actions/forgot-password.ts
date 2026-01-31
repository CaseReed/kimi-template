"use server";

import { z } from "zod";
import { headers } from "next/headers";

// Simple in-memory rate limiting (use Redis in production)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_MAX = 5; // 5 attempts
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes

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
 * Simple rate limiting check
 * In production, use Redis or Upstash for distributed rate limiting
 */
function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);
  
  if (!record || now > record.resetTime) {
    // New window
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    });
    return true;
  }
  
  if (record.count >= RATE_LIMIT_MAX) {
    return false;
  }
  
  record.count++;
  return true;
}

/**
 * Forgot Password Server Action
 * 
 * SECURITY NOTES:
 * - Rate limited to prevent abuse
 * - Always returns generic success message to prevent email enumeration
 * - Sanitizes email input
 * - Uses timing jitter to prevent timing attacks
 * 
 * TODO: Implement actual email sending with:
 * - Reset token generation
 * - Secure token storage
 * - Email service integration
 */
export async function forgotPasswordAction(
  prevState: ForgotPasswordState,
  formData: FormData
): Promise<ForgotPasswordState> {
  // Get client IP for rate limiting
  const headersList = await headers();
  const clientIp = headersList.get("x-forwarded-for") ?? "anonymous";
  
  // Check rate limit
  if (!checkRateLimit(clientIp)) {
    return {
      success: false,
      message: "Too many attempts. Please try again later.",
    };
  }
  
  // Get specific field instead of using Object.fromEntries
  const emailRaw = formData.get("email");
  
  if (typeof emailRaw !== "string") {
    return {
      errors: { email: ["Please enter a valid email address"] },
      message: "Please check your input and try again.",
      success: false,
    };
  }
  
  // Sanitize email
  const email = emailRaw.trim().toLowerCase();
  
  // Validate input
  const validated = forgotPasswordSchema.safeParse({ email });
  
  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
      message: "Please check your input and try again.",
      success: false,
    };
  }

  try {
    // TODO: Implement actual password reset logic
    // 1. Check if email exists (don't reveal result)
    // 2. Generate reset token with expiration
    // 3. Send email with reset link
    // 4. Store hashed token in database
    
    // Timing jitter to prevent timing attacks (800-1200ms)
    const jitter = 800 + Math.random() * 400;
    await new Promise((resolve) => setTimeout(resolve, jitter));
    
    // Always return generic success message
    // This prevents email enumeration attacks
    return {
      success: true,
      message: "If an account exists with this email, you will receive password reset instructions.",
    };
  } catch (error) {
    // Log error securely (don't expose to client)
    // In production, use a proper logging service
    if (process.env.NODE_ENV === "development") {
      console.error("Forgot password failed:", error instanceof Error ? error.message : "Unknown error");
    }
    
    return {
      message: "An error occurred. Please try again later.",
      success: false,
    };
  }
}
