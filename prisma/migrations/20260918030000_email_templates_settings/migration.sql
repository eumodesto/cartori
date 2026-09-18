-- Templates de e-mail editáveis + configuração da aplicação (integração Resend).
-- Padrão Etapa 0: tabelas novas no schema public NÃO recebem GRANT para anon/authenticated
-- (ALTER DEFAULT PRIVILEGES já revogado). Acesso ao dado = Prisma/service_role, nunca Data API.

CREATE TABLE "EmailTemplate" (
  "key"       TEXT NOT NULL,
  "subject"   TEXT NOT NULL,
  "body"      TEXT NOT NULL,
  "active"    BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "EmailTemplate_pkey" PRIMARY KEY ("key")
);

CREATE TABLE "AppSetting" (
  "key"       TEXT NOT NULL,
  "value"     TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AppSetting_pkey" PRIMARY KEY ("key")
);
