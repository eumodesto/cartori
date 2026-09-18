-- Mesa operacional: thread do pedido, arquivos (Supabase Storage) e e-mail outbox.
-- Autorização continua na aplicação. Data API fechada (REVOKE + RLS deny-all).

ALTER TYPE "OrderStatus" ADD VALUE IF NOT EXISTS 'WAITING_CUSTOMER';

CREATE TYPE "CaseAuthorKind" AS ENUM ('CLIENT', 'STAFF', 'SYSTEM');
CREATE TYPE "CaseAttachmentKind" AS ENUM ('RG', 'CNH', 'CERTIDAO', 'COMPROVANTE', 'RESIDENCIA', 'OTHER');
CREATE TYPE "CaseEventType" AS ENUM ('STATUS_CHANGED', 'MESSAGE_POSTED', 'ATTACHMENT_UPLOADED');
CREATE TYPE "EmailOutboxStatus" AS ENUM ('PENDING', 'SENT', 'FAILED');

CREATE TABLE "CaseMessage" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "authorUserId" TEXT,
    "authorKind" "CaseAuthorKind" NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CaseMessage_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CaseAttachment" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "messageId" TEXT,
    "uploadedByUserId" TEXT,
    "kind" "CaseAttachmentKind" NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "storagePath" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CaseAttachment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CaseEvent" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "actorUserId" TEXT,
    "type" "CaseEventType" NOT NULL,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CaseEvent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "EmailOutbox" (
    "id" TEXT NOT NULL,
    "orderId" TEXT,
    "toEmail" TEXT NOT NULL,
    "toUserId" TEXT,
    "template" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "status" "EmailOutboxStatus" NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailOutbox_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "CaseMessage_orderId_createdAt_idx" ON "CaseMessage"("orderId", "createdAt");
CREATE INDEX "CaseAttachment_orderId_createdAt_idx" ON "CaseAttachment"("orderId", "createdAt");
CREATE UNIQUE INDEX "CaseAttachment_storagePath_key" ON "CaseAttachment"("storagePath");
CREATE INDEX "CaseEvent_orderId_createdAt_idx" ON "CaseEvent"("orderId", "createdAt");
CREATE INDEX "EmailOutbox_status_createdAt_idx" ON "EmailOutbox"("status", "createdAt");
CREATE INDEX "EmailOutbox_orderId_idx" ON "EmailOutbox"("orderId");

ALTER TABLE "CaseMessage" ADD CONSTRAINT "CaseMessage_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CaseMessage" ADD CONSTRAINT "CaseMessage_authorUserId_fkey" FOREIGN KEY ("authorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CaseAttachment" ADD CONSTRAINT "CaseAttachment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CaseAttachment" ADD CONSTRAINT "CaseAttachment_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "CaseMessage"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CaseAttachment" ADD CONSTRAINT "CaseAttachment_uploadedByUserId_fkey" FOREIGN KEY ("uploadedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CaseEvent" ADD CONSTRAINT "CaseEvent_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EmailOutbox" ADD CONSTRAINT "EmailOutbox_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

DO $$
DECLARE
  t text;
  tables text[] := ARRAY['CaseMessage', 'CaseAttachment', 'CaseEvent', 'EmailOutbox'];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format('REVOKE ALL ON TABLE %I.%I FROM anon, authenticated, PUBLIC', 'public', t);
    EXECUTE format('ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY', 'public', t);
  END LOOP;
END $$;

-- Bucket privado no Storage do Supabase (S3-compatible). Sem policy = cliente
-- não lê/escreve direto; a API emite signed URL depois de requireAuth.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'storage') THEN
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES (
      'case-files',
      'case-files',
      false,
      15728640,
      ARRAY[
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/webp'
      ]
    )
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;
