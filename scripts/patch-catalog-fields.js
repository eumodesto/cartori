const fs = require("fs");
const p = "src/lib/catalog.ts";
let s = fs.readFileSync(p, "utf8");
if (!s.includes('crc-form-fields')) {
  s = s.replace(
    'import { CertificateTypeConfig } from "./types";',
    'import { CRC_FORM_FIELDS } from "./crc-form-fields";\nimport { CertificateTypeConfig } from "./types";'
  );
}

function replaceFieldsForSlug(source, slug) {
  const marker = `slug: "${slug}"`;
  const i = source.indexOf(marker);
  if (i < 0) throw new Error("missing " + slug);
  const f = source.indexOf("fields: [", i);
  if (f < 0) throw new Error("no fields for " + slug);
  let depth = 0;
  let j = f + "fields: ".length;
  const start = j;
  if (source[j] !== "[") throw new Error("expected [");
  for (; j < source.length; j++) {
    if (source[j] === "[") depth++;
    else if (source[j] === "]") {
      depth--;
      if (depth === 0) {
        j++;
        break;
      }
    }
  }
  return source.slice(0, f) + `fields: CRC_FORM_FIELDS["${slug}"]` + source.slice(j);
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
  "trf-certidao-de-distribuicao-da-justica-federal",
  "trt-certidao-de-acoes-trabalhistas-ceat",
  "ccir-certificado-cadastro-imovel-rural-incra",
];
for (const slug of slugs) {
  s = replaceFieldsForSlug(s, slug);
}
fs.writeFileSync(p, s);
console.log("patched catalog.ts");
