import { createAdminSupabase } from "@/lib/supabase/admin";
import { CASE_MAX_FILE_BYTES } from "@/lib/case-types";

export const CASE_FILES_BUCKET = "case-files";

function storageClient() {
  const admin = createAdminSupabase();
  if (!admin) {
    throw new Error("Supabase Storage não está configurado.");
  }
  return admin.storage.from(CASE_FILES_BUCKET);
}

export async function createCaseUploadUrl(storagePath: string) {
  const { data, error } = await storageClient().createSignedUploadUrl(storagePath);
  if (error || !data?.signedUrl) {
    throw new Error(error?.message || "Não foi possível abrir o envio do arquivo.");
  }
  return { signedUrl: data.signedUrl, token: data.token, path: data.path };
}

export async function createCaseDownloadUrl(storagePath: string, expiresIn = 60) {
  const { data, error } = await storageClient().createSignedUrl(storagePath, expiresIn);
  if (error || !data?.signedUrl) {
    throw new Error(error?.message || "Não foi possível abrir o arquivo.");
  }
  return data.signedUrl;
}

export function assertCaseFileLimits(sizeBytes: number) {
  if (!Number.isFinite(sizeBytes) || sizeBytes <= 0) {
    return "Arquivo inválido.";
  }
  if (sizeBytes > CASE_MAX_FILE_BYTES) {
    return "O arquivo pode ter no máximo 15 MB.";
  }
  return null;
}
