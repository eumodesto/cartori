const fs = require("fs");

function parseCsv(path) {
  const text = fs.readFileSync(path, "utf8");
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

const products = parseCsv("D:/Users/MODESTO/Downloads/Product_rows (2).csv");
const fields = parseCsv("D:/Users/MODESTO/Downloads/ProductField_rows (2).csv");
const nasc = products.find((p) => p.slug === "certidao-de-nascimento");
const nf = fields.filter((f) => f.productId === nasc.id);
const skip = (n) =>
  /^(tipo_produto|cartorio|state|city|municipio|apostilamento|traducao|inteiro_teor|cartorios_multiplos)/i.test(
    n
  );
const byName = new Map();
for (const f of nf) {
  if (skip(f.name) || f.type === "SELECT_TIPOS_PRODUTO") continue;
  const prev = byName.get(f.name) || {
    name: f.name,
    label: f.label,
    type: f.type,
    required: false,
    n: 0,
  };
  prev.required = prev.required || f.required === "true";
  prev.n++;
  byName.set(f.name, prev);
}
console.log("raw", nf.length, "kept unique", byName.size);
for (const v of [...byName.values()].sort((a, b) => a.name.localeCompare(b.name))) {
  console.log(`${v.n}\t${v.type}\t${v.required ? "REQ" : "opt"}\t${v.name}\t${v.label}`);
}
const types = {};
fields.forEach((f) => {
  types[f.type] = (types[f.type] || 0) + 1;
});
console.log("types", types);
console.log("\n--- nascimento ALL unique names ---");
const all = new Map();
for (const f of nf) {
  const prev = all.get(f.name) || { n: 0, type: f.type, label: f.label };
  prev.n++;
  all.set(f.name, prev);
}
for (const [k, v] of [...all.entries()].sort()) {
  console.log(`${v.n}\t${v.type}\t${k}\t${v.label}`);
}

console.log("\n--- negativa onus unique names ---");
const onus = products.find((p) => p.slug === "certidao-negativa-de-onus-de-imovel");
const ofields = fields.filter((f) => f.productId === onus.id);
const onames = new Map();
for (const f of ofields) {
  if (skip(f.name) || f.type === "SELECT_TIPOS_PRODUTO") continue;
  const prev = onames.get(f.name) || { n: 0, type: f.type, label: f.label, required: false };
  prev.n++;
  prev.required = prev.required || f.required === "true";
  onames.set(f.name, prev);
}
for (const [k, v] of [...onames.entries()].sort()) {
  console.log(`${v.n}\t${v.type}\t${v.required ? "REQ" : "opt"}\t${k}\t${v.label}`);
}
const slugs = [
  "certidao-de-nascimento",
  "certidao-de-casamento",
  "certidao-de-obito",
  "certidao-de-divorcio",
  "certidao-de-interdicao",
  "certidao-negativa-de-testamento",
  "certidao-de-escritura",
  "certidao-de-procuracao",
  "certidao-de-matricula-de-imovel",
  "busca-da-matricula-do-imovel",
  "certidao-negativa-de-onus-de-imovel",
  "certidao-negativa-de-propriedade-imovel",
  "certidao-de-protesto",
];
console.log("\n--- CRC slugs matching escritura/matricula/trf/ccir ---");
for (const p of products) {
  const s = (p.slug + " " + p.name).toLowerCase();
  if (/escritur|matricul|trf|trt|ccir|testamento|procurac|protesto/.test(s)) {
    console.log(p.status, p.slug, "|", p.name);
  }
}

console.log("\n--- unique kept per catalog slug ---");
for (const slug of slugs) {
  const p = products.find((x) => x.slug === slug);
  if (!p) {
    console.log(slug, "NOT IN CRC");
    continue;
  }
  const pf = fields.filter((f) => f.productId === p.id);
  const names = new Set();
  for (const f of pf) {
    if (skip(f.name) || f.type === "SELECT_TIPOS_PRODUTO") continue;
    names.add(f.name);
  }
  console.log(slug, "raw", pf.length, "unique", names.size);
}
