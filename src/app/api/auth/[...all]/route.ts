import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

// Export GET and POST handlers for all auth endpoints
// This catch-all route handles all auth operations under /api/auth/*
export const { GET, POST } = toNextJsHandler(auth);
