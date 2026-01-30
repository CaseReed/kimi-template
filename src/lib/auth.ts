import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "./db";
import * as schema from "./db/schema";

// Validate required environment variables
if (!process.env.BETTER_AUTH_SECRET) {
  throw new Error("BETTER_AUTH_SECRET is required. Generate with: openssl rand -base64 32");
}

if (process.env.BETTER_AUTH_SECRET.length < 32) {
  throw new Error("BETTER_AUTH_SECRET must be at least 32 characters");
}

// Better Auth configuration with Drizzle ORM adapter
export const auth = betterAuth({
  // Required: Secret for session encryption (min 32 chars)
  secret: process.env.BETTER_AUTH_SECRET,
  
  // Required: Base URL for callbacks
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  
  // Trusted origins for CSRF protection
  trustedOrigins: [
    process.env.BETTER_AUTH_URL || "http://localhost:3000",
    "http://localhost:3000",
    "http://localhost:3001",
  ].filter(Boolean),

  // Database configuration using Drizzle Adapter
  database: drizzleAdapter(db, {
    provider: "pg", // ✅ CORRECT: "pg" not "postgresql"
    schema: {       // ✅ ADD: Explicit schema mapping
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),

  // Email/password authentication
  emailAndPassword: {
    enabled: true,
    autoSignInAfterSignUp: true,
    requireEmailVerification: process.env.NODE_ENV === "production",
    minPasswordLength: 8,
    maxPasswordLength: 128,
  },

  // Social providers (only if credentials are provided)
  socialProviders: {
    ...(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET && {
      github: {
        clientId: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
      },
    }),
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      },
    }),
  },

  // Session configuration
  session: {
    expiresIn: 60 * 60 * 24,     // 24 hours
    updateAge: 60 * 60,          // Refresh every hour
    freshAge: 60 * 5,            // 5 minutes for sensitive operations
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,            // 5 minutes cache
    },
  },

  // Rate limiting
  rateLimit: {
    enabled: true,
    window: 60, // 1 minute window
    max: 5,     // 5 requests per window
    customRules: {
      "/sign-in/email": {
        window: 300, // 5 minutes
        max: 3,      // 3 attempts max
      },
    },
  },

  // Advanced configuration
  advanced: {
    crossSubDomainCookies: {
      enabled: process.env.NODE_ENV === "production",
    },
  },

  // Plugins - nextCookies MUST be last
  plugins: [nextCookies()],
});

// Export type for TypeScript inference
export type Auth = typeof auth;
