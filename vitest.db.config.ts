import path from "node:path";
import { defineConfig } from "vitest/config";
import { resolveTestDatabaseUrl } from "./scripts/test-db.mjs";

/**
 * Testes de integração com Postgres local (docker-compose.test.yml).
 * resolveTestDatabaseUrl recusa qualquer banco fora de localhost/cartori_test.
 */
const databaseUrl = resolveTestDatabaseUrl();

export default defineConfig({
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
  },
  test: {
    include: ["tests/db/**/*.test.ts"],
    environment: "node",
    globalSetup: ["tests/db/global-setup.ts"],
    fileParallelism: false,
    testTimeout: 20_000,
    hookTimeout: 30_000,
    env: {
      DATABASE_URL: databaseUrl,
      DATABASE_URL_UNPOOLED: databaseUrl,
    },
  },
});
