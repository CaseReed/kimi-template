#!/usr/bin/env tsx
/**
 * Verify admin email directly in DB
 * Usage: DATABASE_URL=... pnpm tsx scripts/verify-email.ts
 */

import { eq } from "drizzle-orm";
import { db } from "../src/lib/db";
import { user } from "../src/lib/db/schema";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@example.com";

async function verifyEmail() {
  console.log("✓ Verifying email...");
  
  await db.update(user)
    .set({ emailVerified: true })
    .where(eq(user.email, ADMIN_EMAIL));
  
  console.log("✅ Email verified!");
}

verifyEmail().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
