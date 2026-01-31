#!/usr/bin/env tsx
/**
 * Seed script to create an admin user for initial setup
 * Usage: pnpm db:seed:admin
 * 
 * Note: This script requires the Next.js app to be running
 */

const BASE_URL = process.env.BETTER_AUTH_URL || "http://localhost:3000";

async function seedAdminLocal() {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123456";
  const adminName = process.env.ADMIN_NAME || "Admin User";

  console.log("🌱 Seeding admin user...");
  console.log(`   Email: ${adminEmail}`);
  console.log(`   Name: ${adminName}`);
  console.log("");

  try {
    const response = await fetch(`${BASE_URL}/api/auth/sign-up/email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: adminEmail,
        password: adminPassword,
        name: adminName,
      }),
    });

    // Check if response has content
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
      console.log(`   Email: ${adminEmail}`);
      console.log(`   Password: ${adminPassword}`);
      console.log("");
      console.log(`   URL: ${BASE_URL}/login`);
    } else if (response.status === 409 || data.message?.includes("already exists")) {
      console.log("ℹ️  Admin user already exists.");
      console.log("");
      console.log("   You can login with the existing credentials.");
    } else {
      console.error("❌ Failed to create admin user:");
      console.error("   Status:", response.status);
      console.error("   Error:", data.message || JSON.stringify(data));
      process.exit(1);
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes("fetch failed")) {
      console.error("❌ Error: Could not connect to the server.");
      console.error("   Make sure the Next.js app is running:");
      console.error(`   pnpm dev`);
      console.error("");
      console.error("   Or if using Docker:");
      console.error(`   docker-compose -f docker-compose.prod.yml up -d`);
    } else {
      console.error("❌ Error seeding admin:", error);
    }
    process.exit(1);
  }
}

seedAdminLocal();
