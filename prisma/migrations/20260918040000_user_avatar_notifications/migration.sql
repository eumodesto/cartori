-- Foto de perfil e preferências de notificação por e-mail no usuário.
ALTER TABLE "User" ADD COLUMN "avatarUrl" TEXT;
ALTER TABLE "User" ADD COLUMN "notificationPrefs" JSONB;
