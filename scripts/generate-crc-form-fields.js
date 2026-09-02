/**
 * Builds src/lib/crc-form-fields.ts from CRC ProductField exports.
 * Skips location/format/apostille UI that Cartori already handles.
 * Dedupes UF-suffixed copies. Attaches ProductPriceExtra + CRC visibleWhen.
 */
const fs = require("fs");
const path = require("path");

const IBGE_UF = {
  11: "RO",
  12: "AC",
  13: "AM",
  14: "RR",
  15: "PA",
  16: "AP",
  17: "TO",
  21: "MA",
  22: "PI",
  23: "CE",
  24: "RN",
  25: "PB",
  26: "PE",
  27: "AL",
  28: "SE",
  29: "BA",
  31: "MG",
  32: "ES",
  33: "RJ",
  35: "SP",
  41: "PR",
  42: "SC",
  43: "RS",
  50: "MS",
  51: "MT",
  52: "GO",
  53: "DF",
};

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

function skipField(name, type) {
  const n = String(name || "").trim();
  if (
    [
      "SELECT_TIPOS_PRODUTO",
      "SELECT_CARTORIOS",
      "MULTI_SELECT_CARTORIOS",
      "LABEL",
    ].includes(type)
  ) {
    return true;
  }
  if (/^(tipo_produto|cartorio|cartorios_multiplos)/i.test(n)) return true;
  if (/^(sabe_nome_cartorio|nao_sei_nome_cartorio)$/i.test(n)) return true;
  if (/^apostilamento/i.test(n) && !/traduzida/i.test(n)) return true;
  if (/^email/i.test(n) || /^(phone|telefone)$/i.test(n)) return true;
  if (/^cartorio_/i.test(n)) return true;
  return false;
}

function canonicalName(name) {
  let n = String(name || "")
    .trim()
    .replace(/_copia$/i, "");
  if (/^certidao_matricula_atualizada_inteiro/i.test(n)) {
    return "certidao_matricula_atualizada_inteiro_teor";
  }
  if (/^negativa_onus/i.test(n)) return "negativa_onus";
  if (/^apostilamento.*traduzida/i.test(n)) return "apostilamento_traduzida";
  if (/^inteiro_teor/i.test(n)) return "inteiro_teor";
  if (/^averbacao/i.test(n)) return "averbacao";
  n = n.replace(/_\d+$/, "").replace(/-\d+$/, "");
  return n;
}

function mapType(crcType) {
  if (crcType === "DATE") return "date";
  if (crcType === "NUMBER") return "number";
  if (crcType === "SELECT" || crcType === "SELECT_ESTADOS" || crcType === "SELECT_MUNICIPIOS") {
    return "select";
  }
  if (crcType === "RADIO") return "radio";
  if (crcType === "CHECKBOX") return "checkbox";
  if (crcType === "TEXTAREA") return "textarea";
  return "text";
}

const REGISTRY_NUMBER_IDS = new Set([
  "numero_termo",
  "numero_livro",
  "numero_folha",
  "numero_folhe",
]);

function documentFieldGroup(field) {
  if (REGISTRY_NUMBER_IDS.has(field.id)) return 1;
  if (field.type === "date" || String(field.id).startsWith("data-") || String(field.id).startsWith("nome")) {
    return 0;
  }
  return 2;
}

function sortDocumentFields(fields) {
  return fields
    .map((field, index) => ({ field, index }))
    .sort((a, b) => documentFieldGroup(a.field) - documentFieldGroup(b.field) || a.index - b.index)
    .map((item) => item.field);
}

function crcFormatToCartori(value) {
  if (value === "ELECTRONIC") return "DIGITAL_ECERTIDAO";
  if (value === "PAPER") return "PHYSICAL_PAPER";
  if (value === "BOTH") return "BOTH";
  return null;
}

function priceFromName(name) {
  const m = String(name || "").match(/(?:_|-)(\d{2,4})$/);
  if (!m) return 0;
  return Number(m[1]) || 0;
}

