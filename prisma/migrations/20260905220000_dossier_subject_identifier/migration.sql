-- CreateEnum
CREATE TYPE "DossierPurpose" AS ENUM ('COMPRA_IMOVEL', 'FINANCIAMENTO', 'INVENTARIO', 'DUE_DILIGENCE_SOCIETARIA', 'PROCESSO', 'OUTRO');

-- CreateEnum
CREATE TYPE "DossierStatus" AS ENUM ('DRAFT', 'RUNNING', 'PARTIAL', 'READY', 'EXPIRED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "SubjectKind" AS ENUM ('PERSON', 'COMPANY', 'URBAN_PROPERTY', 'RURAL_PROPERTY', 'LAWSUIT');

-- CreateEnum
CREATE TYPE "IdentifierKind" AS ENUM ('CPF', 'CNPJ', 'MATRICULA', 'CAR', 'NIRF', 'PROCESSO_CNJ', 'OTHER');

-- CreateTable
CREATE TABLE "Dossier" (
    "id" TEXT NOT NULL,
    "seq" INTEGER NOT NULL,
    "protocol" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "organizationId" TEXT,
    "title" TEXT NOT NULL,
    "purpose" "DossierPurpose" NOT NULL,
    "purposeNote" TEXT,
    "status" "DossierStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Dossier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DossierSubject" (
    "id" TEXT NOT NULL,
    "dossierId" TEXT NOT NULL,
    "kind" "SubjectKind" NOT NULL,
    "displayName" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DossierSubject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubjectIdentifier" (
    "id" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "kind" "IdentifierKind" NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubjectIdentifier_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Dossier_seq_key" ON "Dossier"("seq");

-- CreateIndex
CREATE UNIQUE INDEX "Dossier_protocol_key" ON "Dossier"("protocol");

-- CreateIndex
CREATE INDEX "Dossier_userId_createdAt_idx" ON "Dossier"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Dossier_status_idx" ON "Dossier"("status");

-- CreateIndex
CREATE INDEX "DossierSubject_dossierId_idx" ON "DossierSubject"("dossierId");

-- CreateIndex
CREATE UNIQUE INDEX "SubjectIdentifier_subjectId_kind_value_key" ON "SubjectIdentifier"("subjectId", "kind", "value");

-- CreateIndex
CREATE INDEX "SubjectIdentifier_subjectId_idx" ON "SubjectIdentifier"("subjectId");

-- AddForeignKey
ALTER TABLE "Dossier" ADD CONSTRAINT "Dossier_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dossier" ADD CONSTRAINT "Dossier_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DossierSubject" ADD CONSTRAINT "DossierSubject_dossierId_fkey" FOREIGN KEY ("dossierId") REFERENCES "Dossier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubjectIdentifier" ADD CONSTRAINT "SubjectIdentifier_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "DossierSubject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
