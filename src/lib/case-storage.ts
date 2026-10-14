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

export async function statCaseObject(storagePath: string) {
  const parts = storagePath.split("/").filter(Boolean);
  const name = parts.pop();
  if (!name || parts.length === 0) return null;
  const { data, error } = await storageClient().list(parts.join("/"), {
    limit: 20,
    search: name,
  });
  if (error || !data) return null;
  const file = data.find((item) => item.name === name);
  if (!file) return null;
  const metadata = (file.metadata || {}) as {
    size?: number;
    contentLength?: number;
    mimetype?: string;
  };
  const size = Number(metadata.size ?? metadata.contentLength);
  return {
    size: Number.isFinite(size) ? size : 0,
    mimeType: typeof metadata.mimetype === "string" ? metadata.mimetype.toLowerCase() : "",
  };
}

export async function removeCaseObject(storagePath: string) {
  await storageClient().remove([storagePath]);
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