function money(n) {
  const v = Number(n);
  if (!Number.isFinite(v) || v <= 0) return 0;
  return Math.round(v * 100) / 100;
}

function parseConditional(raw) {
  if (!raw || raw === "null") return null;
  let json;
  try {
    json = JSON.parse(raw);
  } catch {
    return null;
  }
  const rules = json.rules || [];
  if (!rules.length) return null;

  const byField = new Map();
  for (const rule of rules) {
    const field = rule.field;
    if (!field) continue;
    const list = byField.get(field) || [];
    list.push(rule);
    byField.set(field, list);
  }

  const clauses = [];
  const ufCodes = [];
  for (const [field, rs] of byField) {
    if (/cartorio_state|cartorios_multiplos_state/.test(field)) {
      for (const rule of rs) {
        if (rule.operator === "equals" && rule.value) ufCodes.push(String(rule.value));
      }
    }
  }
  if (ufCodes.length) {
    const siglas = [...new Set(ufCodes.map((code) => IBGE_UF[code]).filter(Boolean))].sort();
    if (siglas.length) clauses.push({ field: "_uf", in: siglas });
  }

  const tipoRules = [];
  for (const [field, rs] of byField) {
    if (/^tipo_produto/.test(field)) tipoRules.push(...rs);
  }
  if (tipoRules.length) {
    const allNotElectronic = tipoRules.every(
      (rule) => rule.operator === "not_equals" && rule.value === "ELECTRONIC"
    );
    if (allNotElectronic) {
      clauses.push({ field: "_format", notIn: ["DIGITAL_ECERTIDAO"] });
    } else {
      const mapped = [
        ...new Set(
          tipoRules
            .filter((rule) => rule.operator === "equals")
            .map((rule) => crcFormatToCartori(rule.value))
            .filter(Boolean)
        ),
      ];
      if (mapped.length) clauses.push({ field: "_format", in: mapped });
    }
  }

  const trad = byField.get("traducao-juramentada");
  if (trad) {
    const values = [
      ...new Set(
        trad.filter((rule) => rule.operator === "equals" && rule.value).map((rule) => rule.value)
      ),
    ];
    if (values.length) clauses.push({ field: "traducao-juramentada", in: values });
  }

  if (!clauses.length) return null;
  return clauses.length === 1 ? clauses[0] : clauses;
}

function ufListFromVisibility(visibleWhen) {
  const rules = !visibleWhen ? [] : Array.isArray(visibleWhen) ? visibleWhen : [visibleWhen];
  const uf = rules.find((rule) => rule.field === "_uf" && rule.in);
  return uf ? [...uf.in] : [];
}

function mergeRuleLists(rules) {
  const byKey = new Map();
  for (const rule of rules) {
    if (!rule) continue;
    const kind = rule.in ? "in" : rule.notIn ? "notIn" : "plain";
    const key = `${rule.field}|${kind}`;
    const existing = byKey.get(key);
    if (!existing) {
      byKey.set(key, {
        field: rule.field,
        in: rule.in ? [...rule.in] : undefined,
        notIn: rule.notIn ? [...rule.notIn] : undefined,
      });
      continue;
    }
    if (rule.in) existing.in = [...new Set([...(existing.in || []), ...rule.in])];
    if (rule.notIn) existing.notIn = [...new Set([...(existing.notIn || []), ...rule.notIn])];
  }
  return [...byKey.values()].map((rule) => {
    const clean = { field: rule.field };
    if (rule.in?.length) clean.in = [...new Set(rule.in)].sort();
    if (rule.notIn?.length) clean.notIn = [...new Set(rule.notIn)].sort();
    return clean;
  });
}

