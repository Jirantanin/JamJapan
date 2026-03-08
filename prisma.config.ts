import "dotenv/config";
import { defineConfig } from "prisma/config";

const isDev = process.env.NODE_ENV !== "production";

export default defineConfig({
  // dev → SQLite (schema.dev.prisma), prod → PostgreSQL (schema.prisma)
  schema: isDev ? "prisma/schema.dev.prisma" : "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
