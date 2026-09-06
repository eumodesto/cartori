import {
  canAccessOwnedDossier,
  buildAuthContext,
  orderOwnerFromContext,
} from "../src/lib/authorization-policy";
import { parseSubjectInput, parseSubjectsInput } from "../src/lib/dossier-parse";
import { AUTHORIZATION_MATRIX } from "../src/lib/authorization-matrix";

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
}

const owner = buildAuthContext({
  userId: "user-a",
  authId: "auth-a",
  platformRole: "CLIENT",
  activeMemberships: [{ organizationId: "org-a", orgRole: "OWNER" }],
});
const memberSameOrg = buildAuthContext({
  userId: "user-b",
  authId: "auth-b",
  platformRole: "CLIENT",
  activeMemberships: [{ organizationId: "org-a", orgRole: "MEMBER" }],
});

assert(canAccessOwnedDossier(owner, "user-a"), "owner reads own dossier");
assert(!canAccessOwnedDossier(owner, "user-b"), "owner denied on foreign userId");
assert(
  !canAccessOwnedDossier(memberSameOrg, "user-a"),
  "same Organization does not grant dossier access"
);
assert(!canAccessOwnedDossier(owner, null), "missing owner is deny");

const fromBody = orderOwnerFromContext(owner);
assert(fromBody.userId === "user-a", "owner comes from context, not body");
assert(fromBody.organizationId === "org-a", "organizationId is context only");

const person = parseSubjectInput({
  kind: "PERSON",
  displayName: "Maria Silva",
  identifiers: [{ kind: "CPF", value: "390.533.447-05" }],
});
assert(typeof person !== "string", `CPF válido rejeitado: ${person}`);
if (typeof person !== "string") {
  assert(person.identifiers[0]?.value === "39053344705", "CPF normalizado só dígitos");
}

assert(
  parseSubjectInput({
    kind: "PERSON",
    displayName: "Maria Silva",
    identifiers: [{ kind: "CPF", value: "111.111.111-11" }],
  }) === "CPF inválido.",
  "CPF com dígito verificador inválido"
);

assert(
  parseSubjectInput({
    kind: "PERSON",
    displayName: "Maria Silva",
    identifiers: [{ kind: "CNPJ", value: "11.222.333/0001-81" }],
  }) === "Informe o CPF da pessoa.",
  "Pessoa exige CPF"
);

const company = parseSubjectInput({
  kind: "COMPANY",
  displayName: "Cartori LTDA",
  identifiers: [{ kind: "CNPJ", value: "11.222.333/0001-81" }],
});
assert(typeof company !== "string", `CNPJ válido rejeitado: ${company}`);
if (typeof company !== "string") {
  assert(company.identifiers[0]?.value === "11222333000181", "CNPJ normalizado só dígitos");
}

assert(
  parseSubjectInput({
    kind: "COMPANY",
    displayName: "Cartori LTDA",
    identifiers: [{ kind: "CNPJ", value: "00.000.000/0000-00" }],
  }) === "CNPJ inválido.",
  "CNPJ inválido"
);

const urban = parseSubjectInput({
  kind: "URBAN_PROPERTY",
  displayName: "Rua A, 10",
  identifiers: [{ kind: "MATRICULA", value: "12345" }],
});
assert(typeof urban !== "string", `Matrícula rejeitada: ${urban}`);

assert(
  parseSubjectInput({
    kind: "URBAN_PROPERTY",
    displayName: "Rua A, 10",
    identifiers: [{ kind: "CPF", value: "390.533.447-05" }],
  }) === "Informe a matrícula do imóvel.",
  "Imóvel urbano exige matrícula"
);

const rural = parseSubjectInput({
  kind: "RURAL_PROPERTY",
  displayName: "Fazenda X",
  identifiers: [{ kind: "CAR", value: "PA-1501402-ABC123" }],
});
assert(typeof rural !== "string", `CAR rejeitado: ${rural}`);

const lawsuit = parseSubjectInput({
  kind: "LAWSUIT",
  displayName: "Ação de inventário",
  identifiers: [{ kind: "PROCESSO_CNJ", value: "0001234-56.2024.8.26.0100" }],
});
assert(typeof lawsuit !== "string", `Processo rejeitado: ${lawsuit}`);
if (typeof lawsuit !== "string") {
  assert(
    lawsuit.identifiers[0]?.value === "00012345620248260100",
    "Processo CNJ normalizado só dígitos"
  );
}

assert(
  typeof parseSubjectsInput([]) === "string",
  "dossiê sem sujeito é inválido"
);

const orgWide = AUTHORIZATION_MATRIX.find((row) =>
  row.resource.includes("listar dossiês da Organization")
);
assert(orgWide?.CLIENT === "DENY", "matriz: org não lista dossiês");

async function assertAnonymousHttp() {
  const base = process.env.CARTORI_BASE_URL || "http://127.0.0.1:3006";
  const list = await fetch(`${base}/api/dossiers`);
  assert(list.status === 401, `anônimo GET /api/dossiers → ${list.status}`);

  const detail = await fetch(
    `${base}/api/dossiers/00000000-0000-0000-0000-000000000001`
  );
  assert(detail.status === 401, `anônimo GET dossiê → ${detail.status}`);

  const create = await fetch(`${base}/api/dossiers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: "injected",
      organizationId: "injected",
      purpose: "INVENTARIO",
      subjects: [
        {
          kind: "PERSON",
          displayName: "Injeção",
          identifiers: [{ kind: "CPF", value: "390.533.447-05" }],
        },
      ],
    }),
  });
  assert(create.status === 401, `anônimo POST /api/dossiers → ${create.status}`);
}

assertAnonymousHttp()
  .then(() => {
    console.log("dossier-wave1-check: PASS");
  })
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
