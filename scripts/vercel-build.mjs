import { spawnSync } from "node:child_process";

function run(command, args) {
  const result = spawnSync(command, args, {
    stdio: "inherit",
    shell: process.platform === "win32",
    env: process.env,
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

run("npx", ["prisma", "generate"]);

// Migrations rodam APENAS em produção e SOMENTE com a conexão direta (não-pooled).
// - Preview/Development nunca migram (build não quebra por falta de env/permissão de banco).
// - Nunca migrar via pgbouncer (pooled): prisma migrate exige conexão direta (DATABASE_URL_UNPOOLED).
const vercelEnv = process.env.VERCEL_ENV || "";
const directUrl = process.env.DATABASE_URL_UNPOOLED || "";

if (vercelEnv === "production" && directUrl) {
  run("npx", ["prisma", "migrate", "deploy"]);
} else {
  console.warn(
    `Pulando 'prisma migrate deploy' (VERCEL_ENV="${vercelEnv || "unset"}", directUrl=${
      directUrl ? "set" : "unset"
    }). Migrações só em produção e via conexão direta.`
  );
}

run("npx", ["next", "build"]);
