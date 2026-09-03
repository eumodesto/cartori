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
  detail?: string;
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

async function jsonFetch(
  url: string,
  init: RequestInit = {}
): Promise<{ status: number; body: Record<string, unknown>; cookies: string }> {
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
    detail: row.detail,
  });
}

function digitsCnpj(seed: number) {
  return String(98000000000000 + (seed % 899999999999)).slice(0, 14);
}

async function main() {
  const suffix = `${Date.now()}`;
  const password = "Etapa4test!";
  const emailA = `etapa4.a.${suffix}@example.invalid`;
  const emailB = `etapa4.b.${suffix}@example.invalid`;
  const emailC = `etapa4.c.${suffix}@example.invalid`;
  const createdAuthIds: string[] = [];
  const createdUserIds: string[] = [];
  const createdOrderIds: string[] = [];
  const createdOrgIds: string[] = [];

  const roleCountsBefore = await prisma.user.groupBy({
    by: ["role"],
    _count: { _all: true },
  });
  const orgOrderCount = await prisma.order.count({
    where: { organizationId: { not: null } },
  });
  console.log(
    "ROLE_COUNTS_BEFORE",
    JSON.stringify(
      roleCountsBefore.map((item) => ({ role: item.role, count: item._count._all }))
    )
  );
  console.log("ORDERS_WITH_ORGANIZATION_ID", orgOrderCount);

  const anonOrders = await jsonFetch(`${BASE}/api/orders`);
  record({
    scenario: "anônimo GET /api/orders",
    role: "anon",
    tenant: "-",
    http: anonOrders.status,
    leaked: Array.isArray(anonOrders.body.orders),
    pass: anonOrders.status === 401 && !Array.isArray(anonOrders.body.orders),
  });

  const anonOrder = await jsonFetch(`${BASE}/api/orders/00000000-0000-0000-0000-000000000000`);
  record({
    scenario: "anônimo GET /api/orders/[id]",
    role: "anon",
    tenant: "-",
    http: anonOrder.status,
    leaked: Boolean(anonOrder.body.order),
    pass: anonOrder.status === 401 && !anonOrder.body.order,
  });

  const anonPartner = await jsonFetch(`${BASE}/api/org/partner`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ cnpj: "00000000000000", role: "ADMIN" }),
  });
  record({
    scenario: "anônimo POST /api/org/partner",
    role: "anon",
    tenant: "-",
    http: anonPartner.status,
    leaked: false,
    pass: anonPartner.status === 401,
  });

  const mpGone = await jsonFetch(`${BASE}/api/payments/mercadopago`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ orderId: "x" }),
  });
  record({
    scenario: "POST /api/payments/mercadopago removido",
    role: "anon",
    tenant: "-",
    http: mpGone.status,
    leaked: false,
    pass: mpGone.status === 404,
  });

  const webhookGet = await jsonFetch(`${BASE}/api/payments/webhook`);
  record({
    scenario: "GET webhook MP",
    role: "anon",
    tenant: "-",
    http: webhookGet.status,
    leaked: false,
    pass: webhookGet.status === 405,
  });

  const webhookBad = await jsonFetch(`${BASE}/api/payments/webhook`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ type: "payment", data: { id: "1" } }),
  });
  record({
    scenario: "POST webhook sem assinatura",
    role: "anon",
    tenant: "-",
    http: webhookBad.status,
    leaked: false,
    pass: webhookBad.status === 401,
  });

  async function signup(email: string) {
    const res = await jsonFetch(`${BASE}/api/auth/signup`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        name: "Etapa 4 Teste",
        role: "ADMIN",
        organizationId: "00000000-0000-0000-0000-000000000099",
        userId: "00000000-0000-0000-0000-000000000098",
      }),
    });
    return res;
  }

  const signA = await signup(emailA);
  const signB = await signup(emailB);
  const signC = await signup(emailC);
  const profileA = (signA.body.profile || {}) as Record<string, unknown>;
  const profileB = (signB.body.profile || {}) as Record<string, unknown>;
  const profileC = (signC.body.profile || {}) as Record<string, unknown>;

  record({
    scenario: "signup A com role ADMIN no body",
    role: String(profileA.role || "none"),
    tenant: String(profileA.organization || "null"),
    http: signA.status,
    leaked: profileA.role === "ADMIN",
    pass:
      signA.status === 200 &&
      profileA.role === "CLIENT" &&
      profileA.organization == null,
  });
  record({
    scenario: "signup B/C para isolamento",
    role: String(profileB.role || "none"),
    tenant: "-",
    http: signB.status,
    leaked: false,
    pass: signA.status === 200 && signB.status === 200 && signC.status === 200,
  });

  if (typeof profileA.authId === "string") createdAuthIds.push(profileA.authId);
  if (typeof profileB.authId === "string") createdAuthIds.push(profileB.authId);
  if (typeof profileC.authId === "string") createdAuthIds.push(profileC.authId);
  if (typeof profileA.id === "string") createdUserIds.push(profileA.id);
  if (typeof profileB.id === "string") createdUserIds.push(profileB.id);
  if (typeof profileC.id === "string") createdUserIds.push(profileC.id);

  const cookieA = signA.cookies;
  const cookieB = signB.cookies;
  const cookieC = signC.cookies;

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

  if (
    typeof profileA.id !== "string" ||
    typeof profileB.id !== "string" ||
    typeof profileC.id !== "string"
  ) {
    await cleanupTemps();
    throw new Error("signup failed; temp accounts cleaned");
  }

  try {
  const orgA = await prisma.organization.create({
    data: {
      name: "Etapa4 Org A",
      cnpj: digitsCnpj(Number(suffix.slice(-8))),
      phone: "nao-informado",
      email: emailA,
    },
  });
  const orgB = await prisma.organization.create({
    data: {
      name: "Etapa4 Org B",
      cnpj: digitsCnpj(Number(suffix.slice(-8)) + 1),
      phone: "nao-informado",
      email: emailB,
    },
  });
  createdOrgIds.push(orgA.id, orgB.id);

  await prisma.organizationMember.createMany({
    data: [
      {
        userId: String(profileA.id),
        organizationId: orgA.id,
        orgRole: "OWNER",
        status: "ACTIVE",
        joinedAt: new Date(),
      },
      {
        userId: String(profileB.id),
        organizationId: orgA.id,
        orgRole: "MEMBER",
        status: "ACTIVE",
        joinedAt: new Date(),
      },
      {
        userId: String(profileC.id),
        organizationId: orgB.id,
        orgRole: "OWNER",
        status: "ACTIVE",
        joinedAt: new Date(),
      },
    ],
  });

  const orderNumber = 910000 + Number(suffix.slice(-5));
  const orderB = await prisma.order.create({
    data: {
      orderNumber,
      protocol: `E4-${suffix}`,
      userId: String(profileB.id),
      organizationId: orgA.id,
      status: "PENDING_PAYMENT",
      totalAmount: 1,
      itemsTotal: 1,
      customerName: "Etapa 4",
      customerEmail: emailB,
      customerPhone: "11999999999",
      customerCpfCnpj: "00000000000",
    },
  });
  createdOrderIds.push(orderB.id);

  const listA = await jsonFetch(`${BASE}/api/orders`, {
    headers: { cookie: cookieA },
  });
  const listAOrders = Array.isArray(listA.body.orders)
    ? (listA.body.orders as Array<Record<string, unknown>>)
    : [];
  const listALeaked = listAOrders.some((item) => item.id === orderB.id);
  record({
    scenario: "CLIENT A lista pedidos; pedido de B na mesma org",
    role: "CLIENT",
    tenant: "org-a",
    http: listA.status,
    leaked: listALeaked,
    pass: listA.status === 200 && !listALeaked,
  });

  const getAonB = await jsonFetch(`${BASE}/api/orders/${orderB.id}`, {
    headers: { cookie: cookieA },
  });
  record({
    scenario: "CLIENT A lê pedido de B (mesma org)",
    role: "CLIENT",
    tenant: "org-a",
    http: getAonB.status,
    leaked: Boolean(getAonB.body.order),
    pass: getAonB.status === 404 && !getAonB.body.order,
  });

  const getBonB = await jsonFetch(`${BASE}/api/orders/${orderB.id}`, {
    headers: { cookie: cookieB },
  });
  record({
    scenario: "CLIENT B lê próprio pedido",
    role: "CLIENT",
    tenant: "org-a",
    http: getBonB.status,
    leaked: false,
    pass: getBonB.status === 200 && Boolean(getBonB.body.order),
  });

  const getConB = await jsonFetch(`${BASE}/api/orders/${orderB.id}`, {
    headers: { cookie: cookieC },
  });
  record({
    scenario: "CLIENT C (org B) lê pedido org A",
    role: "CLIENT",
    tenant: "org-b",
    http: getConB.status,
    leaked: Boolean(getConB.body.order),
    pass: getConB.status === 404 && !getConB.body.order,
  });

  const escalateOrders = await jsonFetch(`${BASE}/api/orders`, {
    method: "POST",
    headers: { "content-type": "application/json", cookie: cookieA },
    body: JSON.stringify({
      role: "ADMIN",
      userId: profileB.id,
      organizationId: orgB.id,
      sellerOrgId: orgB.id,
      customer: { fullName: "X" },
    }),
  });
  const meAfterEscalate = await jsonFetch(`${BASE}/api/auth/me`, {
    headers: { cookie: cookieA },
  });
  const meProfile = (meAfterEscalate.body.profile || {}) as Record<string, unknown>;
  record({
    scenario: "POST /api/orders com role/userId/org no body",
    role: String(meProfile.role || "none"),
    tenant: String((meProfile.organization as { id?: string } | null)?.id || "org-a"),
    http: escalateOrders.status,
    leaked: meProfile.role === "ADMIN" || meProfile.role === "OPERATOR",
    pass:
      escalateOrders.status === 400 &&
      meProfile.role === "CLIENT" &&
      (meProfile.organization as { id?: string } | null)?.id === orgA.id,
  });

  const partnerEscalate = await jsonFetch(`${BASE}/api/org/partner`, {
    method: "POST",
    headers: { "content-type": "application/json", cookie: cookieA },
    body: JSON.stringify({
      cnpj: "00",
      role: "ADMIN",
      organizationId: orgB.id,
      userId: profileB.id,
    }),
  });
  const meAfterPartner = await jsonFetch(`${BASE}/api/auth/me`, {
    headers: { cookie: cookieA },
  });
  const mePartner = (meAfterPartner.body.profile || {}) as Record<string, unknown>;
  record({
    scenario: "POST /api/org/partner body.role=ADMIN CNPJ inválido",
    role: String(mePartner.role || "none"),
    tenant: "org-a",
    http: partnerEscalate.status,
    leaked: mePartner.role === "ADMIN",
    pass: partnerEscalate.status === 400 && mePartner.role === "CLIENT",
  });

  await prisma.organizationMember.update({
    where: {
      userId_organizationId: {
        userId: String(profileA.id),
        organizationId: orgA.id,
      },
    },
    data: { orgRole: "MEMBER" },
  });
  const memberPartner = await jsonFetch(`${BASE}/api/org/partner`, {
    method: "POST",
    headers: { "content-type": "application/json", cookie: cookieA },
    body: JSON.stringify({ cnpj: "00", role: "ADMIN" }),
  });
  record({
    scenario: "MEMBER POST /api/org/partner",
    role: "CLIENT",
    tenant: "org-a",
    http: memberPartner.status,
    leaked: false,
    pass: memberPartner.status === 403,
  });
  } finally {
    await cleanupTemps();
  }

  const roleCountsAfter = await prisma.user.groupBy({
    by: ["role"],
    _count: { _all: true },
  });
  console.log(
    "ROLE_COUNTS_AFTER",
    JSON.stringify(
      roleCountsAfter.map((item) => ({ role: item.role, count: item._count._all }))
    )
  );

  console.log("RESULTS");
  for (const row of rows) {
    console.log(
      `${row.result}\t${row.http}\tleaked=${row.leaked}\t${row.role}\t${row.tenant}\t${row.scenario}`
    );
  }
  const failed = rows.filter((row) => row.result === "FAIL");
  if (failed.length) {
    process.exitCode = 1;
  }
}

main()
  .catch((error) => {
    console.error("etapa4-http-check failed", error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
