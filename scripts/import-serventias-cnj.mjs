/**
 * Importa as serventias extrajudiciais (cartórios) do Justiça Aberta (CNJ) para a
 * tabela Cartorio, com endereço, telefone e e-mail. Upsert por CNS, idempotente.
 *
 * Fonte: consulta pública "Produtividade e localização de serventias
 * extrajudiciais" (https://justicaaberta.cnj.jus.br/), mantida pela Corregedoria
 * Nacional de Justiça. Os dados são declarados pelos próprios cartórios. O script
 * não inventa nem completa contato: campo vazio na fonte fica como está no banco.
 *
 * Uso:
 *   node scripts/import-serventias-cnj.mjs [opções]
 *
 *   --dry-run            baixa e normaliza, mostra as contagens e não grava nada
 *   --uf SP,RJ           só essas UFs (padrão: todas)
 *   --save arquivo.json  guarda o que veio da API (para reimportar sem rede)
 *   --from-file arq.json usa um arquivo salvo com --save em vez da API
 *   --include-inactive   importa também serventias com status "Inativo"
 *   --allow-remote       permite gravar num banco fora de localhost/cartori_test
 *                        (produção). Sem isso o script recusa.
 *
 * O banco vem de DATABASE_URL_UNPOOLED ou DATABASE_URL, nessa ordem (padrão: o banco de
 * teste de scripts/test-db.mjs). O script não lê o .env sozinho.
 * Nunca apaga linhas: OrderItem referencia Cartorio.id.
 */
import { randomUUID } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const API_URL = "https://justicaabertaapi.cnj.jus.br/v1/api/serventias";
const PER_PAGE = 1000;
const BATCH = 400;
const DEFAULT_TEST_DATABASE_URL = "postgresql://postgres:postgres@127.0.0.1:54329/cartori_test";
const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);

const localidades = JSON.parse(
  readFileSync(fileURLToPath(new URL("../src/lib/ibge-localidades.json", import.meta.url)), "utf8")
);
const UFS = localidades.estados.map((estado) => estado.sigla).sort();

// Naturezas do CNJ → códigos de src/lib/cartorio-attributions.ts.
// Mapa explícito: "Registro Civil das Pessoas Jurídicas" não é Registro Civil (pessoas naturais).
const NATUREZA_CODES = {
  "registro civil das pessoas naturais": ["REGISTRO_CIVIL"],
  "registro de interdicoes e tutelas": ["REGISTRO_CIVIL"],
  notas: ["NOTAS"],
  "registro de imoveis": ["IMOVEIS"],
  "protesto de titulos": ["PROTESTO"],
  "registro de titulos e documentos": ["EMPRESAS"],
  "registro civil das pessoas juridicas": ["EMPRESAS"],
};

function parseArgs(argv) {
  const args = { dryRun: false, ufs: UFS, save: null, fromFile: null, includeInactive: false, allowRemote: false };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--dry-run") args.dryRun = true;
    else if (arg === "--include-inactive") args.includeInactive = true;
    else if (arg === "--allow-remote") args.allowRemote = true;
    else if (arg === "--save") args.save = argv[++i];
    else if (arg === "--from-file") args.fromFile = argv[++i];
    else if (arg === "--uf") {
      args.ufs = String(argv[++i] || "")
        .split(",")
        .map((uf) => uf.trim().toUpperCase())
        .filter(Boolean);
      const invalid = args.ufs.filter((uf) => !UFS.includes(uf));
      if (invalid.length || !args.ufs.length) throw new Error(`UF inválida: ${invalid.join(", ") || "(vazia)"}`);
    } else throw new Error(`Opção desconhecida: ${arg}`);
  }
  return args;
}

