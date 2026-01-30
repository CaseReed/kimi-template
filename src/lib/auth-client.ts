"use client";

import { createAuthClient } from "better-auth/react";

// Create the auth client for React components
export const authClient = createAuthClient({
  // Base URL is automatically detected from current domain
});

// Export specific methods for convenience
export const {
  signIn,
  signUp,
  signOut,
  useSession,
  getSession,
} = authClient;
