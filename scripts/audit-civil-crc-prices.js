/**
 * Audit Registro Civil prices: Cartori (crc-uf-prices + form extras) vs CRC dump.
 * node scripts/audit-civil-crc-prices.js
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const SLUGS = [
  "certidao-de-nascimento",
  "certidao-de-casamento",
  "certidao-de-obito",
  "certidao-de-divorcio",
];
const FORMATS = ["ELECTRONIC", "PAPER", "BOTH"];
const IBGE_UF = {
  11: "RO", 12: "AC", 13: "AM", 14: "RR", 15: "PA", 16: "AP", 17: "TO",
  21: "MA", 22: "PI", 23: "CE", 24: "RN", 25: "PB", 26: "PE", 27: "AL",
  28: "SE", 29: "BA", 31: "MG", 32: "ES", 33: "RJ", 35: "SP",
  41: "PR", 42: "SC", 43: "RS", 50: "MS", 51: "MT", 52: "GO", 53: "DF",
};

function money(v) {
  const n = Number(v);
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : 0;
}

function parseCsv(filePath) {
  const text = fs.readFileSync(filePath, "utf8");
  const lines = [];
  let row = [];
  let cur = "";
  let inQ = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQ) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          cur += '"';
          i++;
        } else inQ = false;
      } else cur += c;
    } else if (c === '"') inQ = true;
    else if (c === ",") {
      row.push(cur);
      cur = "";
    } else if (c === "\n") {
      row.push(cur.replace(/\r$/, ""));
      lines.push(row);
      row = [];
      cur = "";
    } else cur += c;
  }
  if (cur.length || row.length) {
    row.push(cur.replace(/\r$/, ""));
    lines.push(row);
  }
  const header = lines[0];
  return lines
    .slice(1)
    .filter((r) => r.length && r.some((x) => x))
    .map((r) => {
      const o = {};
      header.forEach((h, i) => {
        o[h] = r[i] ?? "";
      });
      return o;
    });
}

function extractTsObject(ts, slug) {
  const needle = `"${slug}": {`;
  const idx = ts.indexOf(needle);
  if (idx < 0) return null;
  const start = ts.indexOf("{", idx);
  let depth = 0;
  let end = start;
  for (let i = start; i < ts.length; i++) {
    if (ts[i] === "{") depth++;
    else if (ts[i] === "}") {
      depth--;
      if (depth === 0) {
        end = i;
        break;
      }
    }
  }
  return ts.slice(start, end + 1);
}

function ufEntriesFromBlock(block) {
  const re = /"([A-Z]{2})":\s*\{\s*"ELECTRONIC":\s*([0-9.]+),\s*"PAPER":\s*([0-9.]+),\s*"BOTH":\s*([0-9.]+)/g;
  const entries = [];
  let m;
  while ((m = re.exec(block))) {
    entries.push({
      uf: m[1],
      ELECTRONIC: money(m[2]),
      PAPER: money(m[3]),
      BOTH: money(m[4]),
    });
  }
  return entries;
}

function parseConditionalUfs(conditional) {
  if (!conditional || conditional === "null") return [];
  let json;
  try {
    json = JSON.parse(conditional);
  } catch {
    return [];
  }
  const rules = json.rules || [];
  const ufs = [];
  for (const rule of rules) {
    if (/cartorio_state|cartorios_multiplos_state/.test(rule.field || "") && rule.operator === "equals" && rule.value) {
      const sigla = IBGE_UF[rule.value] || IBGE_UF[Number(rule.value)];
      if (sigla) ufs.push(sigla);
    }
  }
  return [...new Set(ufs)];
}

function amountsFromPriceConditionals(raw) {
  if (!raw || raw === "null" || raw === "") return [];
  let json;
  try {
    json = JSON.parse(raw);
  } catch {
    return [];
  }
  const out = [];
  const walk = (node) => {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) {
      node.forEach(walk);
      return;
    }
    if (node.amount != null && (node.state || node.ibge || node.uf || node.value)) {
      const code = node.state || node.ibge || node.uf || node.value;
      const sigla = IBGE_UF[code] || IBGE_UF[Number(code)] || (/^[A-Z]{2}$/.test(String(code)) ? String(code) : null);
      const amount = money(node.amount);
      if (sigla && amount) out.push({ uf: sigla, amount });
    }
    Object.values(node).forEach(walk);
  };
  walk(json);
  return out;
}

function addonKind(name, label, value) {
  const t = `${name} ${label} ${value}`.toLowerCase();
  if (/reprograf/.test(t)) return "inteiro_teor_reprografica";
  if (/inteiro/.test(t)) return "inteiro_teor";
  if (/averba/.test(t)) return "averbacao";
  if (/tradu/.test(t)) return "traducao";
  if (/apostil/.test(t)) return "apostila";
  if (/eletr[oô]nica \+ papel|both/i.test(t) || value === "BOTH") return "format_BOTH";
  if (/^eletr|^digital|ELECTRONIC/.test(t) || value === "ELECTRONIC") return "format_ELECTRONIC";
  if (/papel|PAPER/.test(t) || value === "PAPER") return "format_PAPER";
  return null;
}

const ts = fs.readFileSync(path.join(ROOT, "src/lib/crc-uf-prices.ts"), "utf8");
const byState = JSON.parse(
  fs.readFileSync(path.join(ROOT, "import/crcbrasil-prices-by-state.json"), "utf8")
);
const formFields = fs.readFileSync(path.join(ROOT, "src/lib/crc-form-fields.ts"), "utf8");

const formatDiffs = [];
const duplicateUfs = [];
const catalogMins = [];

for (const slug of SLUGS) {
  const block = extractTsObject(ts, slug);
  const entries = ufEntriesFromBlock(block || "");
  const seen = new Map();
  for (const row of entries) {
    if (!seen.has(row.uf)) seen.set(row.uf, []);
    seen.get(row.uf).push(row);
  }
  for (const [uf, rows] of seen) {
    if (rows.length > 1) duplicateUfs.push({ slug, uf, rows });
  }

  const crc = byState.mainProducts?.[slug]?.byUf || {};
  const lastByUf = {};
  for (const row of entries) lastByUf[row.uf] = row;
  for (const uf of new Set([...Object.keys(crc), ...Object.keys(lastByUf)])) {
    for (const fmt of FORMATS) {
      const cartori = lastByUf[uf]?.[fmt];
      const crcVal = crc[uf]?.[fmt];
      if (crcVal == null && cartori == null) continue;
      if (cartori !== crcVal) {
        formatDiffs.push({
          slug,
          uf,
          format: fmt,
          cartori: cartori ?? null,
          crc: crcVal ?? null,
          diff: money((cartori || 0) - (crcVal || 0)),
        });
      }
    }
  }

  const electronics = Object.values(lastByUf)
    .map((r) => r.ELECTRONIC)
    .filter((n) => n);
  catalogMins.push({
    slug,
    cartoriCard: 299.9,
    crcElectronicMin: electronics.length ? Math.min(...electronics) : null,
    crcElectronicMedian: electronics.sort((a, b) => a - b)[Math.floor(electronics.length / 2)] || null,
  });
}

console.log("=== Duplicate UF keys in crc-uf-prices.ts ===");
if (!duplicateUfs.length) console.log("none");
else duplicateUfs.forEach((d) => console.log(JSON.stringify(d)));

console.log("\n=== Format table Cartori vs CRC (by-state JSON) ===");
console.log("diffs", formatDiffs.length);
formatDiffs.slice(0, 80).forEach((d) => console.log(JSON.stringify(d)));
if (formatDiffs.length > 80) console.log("... +" + (formatDiffs.length - 80));

console.log("\n=== Catalog card vs CRC electronic min ===");
catalogMins.forEach((d) => console.log(JSON.stringify(d)));

const downloads = "D:/Users/MODESTO/Downloads";
const products = parseCsv(path.join(downloads, "Product_rows (2).csv"));
const fields = parseCsv(path.join(downloads, "ProductField_rows (2).csv"));
const options = parseCsv(path.join(downloads, "ProductFieldOption_rows (3).csv"));
const extras = parseCsv(path.join(downloads, "ProductPriceExtra_rows (2).csv"));

const extraByOptionId = new Map();
for (const extra of extras) {
  const amount = money(extra.extraAmount);
  if (amount && extra.productFieldOptionId) extraByOptionId.set(extra.productFieldOptionId, amount);
}

const productBySlug = new Map(products.map((p) => [p.slug.trim(), p]));
const crcAddons = {};

for (const slug of SLUGS) {
  const product = productBySlug.get(slug);
  if (!product) continue;
  crcAddons[slug] = {};
  const productFields = fields.filter((f) => f.productId === product.id);
  for (const field of productFields) {
    const ufs = parseConditionalUfs(field.conditional);
    const fromConditionals = amountsFromPriceConditionals(field.priceConditionals);
    if (fromConditionals.length) {
      const kind = addonKind(field.name, field.label, "");
      if (kind && !kind.startsWith("format_")) {
        const bucket = (crcAddons[slug][kind] ||= {});
        for (const row of fromConditionals) bucket[row.uf] = row.amount;
      }
    }
    const fieldOpts = options.filter((o) => o.fieldId === field.id);
    if (!fieldOpts.length) {
      const amount = money(field.additionalValue);
      const kind = addonKind(field.name, field.label, "");
      if (!kind || !amount) continue;
      if (kind.startsWith("format_")) continue;
      const bucket = (crcAddons[slug][kind] ||= {});
      const targets = ufs.length ? ufs : ["*"];
      for (const uf of targets) bucket[uf] = amount;
      continue;
    }
    for (const opt of fieldOpts) {
      const amount = extraByOptionId.get(opt.id) || money(field.additionalValue);
      const kind = addonKind(field.name, field.label, opt.value || opt.label);
      if (!kind || !amount) continue;
      if (kind.startsWith("format_")) continue;
      const bucket = (crcAddons[slug][kind] ||= {});
      const targets = ufs.length ? ufs : ["*"];
      for (const uf of targets) bucket[uf] = amount;
    }
  }
}

function extractFormAddon(slug, fieldId, optionValue) {
  const slugIdx = formFields.indexOf(`"${slug}": [`);
  if (slugIdx < 0) return null;
  const start = formFields.indexOf("[", slugIdx);
  let depth = 0;
  let end = start;
  for (let i = start; i < formFields.length; i++) {
    if (formFields[i] === "[") depth++;
    else if (formFields[i] === "]") {
      depth--;
      if (depth === 0) {
        end = i;
        break;
      }
    }
  }
  const block = formFields.slice(start, end + 1);
  const idNeedle = `"id": "${fieldId}"`;
  const idIdx = block.indexOf(idNeedle);
  if (idIdx < 0) return null;
  const fieldStart = block.lastIndexOf("{", idIdx);
  let d = 0;
  let fieldEnd = fieldStart;
  for (let i = fieldStart; i < block.length; i++) {
    if (block[i] === "{") d++;
    else if (block[i] === "}") {
      d--;
      if (d === 0) {
        fieldEnd = i;
        break;
      }
    }
  }
  const fieldJson = block.slice(fieldStart, fieldEnd + 1);
  let parsed;
  try {
    parsed = JSON.parse(fieldJson);
  } catch {
    return null;
  }
  if (optionValue) {
    const opt = (parsed.options || []).find((o) => o.value === optionValue);
    return opt || null;
  }
  return parsed;
}

const addonDiffs = [];
const addonKinds = ["averbacao", "inteiro_teor", "inteiro_teor_reprografica"];

for (const slug of SLUGS) {
  for (const kind of addonKinds) {
    const crc = crcAddons[slug]?.[kind] || {};
    const fieldId = kind.startsWith("inteiro_teor") ? "inteiro_teor" : kind;
    const optionValue =
      kind === "inteiro_teor_reprografica"
        ? "inteiro_teor_reprografica"
        : kind === "inteiro_teor"
          ? "inteiro_teor"
          : null;
    const cartori = extractFormAddon(slug, fieldId, optionValue);
    const byUf = cartori?.priceByUf || {};
    const fallback = cartori?.price || 0;
    const ufs = new Set([...Object.keys(crc), ...Object.keys(byUf)]);
    ufs.delete("*");
    for (const uf of [...ufs].sort()) {
      const crcVal = crc[uf] ?? crc["*"] ?? null;
      const cartoriVal = byUf[uf] ?? (Object.keys(byUf).length ? 0 : fallback);
      if (crcVal == null && !cartoriVal) continue;
      if (crcVal !== cartoriVal) {
        addonDiffs.push({
          slug,
          kind,
          uf,
          cartori: cartoriVal || null,
          crc: crcVal,
        });
      }
    }
  }
}

console.log("\n=== CRC addon kinds found ===");
for (const slug of SLUGS) {
  const kinds = Object.keys(crcAddons[slug] || {});
  console.log(
    slug,
    kinds.map((k) => `${k}:${Object.keys(crcAddons[slug][k]).length}`).join(" ")
  );
}

console.log("\n=== Addon Cartori vs CRC diffs ===");
console.log("diffs", addonDiffs.length);
const byKind = {};
for (const d of addonDiffs) {
  const key = `${d.slug}|${d.kind}`;
  byKind[key] = (byKind[key] || 0) + 1;
}
console.log(byKind);
addonDiffs.slice(0, 60).forEach((d) => console.log(JSON.stringify(d)));

const summary = {
  formatDiffs: formatDiffs.length,
  duplicateUfBlocks: duplicateUfs.length,
  addonDiffs: addonDiffs.length,
  formatDiffsSample: formatDiffs.slice(0, 40),
  addonDiffsSample: addonDiffs.slice(0, 40),
  catalogMins,
  crcAddonCoverage: Object.fromEntries(
    SLUGS.map((slug) => [
      slug,
      Object.fromEntries(
        Object.entries(crcAddons[slug] || {}).map(([k, v]) => [k, Object.keys(v).length])
      ),
    ])
  ),
};
fs.writeFileSync(
  path.join(ROOT, "import/civil-crc-price-audit.json"),
  JSON.stringify({ formatDiffs, duplicateUfs, addonDiffs, catalogMins, crcAddonCoverage: summary.crcAddonCoverage }, null, 2)
);
console.log("\nwrote import/civil-crc-price-audit.json");
