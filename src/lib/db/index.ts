import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { neon } from "@neondatabase/serverless";
import { Pool } from "pg";
import * as schema from "./schema";

// Validate database URL
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required");
}

// Detect environment: Neon (production) vs Local Docker (development)
const isNeon = process.env.DATABASE_URL?.includes("neon.tech");

let db: ReturnType<typeof drizzleNeon> | ReturnType<typeof drizzlePg>;
let pool: Pool | undefined;

if (isNeon) {
  // Neon Serverless - for Vercel Edge/Serverless Functions
  const sql = neon(process.env.DATABASE_URL);
  db = drizzleNeon({ client: sql, schema });
} else {
  // Local PostgreSQL - for Docker development
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });

  pool.on("error", (err) => {
    console.error("Unexpected PostgreSQL pool error:", err);
    if (process.env.NODE_ENV === "development") {
      process.exit(-1);
    }
  });

  db = drizzlePg(pool, { schema });
}

/**
 * Database pool instance.
 * ⚠️ Only available in local development (node-postgres).
 * In production (Neon), this is `undefined`.
 * Use `db` for queries in both environments.
 */
export { db, schema, pool };
