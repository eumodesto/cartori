import {
  EMAIL_TEMPLATE_DEFS,
  ORDER_STATUS_TEMPLATE_STATUSES,
  getEmailTemplateDef,
  orderStatusTemplateKey,
  renderTemplateString,
} from "../src/lib/email-templates";

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(`FAIL: ${message}`);
  console.log(`ok: ${message}`);
}

// Chaves únicas
const keys = EMAIL_TEMPLATE_DEFS.map((t) => t.key);
assert(new Set(keys).size === keys.length, "chaves de template são únicas");

// Templates essenciais existem
for (const key of ["account_created", "order_created", "docs_request_testamento"]) {
  assert(Boolean(getEmailTemplateDef(key)), `template "${key}" existe`);
}

// Um template por status
for (const status of ORDER_STATUS_TEMPLATE_STATUSES) {
  assert(
    Boolean(getEmailTemplateDef(orderStatusTemplateKey(status))),
    `template de status "${status}" existe`
  );
}

// Interpolação: substitui e deixa desconhecida vazia
const rendered = renderTemplateString("Olá {{nome}} — {{ desconhecida }}", { nome: "Ana" });
assert(rendered === "Olá Ana — ", "interpolação substitui conhecidas e zera desconhecidas");

// Toda variável usada em subject/body deve estar declarada (sem {{}} sobrando no render)
for (const def of EMAIL_TEMPLATE_DEFS) {
  const vars: Record<string, string> = {};
  for (const v of def.variables) vars[v.name] = v.sample;
  const outSubject = renderTemplateString(def.subject, vars);
  const outBody = renderTemplateString(def.body, vars);
  assert(!/\{\{.*?\}\}/.test(outSubject), `subject de "${def.key}" sem variáveis não declaradas`);
  assert(!/\{\{.*?\}\}/.test(outBody), `body de "${def.key}" sem variáveis não declaradas`);
}

console.log("\netapa8-email-templates-check: PASSOU");
