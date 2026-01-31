#!/usr/bin/env tsx
/**
 * Reset admin password by deleting and recreating the user
 * Usage: DATABASE_URL=... pnpm tsx scripts/reset-admin-password.ts
 */

import { eq } from "drizzle-orm";
import { db } from "../src/lib/db";
import { user, account, session } from "../src/lib/db/schema";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@example.com";

async function resetAdmin() {
  console.log("🔄 Resetting admin user...");
  console.log(`   Email: ${ADMIN_EMAIL}`);
  console.log("");

  try {
    // Find existing user using select instead of query
    const existingUsers = await db.select().from(user).where(eq(user.email, ADMIN_EMAIL));
    const existingUser = existingUsers[0];

    if (existingUser) {
      console.log("   Found existing user, deleting...");
      
      // Delete related records first
      await db.delete(session).where(eq(session.userId, existingUser.id));
      await db.delete(account).where(eq(account.userId, existingUser.id));
      await db.delete(user).where(eq(user.id, existingUser.id));
      
      console.log("   ✓ Old user deleted");
    }

    console.log("");
    console.log("✅ User cleared from database.");
    console.log("");
    console.log("   Now create the user via the sign-up form or API.");

  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }

  process.exit(0);
}

resetAdmin();
