/**
 * Inventário de grants + RLS no Postgres do Cartori.
 *
 * Postura esperada (Data API fechada, authz na aplicação):
 * - Tabelas Prisma em public: sem GRANT a anon/authenticated/PUBLIC
 * - RLS ligado, zero policies (deny-all para quem não tem BYPASSRLS)
 * - service_role / postgres intactos
 *
 * Uso:
 *   npx tsx scripts/inspect-supabase-rls.ts
 *   npx tsx scripts/inspect-supabase-rls.ts --schema-only
 *
 * Live inspect requer DATABASE_URL (.env / .env.local).
 * Probe REST opcional: NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY.
 */
import fs from "node:fs";
import path from "node:path";
import type { PrismaClient } from "@prisma/client";

function loadEnvFile(file: string) {
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

loadEnvFile(path.join(process.cwd(), ".env"));
loadEnvFile(path.join(process.cwd(), ".env.local"));

const PRISMA_PUBLIC_TABLES = [
  "User",
  "Organization",
  "OrganizationMember",
  "Order",
  "OrderItem",
  "Payment",
  "Cartorio",
  "Product",
  "ProductField",
  "ProductPrice",
  "Dossier",
  "DossierSubject",
  "SubjectIdentifier",
  "_prisma_migrations",
] as const;

const FORBIDDEN_GRANTEES = new Set(["anon", "authenticated", "public"]);

type TableAcl = {
  table: string;
  rls: boolean;
  forceRls: boolean;
  grantees: string[];
};

type PolicyRow = {
  schemaname: string;
  tablename: string;
  policyname: string;
  cmd: string;
  roles_text: string;
  permissive: string;
};

function modelsFromSchema(schemaPath: string) {
  const src = fs.readFileSync(schemaPath, "utf8");
  return [...src.matchAll(/^model\s+(\w+)/gm)].map((match) => match[1]);
}

function inspectSchemaAlignment() {
  const failures: string[] = [];
  const models = modelsFromSchema(path.join(process.cwd(), "prisma/schema.prisma"));
  const listed = PRISMA_PUBLIC_TABLES.filter((name) => name !== "_prisma_migrations");
  const modelSet = new Set(models);
  const listedSet = new Set<string>(listed);

  for (const name of listed) {
    if (!modelSet.has(name)) {
      failures.push(`lista RLS cita ${name}, mas o schema.prisma não tem esse model`);
    }
  }
  for (const name of models) {
    if (!listedSet.has(name)) {
      failures.push(`model ${name} no schema sem cobertura na migration/lista RLS`);
    }
  }
  return { models, listed, failures };
}

function fail(failures: string[], message: string) {
  failures.push(message);
}

async function inspectDatabase(prisma: PrismaClient) {
  const failures: string[] = [];
  const notices: string[] = [];

  const tables = await prisma.$queryRaw<
    { relname: string; rls: boolean; force_rls: boolean }[]
  >`
    SELECT
      c.relname,
      c.relrowsecurity AS rls,
      c.relforcerowsecurity AS force_rls
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relkind = 'r'
    ORDER BY c.relname
  `;

  const grants = await prisma.$queryRaw<
    { relname: string; grantee: string }[]
  >`
    SELECT DISTINCT
      c.relname,
      CASE
        WHEN a.grantee = 0 THEN 'public'
        ELSE r.rolname
      END AS grantee
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    CROSS JOIN LATERAL aclexplode(c.relacl) a
    LEFT JOIN pg_roles r ON r.oid = a.grantee
    WHERE n.nspname = 'public'
      AND c.relkind = 'r'
      AND c.relacl IS NOT NULL
    ORDER BY c.relname, grantee
  `;

  const policies = await prisma.$queryRaw<PolicyRow[]>`
    SELECT
      schemaname,
      tablename,
      policyname,
      cmd,
      roles::text AS roles_text,
      permissive
    FROM pg_policies
    WHERE schemaname = 'public'
    ORDER BY tablename, policyname
  `;

  const byTable = new Map<string, TableAcl>();
  for (const row of tables) {
    byTable.set(row.relname, {
      table: row.relname,
      rls: row.rls,
      forceRls: row.force_rls,
      grantees: [],
    });
  }

  const grantSet = new Map<string, Set<string>>();
  for (const row of grants) {
    if (!row.grantee) continue;
    if (!grantSet.has(row.relname)) grantSet.set(row.relname, new Set());
    grantSet.get(row.relname)!.add(row.grantee);
  }
  for (const [name, acl] of byTable) {
    acl.grantees = [...(grantSet.get(name) ?? [])].sort();
  }

  const expected = new Set<string>(PRISMA_PUBLIC_TABLES);
  const present = new Set(tables.map((row) => row.relname));

  for (const name of PRISMA_PUBLIC_TABLES) {
    if (!present.has(name)) {
      fail(failures, `tabela Prisma ausente no public: ${name}`);
      continue;
    }
    const acl = byTable.get(name)!;
    if (!acl.rls) {
      fail(failures, `${name}: RLS desligado`);
    }
    const forbidden = acl.grantees.filter((grantee) => FORBIDDEN_GRANTEES.has(grantee));
    if (forbidden.length) {
      fail(
        failures,
        `${name}: GRANT indevido a ${forbidden.join(", ")} (grantees: ${acl.grantees.join(", ")})`
      );
    }
  }

  for (const policy of policies) {
    if (expected.has(policy.tablename)) {
      fail(
        failures,
        `${policy.tablename}: policy "${policy.policyname}" (${policy.permissive} ${policy.cmd} roles=${policy.roles_text}) — Data API deve ter zero policies`
      );
    } else {
      notices.push(
        `policy extra em ${policy.tablename}: ${policy.policyname} (${policy.cmd})`
      );
    }
  }

  for (const row of tables) {
    if (expected.has(row.relname)) continue;
    const acl = byTable.get(row.relname)!;
    const forbidden = acl.grantees.filter((grantee) => FORBIDDEN_GRANTEES.has(grantee));
    if (!acl.rls) {
      fail(
        failures,
        `tabela extra ${row.relname}: RLS desligado (grantees: ${acl.grantees.join(", ") || "owner"})`
      );
    } else if (forbidden.length) {
      fail(
        failures,
        `tabela extra ${row.relname}: GRANT a ${forbidden.join(", ")} com RLS=${acl.rls}`
      );
    } else {
      notices.push(`tabela extra no public: ${row.relname} (RLS=${acl.rls})`);
    }
  }

  const roles = await prisma.$queryRaw<{ rolname: string; bypass: boolean }[]>`
    SELECT rolname, rolbypassrls AS bypass
    FROM pg_roles
    WHERE rolname IN ('postgres', 'anon', 'authenticated', 'service_role', 'authenticator')
    ORDER BY rolname
  `;

  return {
    tables: [...byTable.values()].sort((a, b) => a.table.localeCompare(b.table)),
    policies,
    roles,
    failures,
    notices,
  };
}

async function inspectDataApi() {
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/$/, "");
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  if (
    !url ||
    !anon ||
    url.includes("your-project-id") ||
    url.includes("placeholder") ||
    anon.includes("your-supabase") ||
    anon.includes("placeholder")
  ) {
    return {
      skipped: true as const,
      probes: [] as { table: string; status: number; ok: boolean; detail: string }[],
    };
  }

  const probes: { table: string; status: number; ok: boolean; detail: string }[] = [];
  const targets = ["User", "Order", "Payment", "OrganizationMember", "Dossier"];

  for (const table of targets) {
    const res = await fetch(`${url}/rest/v1/${table}?select=*&limit=1`, {
      headers: {
        apikey: anon,
        Authorization: `Bearer ${anon}`,
        Accept: "application/json",
      },
    });
    const body = (await res.text()).slice(0, 240);
    const leaked = res.ok;
    probes.push({
      table,
      status: res.status,
      ok: !leaked,
      detail: leaked ? `Data API aberta: ${body}` : `${res.status} ${body}`,
    });
  }

  return { skipped: false as const, probes };
}

