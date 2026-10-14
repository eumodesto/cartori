import path from "node:path";
import { defineConfig } from "vitest/config";

/**
 * Testes unitários: sem banco.
 * DATABASE_URL aponta para uma porta fechada para que uma consulta acidental
 * falhe em vez de cair no banco do .env (Prisma lê o .env quando a variável falta).
 */
export default defineConfig({
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
  },
  test: {
    include: ["tests/unit/**/*.test.ts"],
    environment: "node",
    env: {
      DATABASE_URL: "postgresql://unit-tests-have-no-database@127.0.0.1:1/none",
      DATABASE_URL_UNPOOLED: "postgresql://unit-tests-have-no-database@127.0.0.1:1/none",
    },
  },
});
