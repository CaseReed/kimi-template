#!/usr/bin/env tsx
/**
 * Seed script to create admin user via Better Auth API
 * Usage for production: 
 *   BETTER_AUTH_URL=https://your-app.vercel.app pnpm tsx scripts/seed-admin-prod.ts
 */

const BETTER_AUTH_URL = process.env.BETTER_AUTH_URL || "http://localhost:3000";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@example.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123456";
const ADMIN_NAME = process.env.ADMIN_NAME || "Admin User";

async function seedAdminProd() {
  console.log("🌱 Seeding admin user via Better Auth API...");
  console.log(`   URL: ${BETTER_AUTH_URL}`);
  console.log(`   Email: ${ADMIN_EMAIL}`);
  console.log(`   Name: ${ADMIN_NAME}`);
  console.log("");

  try {
    const response = await fetch(`${BETTER_AUTH_URL}/api/auth/sign-up/email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        name: ADMIN_NAME,
      }),
    });

    const contentType = response.headers.get("content-type");
    let data;
    
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = { message: text };
    }

    if (response.ok) {
      console.log("✅ Admin user created successfully!");
      console.log("");
      console.log("   You can now login with:");
      console.log(`   Email: ${ADMIN_EMAIL}`);
      console.log(`   Password: ${ADMIN_PASSWORD}`);
    } else if (response.status === 409 || data.message?.includes("already exists")) {
      console.log("ℹ️  Admin user already exists.");
      console.log("   Updating password...");
      
      console.log("   Please use the password reset flow or delete the user manually.")
    } else {
      console.error("❌ Failed to create admin user:");
      console.error("   Status:", response.status);
      console.error("   Error:", data.message || JSON.stringify(data));
      process.exit(1);
    }
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }

  process.exit(0);
}

seedAdminProd();
