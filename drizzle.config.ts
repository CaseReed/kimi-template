import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/myapp",
  },
  // Enable strict mode for type safety
  strict: true,
  // Enable verbose logging in development
  verbose: true,
});
