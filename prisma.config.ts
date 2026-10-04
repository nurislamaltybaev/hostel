import { defineConfig, env } from "prisma/config";

// Prisma CLI does not load env files itself; Next.js reads .env.local at runtime.
process.loadEnvFile(".env.local");

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
