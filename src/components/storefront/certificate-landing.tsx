import Link from "next/link";
import { MVP_CERTIFICATES } from "@/lib/catalog";
import { certificatePath } from "@/lib/certificate-links";
import { startingPriceFor } from "@/lib/pricing";
import { certificateShortName } from "@/lib/seo";
import type { CertificateTypeConfig } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

const RELATED_LIMIT = 6;

export function certificateLandingTitle(cert: CertificateTypeConfig) {
  return `${certificateShortName(cert)} online`;
}

function relatedCertificates(cert: CertificateTypeConfig) {
  const sameCategory = MVP_CERTIFICATES.filter(
    (other) => other.category === cert.category && other.slug !== cert.slug
  );
  const others = MVP_CERTIFICATES.filter(
    (other) => other.category !== cert.category && other.slug !== cert.slug
  );
  return [...sameCategory, ...others].slice(0, RELATED_LIMIT);
}

function formatsText(cert: CertificateTypeConfig) {
  return cert.hasShippingOption
    ? "Digital (PDF), papel enviado pelos Correios ou os dois"
    : "Digital (PDF)";
}

export function CertificateLanding({ cert }: { cert: CertificateTypeConfig }) {
  const name = certificateShortName(cert);
  const price = formatCurrency(startingPriceFor(cert));
  const priceVaries = cert.priceMode === "uf-format" || cert.priceMode === "uf-flat";
  const related = relatedCertificates(cert);

  const steps = [
    {
      title: "Informe o local e os dados",
      text: cert.requiresCartorio
        ? `Clique em Solicitar, escolha estado, cidade e cartório e preencha os dados do documento.${
            cert.hasSearchFee
              ? ` Não sabe o cartório? Marque a busca (${formatCurrency(cert.searchFee)}) e a equipe localiza.`
              : ""
          }`
        : "Clique em Solicitar e preencha os dados pedidos no formulário.",
    },
    {
      title: "Escolha o formato",
      text: `${formatsText(cert)}.${
        cert.hasApostilleOption ? " Para uso no exterior, inclua a Apostila de Haia." : ""
      }`,
    },
    {
      title: "Pague com PIX ou cartão",
      text: "O valor total aparece antes da confirmação, já com taxas e frete quando houver.",
    },
    {
      title: "Acompanhe pelo painel",
      text: `O prazo estimado é de ${cert.estimatedDays} após a confirmação do pagamento e depende do cartório ou órgão emissor. O documento fica disponível no painel assim que é emitido.`,
    },
  ];

  return (
    <section
      id="sobre-a-certidao"
      className="scroll-mt-32 py-16 bg-white border-b border-slate-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-serif">
              Como solicitar {name} online
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">{cert.shortDescription}</p>
            <ol className="space-y-4">
              {steps.map((step, index) => (
                <li key={step.title} className="flex gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-50 text-sm font-bold text-primary-800">
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{step.title}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <aside className="rounded-2xl border border-slate-200 bg-slate-50 p-6 space-y-4 h-fit">
            <h2 className="text-lg font-bold text-slate-900 font-serif">Resumo</h2>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-500">Área</dt>
                <dd className="font-medium text-slate-900">{cert.categoryName}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-500">Prazo estimado</dt>
                <dd className="font-medium text-slate-900">
                  {cert.estimatedDays}, após a confirmação do pagamento
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-500">Preço</dt>
                <dd className="font-medium text-slate-900">
                  A partir de {price}
                  {priceVaries && (
                    <span className="block text-xs font-normal text-slate-500">
                      Varia conforme o estado e o formato.
                    </span>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-500">Formatos</dt>
                <dd className="font-medium text-slate-900">{formatsText(cert)}</dd>
              </div>
            </dl>
            <a
              href="#certidoes"
              className="inline-flex w-full items-center justify-center rounded-lg bg-primary-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-800"
            >
              Solicitar {name}
            </a>
          </aside>
        </div>

        {related.length > 0 && (
          <nav aria-labelledby="outras-certidoes" className="space-y-4">
            <h2 id="outras-certidoes" className="text-xl font-bold text-slate-900 font-serif">
              Outras certidões
            </h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {related.map((other) => (
                <li key={other.slug}>
                  <Link
                    href={certificatePath(other.slug)}
                    className="block rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-primary-800 hover:border-primary-300 hover:bg-primary-50"
                  >
                    {certificateShortName(other)}
                    <span className="block text-xs font-normal text-slate-500">
                      {other.categoryName} · {other.estimatedDays}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
    </section>
  );
}
