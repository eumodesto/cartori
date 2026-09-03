import { createClient } from "@supabase/supabase-js";
import { PrismaClient } from "@prisma/client";
import fs from "node:fs";
import path from "node:path";

const BASE = process.env.CARTORI_BASE_URL || "http://127.0.0.1:3006";

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

type Row = {
  scenario: string;
  role: string;
  tenant: string;
  http: number;
  leaked: boolean;
  result: "PASS" | "FAIL";
};

const rows: Row[] = [];
const prisma = new PrismaClient();

function cookieHeader(res: Response) {
  const raw =
    typeof res.headers.getSetCookie === "function"
      ? res.headers.getSetCookie()
      : [res.headers.get("set-cookie") || ""];
  return raw
    .filter(Boolean)
    .map((item) => item.split(";")[0])
    .join("; ");
}

async function jsonFetch(url: string, init: RequestInit = {}) {
  const res = await fetch(url, init);
  const text = await res.text();
  let body: Record<string, unknown> = {};
  try {
    body = text ? (JSON.parse(text) as Record<string, unknown>) : {};
  } catch {
    body = { raw: text };
  }
  return { status: res.status, body, cookies: cookieHeader(res) };
}

function record(row: Omit<Row, "result"> & { pass: boolean }) {
  rows.push({
    scenario: row.scenario,
    role: row.role,
    tenant: row.tenant,
    http: row.http,
    leaked: row.leaked,
    result: row.pass ? "PASS" : "FAIL",
  });
}

function makeCnpj(seed: number) {
  const calc = (base: string, weights: number[]) => {
    const total = base
      .split("")
      .reduce((acc, digit, index) => acc + Number(digit) * weights[index], 0);
    const rest = total % 11;
    return rest < 2 ? 0 : 11 - rest;
  };
  const w1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const w2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const prefix = String(980000000000 + (seed % 8999999999)).padStart(12, "0").slice(0, 12);
  const d1 = calc(prefix, w1);
  const d2 = calc(prefix + String(d1), w2);
  return prefix + String(d1) + String(d2);
}

