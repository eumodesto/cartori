import { PrismaClient } from "@prisma/client";
import { resolveTestDatabaseUrl } from "../../scripts/test-db.mjs";

/** Confere o banco realmente conectado antes de qualquer teste gravar. */
export default async function setup() {
  const prisma = new PrismaClient({ datasourceUrl: resolveTestDatabaseUrl() });
  try {
    const [row] = await prisma.$queryRaw<Array<{ db: string }>>`select current_database() as db`;
    if (row?.db !== "cartori_test") {
      throw new Error(`Conectado ao banco errado: ${row?.db}`);
    }
    const [migrations] = await prisma.$queryRaw<Array<{ total: bigint }>>`
      select count(*) as total from "_prisma_migrations" where finished_at is not null`;
    if (!migrations || Number(migrations.total) === 0) {
      throw new Error("Banco de teste sem migrations. Rode: npm run db:test:migrate");
    }
  } catch (error) {
    throw new Error(
      `Banco de teste indisponível. Rode: npm run db:test:up && npm run db:test:migrate\n${
        error instanceof Error ? error.message : error
      }`
    );
  } finally {
    await prisma.$disconnect();
  }
}
