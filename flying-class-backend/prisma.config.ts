import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env.PRISMA_DATABASE_URL || process.env.DATABASE_URL,
    shadowDatabaseUrl: env("SHADOW_DATABASE_URL"),
  },
});