/**
 * Banco local de testes (Docker). Uso:
 *   node scripts/test-db.mjs up       sobe o Postgres descartável
 *   node scripts/test-db.mjs migrate  aplica prisma/migrations
 *   node scripts/test-db.mjs reset    recria o container e aplica as migrations
 *   node scripts/test-db.mjs down     remove o container
 *
 * Todas as ações recusam qualquer banco fora de localhost/cartori_test.
 */
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

export const DEFAULT_TEST_DATABASE_URL =
  "postgresql://postgres:postgres@127.0.0.1:54329/cartori_test";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);

export function resolveTestDatabaseUrl(raw = process.env.TEST_DATABASE_URL) {
  const value = String(raw || DEFAULT_TEST_DATABASE_URL).trim();
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error("TEST_DATABASE_URL inválida.");
  }
  const database = url.pathname.replace(/^\//, "");
  if (!LOCAL_HOSTS.has(url.hostname)) {
    throw new Error(`Banco de teste precisa ser local; host recusado: ${url.hostname}`);
  }
  if (database !== "cartori_test") {
    throw new Error(`Banco de teste precisa se chamar cartori_test; recebido: ${database}`);
  }
  return value;
}

function run(command, args, env = process.env) {
  const result = spawnSync(command, args, { stdio: "inherit", env });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

function prisma(args) {
  const url = resolveTestDatabaseUrl();
  const env = { ...process.env, DATABASE_URL: url, DATABASE_URL_UNPOOLED: url };
  // npx é um .cmd no Windows e só roda via shell; os argumentos são fixos deste script.
  const result = spawnSync(["npx", "prisma", ...args].join(" "), {
    stdio: "inherit",
    env,
    shell: true,
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

function migrate() {
  prisma(["migrate", "deploy"]);
}

const compose = ["compose", "-f", "docker-compose.test.yml"];

function main(action) {
  if (action === "up") {
    run("docker", [...compose, "up", "-d", "--wait"]);
    return;
  }
  if (action === "down") {
    run("docker", [...compose, "down", "-v"]);
    return;
  }
  if (action === "migrate") {
    migrate();
    return;
  }
  if (action === "reset") {
    resolveTestDatabaseUrl();
    run("docker", [...compose, "down", "-v"]);
    run("docker", [...compose, "up", "-d", "--wait"]);
    migrate();
    return;
  }
  console.error("Ação desconhecida. Use: up | migrate | reset | down");
  process.exit(1);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main(process.argv[2]);
}
