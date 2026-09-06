import {
  DossierPurpose,
  DossierStatus,
  Prisma,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { parseSubjectInput, parseSubjectsInput, type SubjectInput } from "@/lib/dossier-parse";
import {
  purposeLabel,
  type PublicDossier,
  type PublicDossierSummary,
  type PublicSubject,
} from "@/lib/dossier-types";

const dossierInclude = {
  subjects: {
    include: { identifiers: { orderBy: { createdAt: "asc" as const } } },
    orderBy: { createdAt: "asc" as const },
  },
} satisfies Prisma.DossierInclude;

type DossierRow = Prisma.DossierGetPayload<{ include: typeof dossierInclude }>;

function protocolFromSeq(seq: number) {
  return `DOS-${String(seq).padStart(6, "0")}`;
}

function toPublicSubject(row: DossierRow["subjects"][number]): PublicSubject {
  return {
    id: row.id,
    kind: row.kind,
    displayName: row.displayName,
    notes: row.notes,
    identifiers: row.identifiers.map((item) => ({
      id: item.id,
      kind: item.kind,
      value: item.value,
    })),
  };
}

function toPublicDossier(row: DossierRow): PublicDossier {
  return {
    id: row.id,
    protocol: row.protocol,
    title: row.title,
    purpose: row.purpose,
    purposeNote: row.purposeNote,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
    subjectCount: row.subjects.length,
    subjects: row.subjects.map(toPublicSubject),
  };
}

function toSummary(row: DossierRow): PublicDossierSummary {
  return {
    id: row.id,
    protocol: row.protocol,
    title: row.title,
    purpose: row.purpose,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
    subjectCount: row.subjects.length,
    primarySubject: row.subjects[0]?.displayName ?? null,
  };
}

async function nextDossierSeq() {
  const aggregate = await prisma.dossier.aggregate({ _max: { seq: true } });
  return (aggregate._max.seq ?? 0) + 1;
}

export async function listDossiersByUser(userId: string): Promise<PublicDossierSummary[]> {
  await prisma.dossier.updateMany({
    where: { userId, status: DossierStatus.DRAFT, subjects: { some: {} } },
    data: { status: DossierStatus.READY },
  });
  const rows = await prisma.dossier.findMany({
    where: { userId },
    include: dossierInclude,
    orderBy: { createdAt: "desc" },
  });
  return rows.map(toSummary);
}

export async function getOwnedDossier(
  id: string,
  userId: string
): Promise<PublicDossier | null> {
  const row = await prisma.dossier.findFirst({
    where: { id, userId },
    include: dossierInclude,
  });
  if (!row) return null;
  if (row.status === DossierStatus.DRAFT && row.subjects.length > 0) {
    const updated = await prisma.dossier.update({
      where: { id: row.id },
      data: { status: DossierStatus.READY },
      include: dossierInclude,
    });
    return toPublicDossier(updated);
  }
  return toPublicDossier(row);
}

export async function createDossier(input: {
  userId: string;
  organizationId: string | null;
  title?: string;
  purpose: DossierPurpose;
  purposeNote?: string | null;
  subjects: SubjectInput[];
}): Promise<PublicDossier> {
  const seq = await nextDossierSeq();
  const protocol = protocolFromSeq(seq);
  const firstName = input.subjects[0]?.displayName;
  const title =
    String(input.title || "").trim() ||
    `${purposeLabel(input.purpose)}${firstName ? ` — ${firstName}` : ""}`;

  const row = await prisma.$transaction(async (tx) => {
    const dossier = await tx.dossier.create({
      data: {
        seq,
        protocol,
        userId: input.userId,
        organizationId: input.organizationId,
        title: title.slice(0, 180),
        purpose: input.purpose,
        purposeNote: input.purposeNote,
        status: DossierStatus.READY,
        subjects: {
          create: input.subjects.map((subject) => ({
            kind: subject.kind,
            displayName: subject.displayName,
            notes: subject.notes,
            identifiers: {
              create: subject.identifiers.map((identifier) => ({
                kind: identifier.kind,
                value: identifier.value,
              })),
            },
          })),
        },
      },
      include: dossierInclude,
    });
    return dossier;
  });

  return toPublicDossier(row);
}

export async function addSubjectToOwnedDossier(input: {
  dossierId: string;
  userId: string;
  subject: SubjectInput;
}): Promise<PublicDossier | null> {
  const existing = await prisma.dossier.findFirst({
    where: { id: input.dossierId, userId: input.userId },
    select: { id: true, _count: { select: { subjects: true } } },
  });
  if (!existing) return null;
  if (existing._count.subjects >= 12) {
    throw new Error("Limite de 12 sujeitos por dossiê nesta etapa.");
  }

  await prisma.dossierSubject.create({
    data: {
      dossierId: input.dossierId,
      kind: input.subject.kind,
      displayName: input.subject.displayName,
      notes: input.subject.notes,
      identifiers: {
        create: input.subject.identifiers.map((identifier) => ({
          kind: identifier.kind,
          value: identifier.value,
        })),
      },
    },
  });

  await prisma.dossier.update({
    where: { id: input.dossierId },
    data: { status: DossierStatus.READY },
  });

  return getOwnedDossier(input.dossierId, input.userId);
}

export { parseSubjectInput, parseSubjectsInput };
