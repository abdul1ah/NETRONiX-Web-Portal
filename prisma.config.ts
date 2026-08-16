import { config } from "dotenv";
import { defineConfig } from "prisma/config";

// Load environment variables from .env.local and .env
config({ path: ".env.local" });
config({ path: ".env" });

/**
 * Prisma CLI commands (db push, migrate) require session mode (port 5432)
 * rather than transaction mode (port 6543) to perform schema introspection and DDL safely.
 */
function getCliDatabaseUrl(): string {
  // If DIRECT_URL is provided and not pointing to unreachable IPv6-only domain, use DIRECT_URL
  if (process.env.DIRECT_URL && !process.env.DIRECT_URL.includes(".supabase.co:")) {
    return process.env.DIRECT_URL;
  }

  // If DATABASE_URL is pointing to a Supabase pooler on port 6543, use session mode port 5432 for CLI
  if (process.env.DATABASE_URL && process.env.DATABASE_URL.includes(":6543")) {
    return process.env.DATABASE_URL.replace(":6543", ":5432").replace("?pgbouncer=true", "").replace("&pgbouncer=true", "");
  }

  return process.env.DIRECT_URL || process.env.DATABASE_URL || "";
}

export default defineConfig({
  datasource: {
    url: getCliDatabaseUrl(),
    shadowDatabaseUrl: process.env.SHADOW_DATABASE_URL,
  },
});
