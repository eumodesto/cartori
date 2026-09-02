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

if (!process.env.DATABASE_URL_UNPOOLED && process.env.DATABASE_URL) {
  process.env.DATABASE_URL_UNPOOLED = process.env.DATABASE_URL;
}

if (process.env.DATABASE_URL && process.env.DATABASE_URL_UNPOOLED) {
  run("npx", ["prisma", "migrate", "deploy"]);
} else {
  console.warn(
    "Skipping prisma migrate deploy: DATABASE_URL / DATABASE_URL_UNPOOLED not set."
  );
}

run("npx", ["next", "build"]);
