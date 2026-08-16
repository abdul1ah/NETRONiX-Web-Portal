import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { config } from "dotenv";

// Load local environment variables when invoked outside Next.js runtime
if (!process.env.DATABASE_URL && !process.env.DIRECT_URL) {
  config({ path: ".env.local" });
  config({ path: ".env" });
}

// DATABASE_URL is preferred for application runtime (Supabase Transaction Pooler, Port 6543)
const connectionString = process.env.DATABASE_URL || process.env.DIRECT_URL;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const pool = new pg.Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