async function main() {
  const schemaOnly = process.argv.includes("--schema-only");
  const schema = inspectSchemaAlignment();

  if (schema.failures.length) {
    console.log(JSON.stringify({ schema, failures: schema.failures }, null, 2));
    console.error(`\n${schema.failures.length} falha(s) de alinhamento schema ↔ lista RLS.`);
    process.exitCode = 1;
    return;
  }

  if (schemaOnly) {
    console.log(JSON.stringify({ schema, ok: true }, null, 2));
    console.error("\nLista RLS alinhada ao schema.prisma.");
    return;
  }

  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL não definido. Sem conexão não dá para inventariar RLS.");
    console.error("Use --schema-only para checar só o alinhamento com o Prisma schema.");
    process.exit(1);
  }

  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient();
  try {
    const db = await inspectDatabase(prisma);
    const api = await inspectDataApi();

    const failures = [
      ...schema.failures,
      ...db.failures,
      ...(api.skipped
        ? []
        : api.probes
            .filter((probe) => !probe.ok)
            .map((probe) => `REST ${probe.table}: ${probe.detail}`)),
    ];

    console.log(
      JSON.stringify(
        {
          schema,
          tables: db.tables,
          policies: db.policies,
          roles: db.roles,
          notices: db.notices,
          dataApi: api,
          failures,
        },
        null,
        2
      )
    );

    if (failures.length) {
      console.error(`\n${failures.length} falha(s) de postura RLS/Data API.`);
      process.exitCode = 1;
      return;
    }

    console.error("\nPostura RLS/Data API ok: grants fechados, RLS deny-all, zero policies Prisma.");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
