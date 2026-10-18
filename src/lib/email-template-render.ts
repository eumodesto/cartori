import { resolveEmailTemplate } from "@/lib/email-settings";
import { type EmailTemplateDef, renderTemplateString } from "@/lib/email-templates";

/**
 * Renderiza um template com os dados de exemplo das variáveis, usando o rascunho do editor
 * (assunto/corpo não salvos) quando vier, senão o salvo, senão o padrão.
 * Serve à pré-visualização e ao envio de teste.
 */
export async function renderTemplateDraft(
  def: EmailTemplateDef,
  draft: { subject?: unknown; body?: unknown; vars?: unknown }
) {
  const vars: Record<string, string> = {};
  for (const variable of def.variables) vars[variable.name] = variable.sample;
  if (draft.vars && typeof draft.vars === "object") {
    for (const [key, value] of Object.entries(draft.vars as Record<string, unknown>)) {
      if (value != null) vars[key] = String(value);
    }
  }
  const resolved = await resolveEmailTemplate(def.key);
  const subjectTpl = typeof draft.subject === "string" ? draft.subject : resolved?.subject ?? def.subject;
  const bodyTpl = typeof draft.body === "string" ? draft.body : resolved?.body ?? def.body;
  return {
    subject: renderTemplateString(subjectTpl, vars),
    body: renderTemplateString(bodyTpl, vars),
  };
}
