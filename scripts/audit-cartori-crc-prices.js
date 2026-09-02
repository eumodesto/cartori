/**
 * Cruzamento Cartori × CRC.
 * Fontes CRC (nessa ordem): Product.basePrice → ProductField.additionalValue
 * (exceto apostila) → mediana ProductPriceExtra.
 *
 * Uso: node scripts/audit-cartori-crc-prices.js
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const CRC_SLUG_ALIAS = {
  "certidao-de-matricula-de-imovel":
    "certidao-de-matricula-atualizada-de-imovel-com-inteiro-teor",
};

function readJson(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

function extractCatalog(ts) {
  const items = [];
  const seen = new Set();

  for (const m of ts.matchAll(/escrituraPublica\(\s*"([^"]+)"/g)) {
    const slug = m[1];
    seen.add(slug);
    items.push({
      slug,
      name: slug,
      basePrice: 219.9,
      priceMode: "national",
      fromHelper: "escrituraPublica",
    });
  }

  const objRe =
    /slug:\s*"([^"]+)"[\s\S]{0,500}?basePrice:\s*([0-9.]+)(?:[\s\S]{0,350}?priceMode:\s*"([^"]+)")?/g;
  for (const m of ts.matchAll(objRe)) {
    const slug = m[1];
    if (seen.has(slug)) continue;
    seen.add(slug);
    items.push({
      slug,
      name: slug,
      basePrice: Number(m[2]),
      priceMode: m[3] || "national",
    });
  }

  return items;
}

function num(v) {
  if (v == null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function money(n) {
  return Math.round(n * 100) / 100;
}

function fieldListPrice(productFields) {
  if (!productFields) return null;
  const hits = (productFields.fields || []).filter((f) => {
    const n = num(f.additionalValue);
    if (!n || n <= 0) return false;
    if (/apostil/i.test(f.name || "") || /apostil/i.test(f.label || "")) return false;
    return true;
  });
  if (!hits.length) return null;
  const max = Math.max(...hits.map((f) => num(f.additionalValue)));
  return {
    crcPrice: max,
    field: hits.map((f) => ({ name: f.name, additionalValue: num(f.additionalValue) })),
  };
}

function electronicMin(ufTable) {
  if (!ufTable) return null;
  const vals = Object.values(ufTable)
    .map((row) => num(row?.ELECTRONIC))
    .filter((n) => n != null);
  if (!vals.length) return null;
  return Math.min(...vals);
}

const catalogTs = fs.readFileSync(path.join(ROOT, "src/lib/catalog.ts"), "utf8");
const catalog = extractCatalog(catalogTs);
const productsJson = readJson("import/crcbrasil-products.json");
const pricesJson = readJson("import/crcbrasil-prices.json");
const fieldsJson = readJson("import/crcbrasil-fields.json");
const ufPrices = fs.existsSync(path.join(ROOT, "src/lib/crc-uf-prices.ts"))
  ? require("fs")
      .readFileSync(path.join(ROOT, "src/lib/crc-uf-prices.ts"), "utf8")
  : "";

const productBySlug = new Map(
  (productsJson.products || productsJson).map((p) => [p.slug.trim(), p])
);
const extraBySlug = new Map((pricesJson.products || []).map((p) => [p.slug.trim(), p]));
const fieldsBySlug = new Map((fieldsJson.products || []).map((p) => [p.slug.trim(), p]));

function crcFor(cartoriSlug) {
  const crcSlug = CRC_SLUG_ALIAS[cartoriSlug] || cartoriSlug;
  const product = productBySlug.get(crcSlug);
  const extras = extraBySlug.get(crcSlug);
  const fields = fieldsBySlug.get(crcSlug);
  const add = fieldListPrice(fields);
  const base = product ? num(product.basePrice) : null;
  const extraMedian = extras ? num(extras.extraMedian ?? extras.suggestedListPrice) : null;
  const extraCount = extras ? extras.extraCount || 0 : 0;

  let crcPrice = null;
  let crcSource = "none";
  let certainty = "none";

  if (base != null) {
    crcPrice = base;
    crcSource = "Product.basePrice";
    certainty = "high";
  } else if (add) {
    crcPrice = add.crcPrice;
    crcSource = `ProductField.additionalValue (${add.field.map((f) => f.name).join(", ")})`;
    certainty = "high";
  } else if (extraMedian != null && extraCount > 0) {
    crcPrice = extraMedian;
    crcSource = "ProductPriceExtra.median";
    certainty = extraCount >= 20 ? "medium" : "low";
  }

  return {
    crcSlug,
    crcName: product?.name || null,
    productFound: Boolean(product),
    productBasePrice: base,
    additionalValue: add,
    extraCount,
    extraMedian,
    extraMin: extras ? num(extras.extraMin) : null,
    extraMax: extras ? num(extras.extraMax) : null,
    crcPrice,
    crcSource,
    certainty,
  };
}

function statusOf(cartoriPrice, crc, priceMode) {
  if (crc.crcPrice == null) return "sem-preco-crc";
  const diff = money(cartoriPrice - crc.crcPrice);
  if (Math.abs(diff) <= 0.1) return "ok";
  if (priceMode === "uf-format" || priceMode === "uf-flat") {
    return "card-nacional-vs-checkout-por-uf";
  }
  return "divergente";
}

const rows = catalog.map((item) => {
  const crc = crcFor(item.slug);
  const diff =
    crc.crcPrice == null ? null : money(item.basePrice - crc.crcPrice);
  return {
    slug: item.slug,
    cartoriPrice: item.basePrice,
    priceMode: item.priceMode,
    ...crc,
    diff,
    status: statusOf(item.basePrice, crc, item.priceMode),
  };
});

const summary = {
  total: rows.length,
  ok: rows.filter((r) => r.status === "ok").length,
  divergente: rows.filter((r) => r.status === "divergente").length,
  ufCheckout: rows.filter((r) => r.status === "card-nacional-vs-checkout-por-uf").length,
  semPrecoCrc: rows.filter((r) => r.status === "sem-preco-crc").length,
};

const report = {
  generatedAt: new Date().toISOString(),
  rule: [
    "1. Product.basePrice (preço nacional na CRC)",
    "2. Senão, ProductField.additionalValue > 0, ignorando apostila",
    "3. Senão, mediana de ProductPriceExtra (preço por UF/opção; card 'a partir de')",
    "Tolerância R$ 0,10 para arredondar 99,97 → 99,90",
  ],
  summary,
  highCertaintyDivergences: rows.filter(
    (r) => r.status === "divergente" && r.certainty === "high"
  ),
  rows: rows.sort((a, b) => a.slug.localeCompare(b.slug)),
};

const out = path.join(ROOT, "import/cartori-crc-price-audit.json");
fs.writeFileSync(out, JSON.stringify(report, null, 2) + "\n");

console.log(JSON.stringify(summary, null, 2));
console.log("\nDivergências (qualquer certeza):");
for (const r of rows.filter((r) => r.status === "divergente")) {
  console.log(
    `${r.slug}\tCartori ${r.cartoriPrice}\tCRC ${r.crcPrice} (${r.crcSource}, ${r.certainty})`
  );
}
console.log("\nWrote", out);
void ufPrices;
