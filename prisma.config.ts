import { existsSync } from "node:fs";
import { defineConfig, env } from "prisma/config";

// Prisma CLI does not load env files itself; Next.js reads .env.local at runtime.
// On Vercel there is no .env.local — variables come from the project settings via process.env.
if (existsSync(".env.local")) process.loadEnvFile(".env.local");

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // Migrations need a direct (non-pgbouncer) connection; on Supabase set DIRECT_URL for that.
    url: process.env.DIRECT_URL ?? env("DATABASE_URL"),
  },
});