function mergeVisibility(prev, next) {
  if (!prev) return next;
  if (!next) return prev;
  const prevRules = Array.isArray(prev) ? prev : [prev];
  const nextRules = Array.isArray(next) ? next : [next];
  const prevUf = ufListFromVisibility(prev);
  const nextUf = ufListFromVisibility(next);
  const others = mergeRuleLists(
    [...prevRules, ...nextRules].filter((rule) => rule.field !== "_uf")
  );
  const clauses = [];
  if (prevUf.length || nextUf.length) {
    const mergedUf = [...new Set([...prevUf, ...nextUf])].sort();
    if (mergedUf.length) clauses.push({ field: "_uf", in: mergedUf });
  }
  clauses.push(...others);
  if (!clauses.length) return null;
  return clauses.length === 1 ? clauses[0] : clauses;
}

function isPricedAddon(id) {
  return /^(averbacao|inteiro_teor|traducao|apostilamento)/i.test(id);
}

function mergePrice(prev, amount, ufs) {
  if (!amount) return prev;
  if (!ufs.length) {
    if (!prev.price) prev.price = amount;
    return prev;
  }
  prev.priceByUf = prev.priceByUf || {};
    for (const uf of ufs) {
      prev.priceByUf[uf] = amount;
    }
  if (!prev.price) prev.price = amount;
  return prev;
}

function applyVisibility(list) {
  const ids = new Set(list.map((f) => f.id));
  const hasPfPj = ids.has("pessoa_fisica_juridica");
  const hasEmitir = ids.has("emitir_por");
  const hasMetodo = ids.has("metodo_busca");
  const hasNome = ids.has("nome");

  return list.map((f) => {
    if (f.visibleWhen) return f;
    let visibleWhen;
    if (hasMetodo) {
      if (["nome_completo", "cpf"].includes(f.id)) {
        visibleWhen = { field: "metodo_busca", in: ["cpf-proprietario"] };
      } else if (["razao_social", "cnpj"].includes(f.id)) {
        visibleWhen = { field: "metodo_busca", in: ["cnpj-proprietario"] };
      } else if (f.id.startsWith("cep_") || f.id === "possiveis_proprietarios") {
        visibleWhen = { field: "metodo_busca", in: ["endereco-imovel"] };
      }
    } else if (hasEmitir) {
      if (f.id === "numero_matricula") {
        visibleWhen = { field: "emitir_por", in: ["matricula", "matricula_endereco"] };
      } else if (f.id.startsWith("cep_")) {
        visibleWhen = { field: "emitir_por", in: ["endereco", "matricula_endereco"] };
      }
    } else if (hasPfPj && f.id !== "pessoa_fisica_juridica") {
      const pf = [
        "cpf",
        "nome",
        "rg",
        "nome_da_mae",
        "nome_pai",
        "estado_civil",
        "orgao_expedidor",
        "nome_pessoa",
        "Nome",
      ];
      if (!hasNome && !ids.has("nome_proprietario") && !ids.has("nome_pessoa")) pf.push("nome_completo");
      const pj = ["cnpj", "razao_social", "razao_socila", "natureza_juridica"];
      if (pf.includes(f.id)) {
        visibleWhen = { field: "pessoa_fisica_juridica", in: ["pessoa-fisica"] };
      }
      if (pj.includes(f.id)) {
        visibleWhen = { field: "pessoa_fisica_juridica", in: ["pessoa-juridica"] };
      }
    }
    const livroSkipId = [
      "nao_sei_livro_folha",
      "nao_sabe_livro_folha",
      "nao_sei_livro",
      "sabe_livro_folha",
      "livro_folha",
    ].find((id) => ids.has(id));
    if (livroSkipId && ["numero_livro", "numero_folha", "numero_folhe"].includes(f.id)) {
      visibleWhen = { field: livroSkipId, notIn: ["true"] };
    }
    return visibleWhen ? { ...f, visibleWhen } : f;
  });
}

const SLUG_ALIASES = {
  "certidao-de-matricula-de-imovel":
    "certidao-de-matricula-atualizada-de-imovel-com-inteiro-teor",
};