async function main() {
  const suffix = `${Date.now()}`;
  const password = "Etapa5test!";
  const emailA = `etapa5.a.${suffix}@example.invalid`;
  const emailB = `etapa5.b.${suffix}@example.invalid`;
  const createdAuthIds: string[] = [];
  const createdUserIds: string[] = [];
  const createdOrderIds: string[] = [];
  const createdOrgIds: string[] = [];

  const anonOrg = await jsonFetch(`${BASE}/api/org`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ cnpj: "00", plan: "PARTNER", role: "ADMIN" }),
  });
  record({
    scenario: "anônimo POST /api/org",
    role: "anon",
    tenant: "-",
    http: anonOrg.status,
    leaked: false,
    pass: anonOrg.status === 401,
  });

  const mpGone = await jsonFetch(`${BASE}/api/payments/mercadopago`, { method: "POST" });
  record({
    scenario: "POST /api/payments/mercadopago removido",
    role: "anon",
    tenant: "-",
    http: mpGone.status,
    leaked: false,
    pass: mpGone.status === 404,
  });

  const anonOrders = await jsonFetch(`${BASE}/api/orders`);
  record({
    scenario: "anônimo GET /api/orders",
    role: "anon",
    tenant: "-",
    http: anonOrders.status,
    leaked: Array.isArray(anonOrders.body.orders),
    pass: anonOrders.status === 401 && !Array.isArray(anonOrders.body.orders),
  });

  async function signup(email: string) {
    return jsonFetch(`${BASE}/api/auth/signup`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        name: "Etapa 5 Teste",
        role: "ADMIN",
        plan: "PARTNER",
        organizationId: "00000000-0000-0000-0000-000000000099",
      }),
    });
  }

  const signA = await signup(emailA);
  const signB = await signup(emailB);
  const profileA = (signA.body.profile || {}) as Record<string, unknown>;
  const profileB = (signB.body.profile || {}) as Record<string, unknown>;

  record({
    scenario: "signup A com role ADMIN e plan PARTNER no body",
    role: String(profileA.role || "none"),
    tenant: String(profileA.organization || "null"),
    http: signA.status,
    leaked: profileA.role === "ADMIN" || Boolean(profileA.organization),
    pass: signA.status === 200 && profileA.role === "CLIENT" && profileA.organization == null,
  });

  if (typeof profileA.authId === "string") createdAuthIds.push(profileA.authId);
  if (typeof profileB.authId === "string") createdAuthIds.push(profileB.authId);
  if (typeof profileA.id === "string") createdUserIds.push(profileA.id);
  if (typeof profileB.id === "string") createdUserIds.push(profileB.id);

  const cookieA = signA.cookies;
  const cookieB = signB.cookies;

  async function cleanupTemps() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (url && service) {
      const admin = createClient(url, service, {
        auth: { autoRefreshToken: false, persistSession: false },
      });
      for (const authId of createdAuthIds) {
        await admin.auth.admin.deleteUser(authId);
      }
    }
    if (createdOrderIds.length) {
      await prisma.order.deleteMany({ where: { id: { in: createdOrderIds } } });
    }
    if (createdUserIds.length) {
      await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
    }
    if (createdOrgIds.length) {
      await prisma.organization.deleteMany({ where: { id: { in: createdOrgIds } } });
    }
  }

  if (typeof profileA.id !== "string" || typeof profileB.id !== "string") {
    await cleanupTemps();
    throw new Error("signup failed");
  }

  try {
    const adulterated = await jsonFetch(`${BASE}/api/org`, {
      method: "POST",
      headers: { "content-type": "application/json", cookie: cookieA },
      body: JSON.stringify({
        cnpj: "00",
        role: "ADMIN",
        plan: "PARTNER",
        isPartner: true,
        organizationId: "00000000-0000-0000-0000-000000000077",
        sellerOrgId: "00000000-0000-0000-0000-000000000076",
        userId: profileB.id,
      }),
    });
    const meAfter = await jsonFetch(`${BASE}/api/auth/me`, { headers: { cookie: cookieA } });
    const me = (meAfter.body.profile || {}) as Record<string, unknown>;
    record({
      scenario: "POST /api/org body adulterado (role/plan/org)",
      role: String(me.role || "none"),
      tenant: String(me.organization || "null"),
      http: adulterated.status,
      leaked: me.role === "ADMIN" || me.role === "OPERATOR" || Boolean(me.organization),
      pass: adulterated.status === 400 && me.role === "CLIENT" && me.organization == null,
    });

    const orderNumber = 920000 + Number(suffix.slice(-5));
    const personal = await prisma.order.create({
      data: {
        orderNumber,
        protocol: `E5-${suffix}`,
        userId: String(profileA.id),
        status: "PENDING_PAYMENT",
        totalAmount: 1,
        itemsTotal: 1,
        customerName: "Etapa 5",
        customerEmail: emailA,
        customerPhone: "11999999999",
        customerCpfCnpj: "00000000000",
      },
    });
    createdOrderIds.push(personal.id);

    const cnpjA = makeCnpj(Number(suffix.slice(-8)));
    const cnpjB = makeCnpj(Number(suffix.slice(-8)) + 17);
    const orgA = await prisma.organization.create({
      data: {
        name: "Etapa5 Empresa A",
        cnpj: cnpjA,
        plan: "STANDARD",
        phone: "nao-informado",
        email: emailA,
      },
    });
    createdOrgIds.push(orgA.id);
    await prisma.user.update({
      where: { id: String(profileA.id) },
      data: { organizationId: orgA.id, role: "B2B_ADMIN" },
    });

    const meBiz = await jsonFetch(`${BASE}/api/auth/me`, { headers: { cookie: cookieA } });
    const biz = (meBiz.body.profile || {}) as Record<string, unknown>;
    const bizOrg = (biz.organization || {}) as Record<string, unknown>;
    record({
      scenario: "Caso B: B2B_ADMIN + Organization STANDARD não é Partner",
      role: String(biz.role || "none"),
      tenant: String(bizOrg.plan || "none"),
      http: meBiz.status,
      leaked: bizOrg.plan === "PARTNER",
      pass: meBiz.status === 200 && biz.role === "B2B_ADMIN" && bizOrg.plan === "STANDARD",
    });

    const stillPersonal = await prisma.order.findUnique({
      where: { id: personal.id },
      select: { organizationId: true },
    });
    record({
      scenario: "pedido pessoal anterior não é migrado ao virar B2B_ADMIN",
      role: "B2B_ADMIN",
      tenant: "org-a",
      http: 200,
      leaked: stillPersonal?.organizationId === orgA.id,
      pass: stillPersonal?.organizationId == null,
    });

    const listA = await jsonFetch(`${BASE}/api/orders`, { headers: { cookie: cookieA } });
    const listAOrders = Array.isArray(listA.body.orders)
      ? (listA.body.orders as Array<Record<string, unknown>>)
      : [];
    record({
      scenario: "B2B_ADMIN lista somente próprios pedidos (userId)",
      role: "B2B_ADMIN",
      tenant: "org-a",
      http: listA.status,
      leaked: false,
      pass: listA.status === 200 && listAOrders.some((item) => item.id === personal.id),
    });

    const idempotent = await jsonFetch(`${BASE}/api/org`, {
      method: "POST",
      headers: { "content-type": "application/json", cookie: cookieA },
      body: JSON.stringify({ cnpj: cnpjA, plan: "PARTNER", role: "ADMIN" }),
    });
    const meIdem = await jsonFetch(`${BASE}/api/auth/me`, { headers: { cookie: cookieA } });
    const idem = (meIdem.body.profile || {}) as Record<string, unknown>;
    const idemOrg = (idem.organization || {}) as Record<string, unknown>;
    const orgCount = await prisma.organization.count({ where: { cnpj: cnpjA } });
    record({
      scenario: "B2B_ADMIN reenvia mesmo CNPJ com plan PARTNER no body",
      role: String(idem.role || "none"),
      tenant: String(idemOrg.plan || "none"),
      http: idempotent.status,
      leaked: idemOrg.plan === "PARTNER" || orgCount !== 1,
      pass:
        (idempotent.status === 400 ||
          idempotent.status === 404 ||
          idempotent.status === 200) &&
        idem.role === "B2B_ADMIN" &&
        idemOrg.plan === "STANDARD" &&
        orgCount === 1,
    });

    const orgTaken = await prisma.organization.create({
      data: {
        name: "Etapa5 Empresa B",
        cnpj: cnpjB,
        plan: "STANDARD",
        phone: "nao-informado",
        email: emailB,
      },
    });
    createdOrgIds.push(orgTaken.id);

    const steal = await jsonFetch(`${BASE}/api/org`, {
      method: "POST",
      headers: { "content-type": "application/json", cookie: cookieB },
      body: JSON.stringify({ cnpj: cnpjB, role: "B2B_ADMIN" }),
    });
    const meB = await jsonFetch(`${BASE}/api/auth/me`, { headers: { cookie: cookieB } });
    const profB = (meB.body.profile || {}) as Record<string, unknown>;
    record({
      scenario: "CLIENT B tenta CNPJ de outra Organization",
      role: String(profB.role || "none"),
      tenant: String(profB.organization || "null"),
      http: steal.status,
      leaked: Boolean(profB.organization) || steal.status === 200,
      pass: steal.status === 409 && profB.role === "CLIENT" && profB.organization == null,
    });

    await prisma.user.update({
      where: { id: String(profileB.id) },
      data: { role: "B2B_MEMBER", organizationId: orgA.id },
    });
    const member = await jsonFetch(`${BASE}/api/org`, {
      method: "POST",
      headers: { "content-type": "application/json", cookie: cookieB },
      body: JSON.stringify({ cnpj: "00", plan: "PARTNER" }),
    });
    record({
      scenario: "B2B_MEMBER POST /api/org",
      role: "B2B_MEMBER",
      tenant: "org-a",
      http: member.status,
      leaked: false,
      pass: member.status === 403,
    });

    await prisma.user.update({
      where: { id: String(profileB.id) },
      data: { role: "OPERATOR", organizationId: null },
    });
    const operator = await jsonFetch(`${BASE}/api/org`, {
      method: "POST",
      headers: { "content-type": "application/json", cookie: cookieB },
      body: JSON.stringify({ cnpj: "00" }),
    });
    record({
      scenario: "OPERATOR POST /api/org",
      role: "OPERATOR",
      tenant: "-",
      http: operator.status,
      leaked: false,
      pass: operator.status === 403,
    });

    await prisma.user.update({
      where: { id: String(profileB.id) },
      data: { role: "ADMIN" },
    });
    const admin = await jsonFetch(`${BASE}/api/org`, {
      method: "POST",
      headers: { "content-type": "application/json", cookie: cookieB },
      body: JSON.stringify({ cnpj: "00" }),
    });
    record({
      scenario: "ADMIN POST /api/org",
      role: "ADMIN",
      tenant: "-",
      http: admin.status,
      leaked: false,
      pass: admin.status === 403,
    });

    const foreignOrder = await jsonFetch(`${BASE}/api/orders/${personal.id}`, {
      headers: { cookie: cookieB },
    });
    record({
      scenario: "ADMIN interno não lê pedido alheio pela API de cliente",
      role: "ADMIN",
      tenant: "-",
      http: foreignOrder.status,
      leaked: Boolean(foreignOrder.body.order),
      pass: foreignOrder.status === 404 && !foreignOrder.body.order,
    });
  } finally {
    await cleanupTemps();
  }

  console.log("RESULTS");
  for (const row of rows) {
    console.log(
      `${row.result}\t${row.http}\tleaked=${row.leaked}\t${row.role}\t${row.tenant}\t${row.scenario}`
    );
  }
  if (rows.some((row) => row.result === "FAIL")) process.exitCode = 1;
}

main()
  .catch((error) => {
    console.error("etapa5-http-check failed", error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
