#!/usr/bin/env tsx
/**
 * Seed script to create admin user directly in database
 * Usage for production: 
 *   DATABASE_URL=postgresql://... pnpm tsx scripts/seed-admin-prod.ts
 */

import { hash } from "bcryptjs";
import { db } from "../src/lib/db";
import { user, account } from "../src/lib/db/schema";
import { eq } from "drizzle-orm";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@example.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123456";
const ADMIN_NAME = process.env.ADMIN_NAME || "Admin User";

async function seedAdmin() {
  console.log("🌱 Seeding admin user to production database...");
  console.log(`   Email: ${ADMIN_EMAIL}`);
  console.log(`   Name: ${ADMIN_NAME}`);
  console.log("");

  try {
    // Check if user already exists
    const existingUser = await db.query.user.findFirst({
      where: eq(user.email, ADMIN_EMAIL),
    });

    if (existingUser) {
      console.log("ℹ️  Admin user already exists.");
      console.log("   You can login with the existing credentials.");
      process.exit(0);
    }

    // Generate user ID
    const userId = crypto.randomUUID();
    const now = new Date();

    // Hash password with bcrypt (same as Better Auth)
    const hashedPassword = await hash(ADMIN_PASSWORD, 10);

    // Create user
    await db.insert(user).values({
      id: userId,
      email: ADMIN_EMAIL,
      name: ADMIN_NAME,
      emailVerified: true, // Auto-verify for admin
      createdAt: now,
      updatedAt: now,
    });

    // Create account with password
    await db.insert(account).values({
      id: crypto.randomUUID(),
      userId: userId,
      accountId: userId, // For email/password, accountId = userId
      providerId: "credential", // Better Auth uses "credential" for email/password
      password: hashedPassword,
      createdAt: now,
      updatedAt: now,
    });

    console.log("✅ Admin user created successfully!");
    console.log("");
    console.log("   You can now login with:");
    console.log(`   Email: ${ADMIN_EMAIL}`);
    console.log(`   Password: ${ADMIN_PASSWORD}`);
  } catch (error) {
    console.error("❌ Error seeding admin:", error);
    process.exit(1);
  }

  process.exit(0);
}

seedAdmin();