function plain(value) {
  return String(value)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

function cityKey(value) {
  return plain(value)
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function clean(value) {
  if (value === null || value === undefined) return null;
  const text = String(value)
    .replace(/\u0013/g, "–") // travessão que chega como caractere de controle
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text || null;
}

const CITIES_BY_UF = Object.fromEntries(
  Object.entries(localidades.municipios).map(([uf, cities]) => [
    uf,
    new Map(cities.map(([, nome]) => [cityKey(nome), nome])),
  ])
);

// Grafias antigas usadas pelo CNJ → nome atual do IBGE.
const CITY_ALIASES = {
  RN: { acu: "Assú", ares: "Arez" },
  RR: { "sao luiz": "São Luiz do Anauá" },
};

export function normalizeCity(uf, city) {
  const name = clean(city);
  if (!name) return { city: null, matched: false };
  // O DF é um único município no IBGE; Taguatinga, Gama etc. são regiões administrativas.
  if (uf === "DF") return { city: "Brasília", matched: true };
  const key = cityKey(name);
  const official = CITIES_BY_UF[uf]?.get(key) || CITY_ALIASES[uf]?.[key];
  return official ? { city: official, matched: true } : { city: name, matched: false };
}

export function mapAttributions(natureza) {
  const codes = [];
  const unknown = [];
  for (const part of String(natureza || "").split("|")) {
    const key = plain(part).trim();
    if (!key) continue;
    const mapped = NATUREZA_CODES[key];
    if (mapped) codes.push(...mapped);
    else unknown.push(clean(part));
  }
  const unique = [...new Set(codes)];
  return { codes: unique.length ? unique : ["OUTROS"], unknown };
}

export function formatPhone(value) {
  const raw = clean(value);
  if (!raw) return null;
  const digits = raw.replace(/\D/g, "").replace(/^0+/, "");
  if (digits.length === 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  if (digits.length === 11) return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  return digits.length >= 8 ? raw : null;
}

export function formatEmail(value) {
  const raw = clean(value);
  if (!raw) return null;
  const first = raw
    .split(/[;,\s]+/)
    .map((item) => item.trim().toLowerCase())
    .find((item) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(item));
  return first || null;
}

export function formatAddress(row) {
  const street = clean(row.endereco);
  if (!street) return null;
  const number = clean(row.numero);
  // Só considera o número já presente se ele fecha o logradouro ("Rua A, 10"), não se
  // aparece no nome ("Rua 13 de Maio" + nº 3).
  const escaped = number?.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const hasNumber = number && new RegExp(`(^|[\\s,])(n[º°o.]*\\s*)?${escaped}$`, "i").test(street);
  const parts = [number && !hasNumber ? `${street}, ${number}` : street];
  const district = clean(row.bairro);
  if (district) parts.push(district);
  const cep = String(row.cep || "").replace(/\D/g, "");
  if (cep.length === 7 || cep.length === 8) {
    const padded = cep.padStart(8, "0");
    parts.push(`CEP ${padded.slice(0, 5)}-${padded.slice(5)}`);
  }
  return parts.join(" – ");
}

export function toCartorioRow(row) {
  const cns = String(row.cns || "").replace(/\D/g, "");
  const uf = String(row.uf || "").trim().toUpperCase();
  const name = clean(row.denominacao_fantasia) || clean(row.denominacao_padrao);
  const { city, matched } = normalizeCity(uf, row.cidade);
  const { codes, unknown } = mapAttributions(row.natureza);
  return {
    cns,
    name,
    attributions: codes,
    state: uf,
    city,
    district: clean(row.bairro),
    address: formatAddress(row),
    phone: formatPhone(row.telefone),
    email: formatEmail(row.email),
    cityMatched: matched,
    unknownNaturezas: unknown,
  };
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchPage(uf, page) {
  for (let attempt = 1; ; attempt++) {
    try {
      const response = await fetch(`${API_URL}?page=${page}&perPage=${PER_PAGE}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ cidade_id: 0, uf, cns: null }),
        signal: AbortSignal.timeout(120_000),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      if (attempt >= 4) throw new Error(`Falha ao baixar ${uf} página ${page}: ${error.message}`);
      await sleep(2000 * attempt);
    }
  }
}

async function downloadAll(ufs) {
  const rows = [];
  for (const uf of ufs) {
    let page = 1;
    let lastPage = 1;
    do {
      const body = await fetchPage(uf, page);
      rows.push(...(body.data || []));
      lastPage = body.meta?.last_page ?? 1;
      page++;
      await sleep(500); // educação com o servidor do CNJ
    } while (page <= lastPage);
    console.log(`  ${uf}: ${rows.filter((row) => row.uf === uf).length} registros`);
  }
  return rows;
}

function resolveDatabaseUrl(allowRemote) {
  const value = String(
    process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL || DEFAULT_TEST_DATABASE_URL
  ).trim();
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error("DATABASE_URL inválida.");
  }
  const isTest = LOCAL_HOSTS.has(url.hostname) && url.pathname.replace(/^\//, "") === "cartori_test";
  if (!isTest && !allowRemote) {
    throw new Error(
      `Banco fora do ambiente de teste (${url.hostname}). Para produção, rode de propósito com --allow-remote.`
    );
  }
  return { value, label: isTest ? "teste local" : `remoto (${url.hostname})` };
}

const UPSERT_COLUMNS = ["id", "cns", "name", "attributions", "state", "city", "district", "address", "phone", "email"];

async function upsertBatch(prisma, rows) {
  const params = [];
  const values = rows.map((row) => {
    const placeholders = UPSERT_COLUMNS.map((column) => {
      params.push(column === "id" ? randomUUID() : row[column]);
      return column === "attributions" ? `$${params.length}::text[]` : `$${params.length}`;
    });
    return `(${placeholders.join(", ")}, NOW())`;
  });
  const sql = `
    INSERT INTO "Cartorio" (${UPSERT_COLUMNS.map((c) => `"${c}"`).join(", ")}, "updatedAt")
    VALUES ${values.join(",\n")}
    ON CONFLICT ("cns") DO UPDATE SET
      "name" = EXCLUDED."name",
      "attributions" = EXCLUDED."attributions",
      "state" = EXCLUDED."state",
      "city" = EXCLUDED."city",
      "district" = COALESCE(EXCLUDED."district", "Cartorio"."district"),
      "address" = COALESCE(EXCLUDED."address", "Cartorio"."address"),
      "phone" = COALESCE(EXCLUDED."phone", "Cartorio"."phone"),
      "email" = COALESCE(EXCLUDED."email", "Cartorio"."email"),
      "updatedAt" = NOW()
    RETURNING (xmax = 0) AS inserted`;
  const result = await prisma.$queryRawUnsafe(sql, ...params);
  const inserted = result.filter((row) => row.inserted).length;
  return { inserted, updated: result.length - inserted };
}

function pct(part, total) {
  return total ? `${((100 * part) / total).toFixed(1)}%` : "0%";
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const database = args.dryRun ? null : resolveDatabaseUrl(args.allowRemote);

  let raw;
  if (args.fromFile) {
    raw = JSON.parse(readFileSync(args.fromFile, "utf8"));
    console.log(`Lendo ${raw.length} registros de ${args.fromFile}`);
  } else {
    console.log(`Baixando serventias do Justiça Aberta (CNJ): ${args.ufs.join(", ")}`);
    raw = await downloadAll(args.ufs);
  }
  if (args.save) {
    writeFileSync(args.save, JSON.stringify(raw));
    console.log(`Resposta da API salva em ${args.save}`);
  }

  const skipped = { inativas: 0, semAtribuicao: 0, cnsInvalido: 0, semNomeOuCidade: 0, foraDoFiltroUf: 0 };
  const byCns = new Map();
  const unmatchedCities = new Map();
  const unknownNaturezas = new Map();
  for (const item of raw) {
    if (!args.ufs.includes(String(item.uf || "").toUpperCase())) {
      skipped.foraDoFiltroUf++;
      continue;
    }
    if (!args.includeInactive && item.status !== "Ativo") {
      skipped.inativas++;
      continue;
    }
    // Sem natureza = corregedorias e afins, não são cartórios.
    if (!clean(item.natureza)) {
      skipped.semAtribuicao++;
      continue;
    }
    const row = toCartorioRow(item);
    if (!/^\d{6}$/.test(row.cns)) {
      skipped.cnsInvalido++;
      continue;
    }
    if (!row.name || !row.city || !row.state) {
      skipped.semNomeOuCidade++;
      continue;
    }
    if (!row.cityMatched) {
      const key = `${row.city}/${row.state}`;
      unmatchedCities.set(key, (unmatchedCities.get(key) || 0) + 1);
    }
    for (const natureza of row.unknownNaturezas) {
      unknownNaturezas.set(natureza, (unknownNaturezas.get(natureza) || 0) + 1);
    }
    byCns.set(row.cns, row);
  }
  const rows = [...byCns.values()];

  const total = rows.length;
  const withPhone = rows.filter((row) => row.phone).length;
  const withAddress = rows.filter((row) => row.address).length;
  const withEmail = rows.filter((row) => row.email).length;
  console.log("\nServentias válidas:", total);
  console.log(`  com telefone: ${withPhone} (${pct(withPhone, total)})`);
  console.log(`  com endereço: ${withAddress} (${pct(withAddress, total)})`);
  console.log(`  com e-mail:   ${withEmail} (${pct(withEmail, total)})`);
  console.log("Ignoradas:", skipped);
  const unmatchedTotal = [...unmatchedCities.values()].reduce((sum, n) => sum + n, 0);
  console.log(`Município fora da lista do IBGE (nome mantido como veio): ${unmatchedTotal}`);
  for (const [city, count] of [...unmatchedCities].sort((a, b) => b[1] - a[1]).slice(0, 15)) {
    console.log(`  ${city}: ${count}`);
  }
  if (unknownNaturezas.size) {
    console.log("Naturezas sem código próprio (viram OUTROS se forem as únicas):");
    for (const [natureza, count] of [...unknownNaturezas].sort((a, b) => b[1] - a[1])) {
      console.log(`  ${natureza}: ${count}`);
    }
  }

  if (args.dryRun) {
    console.log("\n--dry-run: nada foi gravado.");
    return;
  }

  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient({ datasources: { db: { url: database.value } } });
  try {
    console.log(`\nGravando no banco ${database.label}...`);
    let inserted = 0;
    let updated = 0;
    for (let i = 0; i < rows.length; i += BATCH) {
      const result = await upsertBatch(prisma, rows.slice(i, i + BATCH));
      inserted += result.inserted;
      updated += result.updated;
    }
    console.log(`  novas: ${inserted}, atualizadas: ${updated}`);
    const [counts] = await prisma.$queryRawUnsafe(`
      SELECT COUNT(*)::int AS total,
             COUNT(*) FILTER (WHERE "phone" IS NOT NULL)::int AS phone,
             COUNT(*) FILTER (WHERE "address" IS NOT NULL)::int AS address,
             COUNT(*) FILTER (WHERE "email" IS NOT NULL)::int AS email
      FROM "Cartorio"`);
    console.log(
      `Tabela Cartorio agora: ${counts.total} linhas, ${counts.phone} com telefone, ` +
        `${counts.address} com endereço, ${counts.email} com e-mail.`
    );
  } finally {
    await prisma.$disconnect();
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main().catch((error) => {
    console.error(error.message || error);
    process.exit(1);
  });
}
