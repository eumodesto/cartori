import { DossierPurpose, IdentifierKind, SubjectKind } from "@prisma/client";
import { getProductBySlug } from "@/lib/product-store";
import type {
  PublicCertificateRecommendation,
  PublicDossier,
  PublicSubject,
} from "@/lib/dossier-types";

type RecSpec = {
  slug: string;
  reason: string;
  subject: PublicSubject;
};

function hasKind(subject: PublicSubject, kind: IdentifierKind) {
  return subject.identifiers.some((row) => row.kind === kind && row.value);
}

function firstOf(subjects: PublicSubject[], kind: SubjectKind) {
  return subjects.find((row) => row.kind === kind);
}

function peopleAndCompanies(subjects: PublicSubject[]) {
  return subjects.filter((row) => row.kind === "PERSON" || row.kind === "COMPANY");
}

function specsForPurpose(purpose: DossierPurpose, subjects: PublicSubject[]): RecSpec[] {
  const specs: RecSpec[] = [];
  const add = (slug: string, reason: string, subject: PublicSubject) => {
    specs.push({ slug, reason, subject });
  };

  const urban = firstOf(subjects, "URBAN_PROPERTY");
  const rural = firstOf(subjects, "RURAL_PROPERTY");
  const property = urban || rural || subjects[0];
  const lawsuit = firstOf(subjects, "LAWSUIT");
  const parties = peopleAndCompanies(subjects);
  const fallback = subjects[0];
  if (!fallback) return specs;

  const missingMatricula = !urban || !hasKind(urban, "MATRICULA");

  if (purpose === "COMPRA_IMOVEL" || purpose === "FINANCIAMENTO") {
    if (missingMatricula) {
      add(
        "busca-da-matricula-do-imovel",
        "Localiza a matrícula no RI antes da certidão de inteiro teor.",
        urban || fallback
      );
    }
    add(
      "certidao-de-matricula-de-imovel",
      "Cadeia dominial, ônus e ações na matrícula — peça central da due diligence imobiliária.",
      property
    );
    add(
      "certidao-negativa-de-onus-de-imovel",
      "Confirma hipotecas, penhoras e demais ônus sobre o imóvel.",
      property
    );
    for (const party of parties.length ? parties : [fallback]) {
      add(
        "pesquisa-de-imoveis",
        `Levanta outros imóveis em nome de ${party.displayName}.`,
        party
      );
      add(
        "certidao-de-protesto",
        `Protesto em nome de ${party.displayName} — risco de crédito na transação.`,
        party
      );
      if (purpose === "FINANCIAMENTO") {
        add(
          "certidao-negativa-de-propriedade-imovel",
          `Negativa de propriedade em nome de ${party.displayName}, comum em financiamento.`,
          party
        );
      }
      if (party.kind === "COMPANY") {
        add(
          "trt-certidao-de-acoes-trabalhistas-ceat",
          `Passivo trabalhista da ${party.displayName}.`,
          party
        );
        add(
          "trf-certidao-de-distribuicao-da-justica-federal",
          `Distribuição federal da ${party.displayName}.`,
          party
        );
      }
    }
    if (rural) {
      add(
        "ccir-certificado-cadastro-imovel-rural-incra",
        "CCIR do imóvel rural — regularidade cadastral no INCRA.",
        rural
      );
    }
    return specs;
  }

  if (purpose === "INVENTARIO") {
    const person = firstOf(subjects, "PERSON") || fallback;
    add(
      "certidao-de-obito",
      "Abre o inventário e comprova o falecimento.",
      person
    );
    add(
      "consulta-de-inventario",
      "Verifica se já existe inventário em cartório de notas.",
      person
    );
    add(
      "certidao-de-inventario",
      "Documento do inventário, quando já lavrado.",
      person
    );
    add(
      "certidao-negativa-de-testamento",
      "Confirma se há testamento registrado.",
      person
    );
    if (urban || rural) {
      add(
        "certidao-de-matricula-de-imovel",
        "Matrícula dos bens imóveis que entram na partilha.",
        property
      );
    }
    return specs;
  }

  if (purpose === "DUE_DILIGENCE_SOCIETARIA") {
    for (const party of parties.length ? parties : [fallback]) {
      add(
        "pesquisa-de-protesto",
        `Mapeia cartórios de protesto em nome de ${party.displayName}.`,
        party
      );
      add(
        "certidao-de-protesto",
        `Certidão de protesto de ${party.displayName}.`,
        party
      );
      add(
        "pesquisa-de-imoveis",
        `Bens imóveis em nome de ${party.displayName}.`,
        party
      );
      if (party.kind === "COMPANY") {
        add(
          "trt-certidao-de-acoes-trabalhistas-ceat",
          `Ações trabalhistas da ${party.displayName}.`,
          party
        );
        add(
          "trf-certidao-de-distribuicao-da-justica-federal",
          `Distribuição federal da ${party.displayName}.`,
          party
        );
      }
    }
    return specs;
  }

  if (purpose === "PROCESSO") {
    const target = lawsuit || parties[0] || fallback;
    add(
      "trf-certidao-de-distribuicao-da-justica-federal",
      "Distribuição na Justiça Federal ligada ao caso.",
      target
    );
    for (const party of parties) {
      add(
        "certidao-de-protesto",
        `Protesto da parte ${party.displayName}.`,
        party
      );
    }
    return specs;
  }

  for (const party of parties.length ? parties : [fallback]) {
    add(
      "certidao-de-protesto",
      `Ponto de partida documental para ${party.displayName}.`,
      party
    );
  }
  if (urban || rural) {
    add(
      "certidao-de-matricula-de-imovel",
      "Matrícula do imóvel informado neste dossiê.",
      property
    );
  }
  return specs;
}

export async function recommendCertificates(
  dossier: Pick<PublicDossier, "purpose" | "subjects">
): Promise<PublicCertificateRecommendation[]> {
  const seen = new Set<string>();
  const recommendations: PublicCertificateRecommendation[] = [];

  for (const spec of specsForPurpose(dossier.purpose, dossier.subjects)) {
    const key = `${spec.slug}:${spec.subject.id}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const product = await getProductBySlug(spec.slug);
    if (!product) continue;
    recommendations.push({
      slug: product.slug,
      name: product.name,
      shortDescription: product.shortDescription,
      categoryName: product.categoryName,
      estimatedDays: product.estimatedDays,
      basePrice: product.basePrice,
      reason: spec.reason,
      subjectId: spec.subject.id,
      subjectName: spec.subject.displayName,
    });
  }

  return recommendations;
}