const CARTORI_SLUGS = [
  "certidao-de-nascimento",
  "certidao-de-casamento",
  "certidao-de-obito",
  "certidao-de-divorcio",
  "certidao-de-interdicao",
  "certidao-negativa-de-testamento",
  "consulta-de-inventario",
  "certidao-de-inventario",
  "certidao-de-procuracao",
  "certidao-de-escritura-de-ata-notarial",
  "certidao-de-escritura-de-cessao-de-direito-de-imovel",
  "certidao-de-escritura-de-compra-e-venda",
  "certidao-de-escritura-de-divorcio",
  "certidao-de-escritura-de-doacao",
  "certidao-de-escritura-de-emancipacao",
  "certidao-de-escritura-de-hipoteca",
  "certidao-de-escritura-de-imovel",
  "certidao-de-escritura-de-inventario-e-partilha",
  "certidao-de-escritura-de-pacto-antenupcial",
  "certidao-de-escritura-de-permuta",
  "certidao-de-escritura-de-registro-de-condominio",
  "certidao-de-escritura-de-registro-de-partilha",
  "certidao-de-escritura-de-renuncia-de-heranca",
  "certidao-de-escritura-de-substabelecimento",
  "certidao-de-escritura-de-uniao-estavel",
  "certidao-de-escritura-de-usucapiao",
  "certidao-de-matricula-de-imovel",
  "busca-da-matricula-do-imovel",
  "certidao-negativa-de-onus-de-imovel",
  "certidao-negativa-de-propriedade-imovel",
  "pesquisa-de-imoveis",
  "certidao-de-protesto",
  "pesquisa-de-protesto",
  "trf-certidao-de-distribuicao-da-justica-federal",
  "trt-certidao-de-acoes-trabalhistas-ceat",
  "ccir-certificado-cadastro-imovel-rural-incra",
];

const products = parseCsv("D:/Users/MODESTO/Downloads/Product_rows (2).csv");
const fields = parseCsv("D:/Users/MODESTO/Downloads/ProductField_rows (2).csv");
const options = parseCsv("D:/Users/MODESTO/Downloads/ProductFieldOption_rows (3).csv");
const extras = parseCsv("D:/Users/MODESTO/Downloads/ProductPriceExtra_rows (2).csv");

const extraByOptionId = new Map();
for (const extra of extras) {
  const amount = money(extra.extraAmount);
  if (amount && extra.productFieldOptionId) {
    extraByOptionId.set(extra.productFieldOptionId, amount);
  }
}

const optionsByField = new Map();
for (const opt of options) {
  const list = optionsByField.get(opt.fieldId) || [];
  list.push({
    id: opt.id,
    label: opt.label,
    value: opt.value || opt.label,
    price: extraByOptionId.get(opt.id) || 0,
  });
  optionsByField.set(opt.fieldId, list);
}

