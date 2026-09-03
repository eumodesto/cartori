import { createClient } from "@supabase/supabase-js";
import { PrismaClient } from "@prisma/client";
import fs from "node:fs";
import path from "node:path";
import { persistCreatorOnboarding } from "../src/lib/org-membership";

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
  const password = "Etapa6test!";
  const emailA = `etapa6.http.a.${suffix}@example.invalid`;
  const emailB = `etapa6.http.b.${suffix}@example.invalid`;
  const createdAuthIds: string[] = [];
  const createdUserIds: string[] = [];
  const createdOrderIds: string[] = [];
  const createdOrgIds: string[] = [];

  async function signup(email: string) {
    return jsonFetch(`${BASE}/api/auth/signup`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        name: "Etapa 6 Teste",
        role: "ADMIN",
        orgRole: "OWNER",
        status: "ACTIVE",
        plan: "PARTNER",
        organizationId: "00000000-0000-0000-0000-000000000099",
      }),
    });
  }

  const anonOrg = await jsonFetch(`${BASE}/api/org`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ cnpj: "00", orgRole: "OWNER", role: "ADMIN" }),
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

  const signA = await signup(emailA);
  const signB = await signup(emailB);
  const profileA = (signA.body.profile || {}) as Record<string, unknown>;
  const profileB = (signB.body.profile || {}) as Record<string, unknown>;
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
    const hostile = await jsonFetch(`${BASE}/api/org`, {
      method: "POST",
      headers: { "content-type": "application/json", cookie: cookieA },
      body: JSON.stringify({
        cnpj: "00",
        userId: profileB.id,
        organizationId: "00000000-0000-0000-0000-000000000077",
        orgRole: "OWNER",
        status: "ACTIVE",
        role: "ADMIN",
        plan: "PARTNER",
        isPartner: true,
        sellerOrgId: "00000000-0000-0000-0000-000000000076",
      }),
    });
    const meHostile = await jsonFetch(`${BASE}/api/auth/me`, { headers: { cookie: cookieA } });
    const hostileProfile = (meHostile.body.profile || {}) as Record<string, unknown>;
    const hostileMembers = await prisma.organizationMember.count({
      where: { userId: String(profileA.id) },
    });
    record({
      scenario: "body hostil não cria Membership nem escala role",
      role: String(hostileProfile.role || "none"),
      tenant: String(hostileProfile.organization || "null"),
      http: hostile.status,
      leaked: hostileProfile.role === "ADMIN" || hostileMembers > 0,
      pass:
        hostile.status === 400 &&
        hostileProfile.role === "CLIENT" &&
        hostileProfile.organization == null &&
        hostileMembers === 0,
    });

    const cnpjA = makeCnpj(Number(suffix.slice(-8)));
    const cnpjB = makeCnpj(Number(suffix.slice(-8)) + 19);
    const org = await persistCreatorOnboarding({
      userId: String(profileA.id),
      cnpj: cnpjA,
      existingOrganizationId: null,
      companyData: {
        name: "Etapa6 HTTP Empresa A",
        tradeName: null,
        plan: "STANDARD",
        cnpjVerifiedAt: new Date(),
        cnpjStatus: "ATIVA",
        legalNature: null,
        phone: "nao-informado",
        email: emailA,
        address: null,
        city: null,
        state: null,
        cep: null,
        oabNumber: null,
        creciNumber: null,
      },
    });
    createdOrgIds.push(org.id);

    const member = await prisma.organizationMember.findUnique({
      where: {
        userId_organizationId: { userId: String(profileA.id), organizationId: org.id },
      },
    });
    const meA = await jsonFetch(`${BASE}/api/auth/me`, { headers: { cookie: cookieA } });
    const profA = (meA.body.profile || {}) as Record<string, unknown>;
    const orgA = (profA.organization || {}) as Record<string, unknown>;
    record({
      scenario: "dual-write OWNER ACTIVE + legado B2B_ADMIN STANDARD",
      role: String(profA.role || "none"),
      tenant: String(orgA.plan || "none"),
      http: meA.status,
      leaked: orgA.plan === "PARTNER" || member?.orgRole !== "OWNER",
      pass:
        meA.status === 200 &&
        profA.role === "B2B_ADMIN" &&
        orgA.plan === "STANDARD" &&
        member?.status === "ACTIVE" &&
        member.orgRole === "OWNER" &&
        member.removedAt == null,
    });

    const alias = await jsonFetch(`${BASE}/api/org/partner`, {
      method: "POST",
      headers: { "content-type": "application/json", cookie: cookieA },
      body: JSON.stringify({ cnpj: cnpjA, plan: "PARTNER", orgRole: "ADMIN" }),
    });
    const afterAlias = await prisma.organization.findUnique({ where: { id: org.id } });
    const memberCount = await prisma.organizationMember.count({
      where: { userId: String(profileA.id) },
    });
    record({
      scenario: "alias /api/org/partner não concede Partner nem duplica Member",
      role: "B2B_ADMIN",
      tenant: String(afterAlias?.plan || "none"),
      http: alias.status,
      leaked: afterAlias?.plan === "PARTNER" || memberCount !== 1,
      pass:
        (alias.status === 200 || alias.status === 400 || alias.status === 404) &&
        afterAlias?.plan === "STANDARD" &&
        memberCount === 1,
    });

    const personal = await prisma.order.create({
      data: {
        orderNumber: 930000 + Number(suffix.slice(-5)),
        protocol: `E6-${suffix}`,
        userId: String(profileA.id),
        organizationId: org.id,
        status: "PENDING_PAYMENT",
        totalAmount: 1,
        itemsTotal: 1,
        customerName: "Etapa 6",
        customerEmail: emailA,
        customerPhone: "11999999999",
        customerCpfCnpj: "00000000000",
      },
    });
    createdOrderIds.push(personal.id);

    const ownOrder = await jsonFetch(`${BASE}/api/orders/${personal.id}`, {
      headers: { cookie: cookieA },
    });
    record({
      scenario: "próprio pedido ALLOW (userId)",
      role: "B2B_ADMIN",
      tenant: "org-a",
      http: ownOrder.status,
      leaked: false,
      pass: ownOrder.status === 200 && Boolean((ownOrder.body.order as { id?: string } | undefined)?.id),
    });

    const foreign = await jsonFetch(`${BASE}/api/orders/${personal.id}`, {
      headers: { cookie: cookieB },
    });
    record({
      scenario: "pedido de outro User 404 mesmo com mesma futura org",
      role: "CLIENT",
      tenant: "-",
      http: foreign.status,
      leaked: Boolean(foreign.body.order),
      pass: foreign.status === 404 && !foreign.body.order,
    });

    const listA = await jsonFetch(`${BASE}/api/orders`, { headers: { cookie: cookieA } });
    const listOrders = Array.isArray(listA.body.orders)
      ? (listA.body.orders as Array<Record<string, unknown>>)
      : [];
    record({
      scenario: "listagem só por userId",
      role: "B2B_ADMIN",
      tenant: "org-a",
      http: listA.status,
      leaked: false,
      pass: listA.status === 200 && listOrders.some((item) => item.id === personal.id),
    });

    const second = await jsonFetch(`${BASE}/api/org`, {
      method: "POST",
      headers: { "content-type": "application/json", cookie: cookieA },
      body: JSON.stringify({ cnpj: cnpjB, orgRole: "OWNER" }),
    });
    const orgBCount = await prisma.organization.count({ where: { cnpj: cnpjB } });
    const stillA = await prisma.user.findUnique({
      where: { id: String(profileA.id) },
      select: { organizationId: true },
    });
    record({
      scenario: "second org negada; Org A intacta",
      role: "B2B_ADMIN",
      tenant: stillA?.organizationId === org.id ? "org-a" : "moved",
      http: second.status,
      leaked: orgBCount > 0 && second.status === 200,
      pass: second.status === 409 && stillA?.organizationId === org.id && orgBCount === 0,
    });

    const steal = await jsonFetch(`${BASE}/api/org`, {
      method: "POST",
      headers: { "content-type": "application/json", cookie: cookieB },
      body: JSON.stringify({
        cnpj: cnpjA,
        organizationId: org.id,
        orgRole: "OWNER",
        userId: profileA.id,
      }),
    });
    const memberB = await prisma.organizationMember.count({
      where: { userId: String(profileB.id) },
    });
    const meB = await jsonFetch(`${BASE}/api/auth/me`, { headers: { cookie: cookieB } });
    const profB = (meB.body.profile || {}) as Record<string, unknown>;
    record({
      scenario: "cross-tenant: User B não assume Org A",
      role: String(profB.role || "none"),
      tenant: String(profB.organization || "null"),
      http: steal.status,
      leaked: memberB > 0 || Boolean(profB.organization),
      pass: steal.status === 409 && profB.role === "CLIENT" && memberB === 0,
    });

    await prisma.user.update({
      where: { id: String(profileB.id) },
      data: { role: "B2B_ADMIN", organizationId: org.id },
    });
    const meFk = await jsonFetch(`${BASE}/api/auth/me`, { headers: { cookie: cookieB } });
    const profFk = (meFk.body.profile || {}) as Record<string, unknown>;
    record({
      scenario: "User.organizationId sem membership ACTIVE não autoriza perfil B2B",
      role: String(profFk.role || "none"),
      tenant: String(profFk.organization || "null"),
      http: meFk.status,
      leaked: Boolean(profFk.organization),
      pass: meFk.status === 200 && profFk.organization == null && profFk.role === "B2B_ADMIN",
    });

    await prisma.organizationMember.create({
      data: {
        userId: String(profileB.id),
        organizationId: org.id,
        orgRole: "MEMBER",
        status: "ACTIVE",
        joinedAt: new Date(),
      },
    });
    await prisma.user.update({
      where: { id: String(profileB.id) },
      data: { role: "CLIENT", organizationId: null },
    });
    const meMember = await jsonFetch(`${BASE}/api/auth/me`, { headers: { cookie: cookieB } });
    const profMember = (meMember.body.profile || {}) as Record<string, unknown>;
    const memberOrg = (profMember.organization || {}) as Record<string, unknown>;
    record({
      scenario: "MEMBER ACTIVE + legado inconsistente: membership vence",
      role: String(profMember.role || "none"),
      tenant: String(memberOrg.id || "none"),
      http: meMember.status,
      leaked: false,
      pass:
        meMember.status === 200 &&
        profMember.role === "CLIENT" &&
        memberOrg.id === org.id,
    });

    const memberReadsA = await jsonFetch(`${BASE}/api/orders/${personal.id}`, {
      headers: { cookie: cookieB },
    });
    record({
      scenario: "MEMBER ACTIVE não lê pedido alheio (userId)",
      role: "CLIENT",
      tenant: "org-a",
      http: memberReadsA.status,
      leaked: Boolean(memberReadsA.body.order),
      pass: memberReadsA.status === 404 && !memberReadsA.body.order,
    });

    await prisma.organizationMember.update({
      where: {
        userId_organizationId: {
          userId: String(profileB.id),
          organizationId: org.id,
        },
      },
      data: { orgRole: "ADMIN" },
    });
    const meOrgAdmin = await jsonFetch(`${BASE}/api/auth/me`, { headers: { cookie: cookieB } });
    const profOrgAdmin = (meOrgAdmin.body.profile || {}) as Record<string, unknown>;
    const orgAdminOrg = (profOrgAdmin.organization || {}) as Record<string, unknown>;
    record({
      scenario: "ADMIN ACTIVE vê a própria Organization",
      role: String(profOrgAdmin.role || "none"),
      tenant: String(orgAdminOrg.id || "none"),
      http: meOrgAdmin.status,
      leaked: false,
      pass: meOrgAdmin.status === 200 && orgAdminOrg.id === org.id,
    });

    await prisma.organizationMember.update({
      where: {
        userId_organizationId: {
          userId: String(profileA.id),
          organizationId: org.id,
        },
      },
      data: { status: "REMOVED", removedAt: new Date() },
    });
    const meRemoved = await jsonFetch(`${BASE}/api/auth/me`, { headers: { cookie: cookieA } });
    const profRemoved = (meRemoved.body.profile || {}) as Record<string, unknown>;
    record({
      scenario: "REMOVED perde isBusiness na próxima request",
      role: String(profRemoved.role || "none"),
      tenant: String(profRemoved.organization || "null"),
      http: meRemoved.status,
      leaked: Boolean(profRemoved.organization),
      pass:
        meRemoved.status === 200 &&
        profRemoved.organization == null &&
        profRemoved.role === "B2B_ADMIN",
    });

    const ownAfterRemoved = await jsonFetch(`${BASE}/api/orders/${personal.id}`, {
      headers: { cookie: cookieA },
    });
    record({
      scenario: "REMOVED ainda lê próprio pedido por userId",
      role: "B2B_ADMIN",
      tenant: "org-a",
      http: ownAfterRemoved.status,
      leaked: false,
      pass:
        ownAfterRemoved.status === 200 &&
        Boolean((ownAfterRemoved.body.order as { id?: string } | undefined)?.id),
    });

    const webhookGet = await jsonFetch(`${BASE}/api/payments/webhook`);
    record({
      scenario: "GET webhook não marca PAID / protegido",
      role: "anon",
      tenant: "-",
      http: webhookGet.status,
      leaked: false,
      pass: webhookGet.status === 405 || webhookGet.status === 401 || webhookGet.status === 403,
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
    console.error("etapa6-http-check failed", error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
