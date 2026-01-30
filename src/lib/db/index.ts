import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

// Validate database URL
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required");
}

// Create PostgreSQL connection pool with optimal settings
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30s
  connectionTimeoutMillis: 2000, // Return error after 2s if connection not established
});

// Handle pool errors to prevent crashes
pool.on("error", (err) => {
  console.error("Unexpected PostgreSQL pool error:", err);
  // Don't exit in production, let the app try to recover
  if (process.env.NODE_ENV === "development") {
    process.exit(-1);
  }
});

// Create Drizzle ORM instance with schema
export const db = drizzle(pool, { schema });

// Export schema for use in other modules
export { schema };

// Export pool for direct queries if needed
export { pool };