function fieldsForProductId(productId) {
  const raw = fields
    .map((f, csvIndex) => ({ ...f, csvIndex }))
    .filter((f) => f.productId === productId);
  const byCanon = new Map();
  for (const f of raw) {
    if (skipField(f.name, f.type)) continue;
    const id = canonicalName(f.name);
    const order = Number(f.order) || 0;
    const visibleWhen = parseConditional(f.conditional);
    const ufs = ufListFromVisibility(visibleWhen);
    const optionRows = optionsByField.get(f.id) || [];
    const extraOnOptions = optionRows.map((opt) => opt.price).filter(Boolean);
    const rawFieldPrice =
      extraOnOptions[0] || money(f.additionalValue) || priceFromName(f.name);
    const fieldPrice = isPricedAddon(id) ? rawFieldPrice : 0;
    let type = mapType(f.type);
    let mappedOptions = optionRows.map((opt) => {
      const option = { label: String(opt.label || opt.value).trim(), value: opt.value };
      if (opt.price) option.price = opt.price;
      return option;
    });

    if (id === "inteiro_teor") {
      const optionValue = /reprografica/i.test(f.name)
        ? "inteiro_teor_reprografica"
        : mappedOptions[0]?.value || "inteiro_teor";
      const optionLabel = /reprografica/i.test(f.name)
        ? "Inteiro teor — reprográfica"
        : "Inteiro teor — transcrita";
      const option = { label: optionLabel, value: optionValue };
      if (fieldPrice) option.price = fieldPrice;
      mappedOptions = [option, ...(mappedOptions.filter((opt) => opt.value !== optionValue))];
    }

    const mapped = {
      id,
      label: /^nao_sei_livro|^nao_sabe_livro|^sabe_livro_folha$/i.test(id)
        ? "Não sei o livro e a folha"
        : id === "inteiro_teor"
          ? "Inteiro teor"
          : String(f.label || id).trim().replace(/\s+$/, ""),
      type,
      required: f.required === "true",
      placeholder: f.placeholder || undefined,
      options: mappedOptions,
      visibleWhen,
      price: id === "inteiro_teor" || type === "select" ? undefined : fieldPrice || undefined,
      priceByUf: undefined,
      order,
      csvIndex: f.csvIndex,
      dataSource:
        f.type === "SELECT_ESTADOS" || id === "state" || id === "cep_uf"
          ? "ibge-uf"
          : f.type === "SELECT_MUNICIPIOS" || id === "city" || id === "cep_cidade"
            ? "ibge-city"
            : undefined,
    };

    if (id !== "inteiro_teor") {
      mergePrice(mapped, fieldPrice, ufs);
    } else if (fieldPrice) {
      mergePrice(mapped.options[0], fieldPrice, ufs);
    }

    const prev = byCanon.get(id);
    if (!prev || order < prev.order || (order === prev.order && f.csvIndex < prev.csvIndex)) {
      if (prev) {
        mapped.required = Boolean(prev.required) || mapped.required;
        mapped.visibleWhen = mergeVisibility(mapped.visibleWhen, prev.visibleWhen);
        mapped.price = mapped.price || prev.price;
        mapped.priceByUf = { ...(prev.priceByUf || {}), ...(mapped.priceByUf || {}) };
        if (!Object.keys(mapped.priceByUf).length) mapped.priceByUf = undefined;
        const optMap = new Map((prev.options || []).map((opt) => [opt.value, opt]));
        for (const opt of mapped.options || []) {
          const existing = optMap.get(opt.value);
          if (existing) {
            mergePrice(existing, opt.price, ufs);
          } else optMap.set(opt.value, opt);
        }
        mapped.options = [...optMap.values()];
      }
      byCanon.set(id, mapped);
    } else {
      prev.required = prev.required || mapped.required;
      prev.visibleWhen = mergeVisibility(prev.visibleWhen, mapped.visibleWhen);
      mergePrice(prev, fieldPrice, ufs);
      if (!prev.dataSource && mapped.dataSource) prev.dataSource = mapped.dataSource;
      const optMap = new Map((prev.options || []).map((opt) => [opt.value, opt]));
      for (const opt of mapped.options || []) {
        const existing = optMap.get(opt.value);
        if (existing) {
          mergePrice(existing, opt.price, ufs);
        } else optMap.set(opt.value, opt);
      }
      prev.options = [...optMap.values()];
    }
  }

  let list = [...byCanon.values()].sort(
    (a, b) => a.order - b.order || a.csvIndex - b.csvIndex || a.id.localeCompare(b.id)
  );

  for (const field of list) {
    if (field.id === "inteiro_teor" && (field.options || []).length) {
      field.price = undefined;
      field.priceByUf = undefined;
      const priced = (field.options || []).filter((opt) => opt.value);
      if (priced.length > 1) {
        field.type = "radio";
        field.options = priced.filter((opt) => opt.value !== "nao");
      } else {
        field.type = "checkbox";
        field.options = undefined;
        const only = priced[0];
        if (only?.price) field.price = only.price;
        if (only?.priceByUf && Object.keys(only.priceByUf).length) field.priceByUf = only.priceByUf;
      }
    }
  }

  const emitir = list.filter((f) => f.id.startsWith("emitir_por_"));
  if (emitir.length >= 2) {
    list = list.filter((f) => !f.id.startsWith("emitir_por_"));
    list.unshift({
      id: "emitir_por",
      label: "Como emitir",
      type: "select",
      required: true,
      options: emitir.map((f) => ({
        label: f.label,
        value: f.id.replace("emitir_por_", ""),
      })),
      order: Math.min(...emitir.map((f) => f.order)),
      csvIndex: Math.min(...emitir.map((f) => f.csvIndex)),
    });
    list.sort((a, b) => a.order - b.order || a.csvIndex - b.csvIndex);
  }

  list = applyVisibility(list);
  list = sortDocumentFields(list);

  return list.map(({ order, csvIndex, ...rest }) => {
    const field = {
      id: rest.id,
      label: rest.label,
      type: rest.type,
      required: rest.required,
    };
    if (rest.placeholder) field.placeholder = rest.placeholder;
    if (rest.options?.length && (rest.type === "select" || rest.type === "radio")) {
      field.options = rest.options.map((opt) => {
        const clean = { label: opt.label, value: opt.value };
        if (opt.price) clean.price = opt.price;
        if (opt.priceByUf && Object.keys(opt.priceByUf).length) clean.priceByUf = opt.priceByUf;
        return clean;
      });
    }
    if (rest.type === "radio" && !field.options) {
      field.options = [
        { label: "Sim", value: "sim" },
        { label: "Não", value: "nao" },
      ];
    }
    if (rest.visibleWhen) field.visibleWhen = rest.visibleWhen;
    if (rest.dataSource) field.dataSource = rest.dataSource;
    if (rest.type !== "select" && rest.type !== "radio") {
      if (rest.price) field.price = rest.price;
      if (rest.priceByUf && Object.keys(rest.priceByUf).length) {
        const amounts = [...new Set(Object.values(rest.priceByUf))];
        if (amounts.length === 1 && (!rest.price || rest.price === amounts[0])) {
          field.price = amounts[0];
        } else {
          field.priceByUf = rest.priceByUf;
          if (rest.price) field.price = rest.price;
        }
      }
    }
    return field;
  });
}

const result = {};
for (const slug of CARTORI_SLUGS) {
  const crcSlug = SLUG_ALIASES[slug] || slug;
  const product = products.find((p) => p.slug === crcSlug);
  if (!product) {
    result[slug] = [];
    continue;
  }
  result[slug] = fieldsForProductId(product.id);
}

const outPath = path.join(__dirname, "..", "src", "lib", "crc-form-fields.ts");
const body = `import { FormFieldDefinition } from "./types";

/** Campos do CRC (ProductField), sem steps, localização, tipo_produto nem apostila genérica. */
export const CRC_FORM_FIELDS: Record<string, FormFieldDefinition[]> = ${JSON.stringify(
  result,
  null,
  2
)};
`;
fs.writeFileSync(outPath, body, "utf8");
console.log("wrote", outPath);
for (const slug of ["certidao-de-nascimento", "certidao-de-casamento", "certidao-de-obito", "certidao-de-divorcio", "certidao-de-interdicao"]) {
  const fieldsFor = result[slug] || [];
  console.log("\n" + slug);
  for (const field of fieldsFor) {
    const extra = field.price
      ? ` price=${field.price}`
      : field.priceByUf
        ? ` priceByUf`
        : "";
    const opts = (field.options || [])
      .filter((opt) => opt.price)
      .map((opt) => `${opt.value}:${opt.price}`)
      .join(",");
    console.log(
      `  ${field.id} ${field.type}${extra}${opts ? ` opts ${opts}` : ""} vis=${JSON.stringify(field.visibleWhen || null)}`
    );
  }
}
