import { createAdminSupabase } from "@/lib/supabase/admin";

export const AVATARS_BUCKET = "avatars";

export const AVATAR_MAX_BYTES = 2 * 1024 * 1024; // 2 MB
export const AVATAR_CONTENT_TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

/**
 * Sobe o avatar para o bucket público "avatars" via service role e devolve a URL pública.
 * Requer o bucket "avatars" (público) criado no Supabase Storage.
 */
export async function uploadAvatar(
  userId: string,
  data: ArrayBuffer | Uint8Array,
  contentType: string
): Promise<string> {
  const ext = AVATAR_CONTENT_TYPES[contentType];
  if (!ext) throw new Error("Formato de imagem não suportado (use PNG, JPG ou WEBP).");

  const admin = createAdminSupabase();
  if (!admin) throw new Error("Supabase Storage não está configurado.");

  // Garante o bucket público "avatars" (auto-provisiona no primeiro upload).
  const { data: bucket } = await admin.storage.getBucket(AVATARS_BUCKET);
  if (!bucket) {
    await admin.storage.createBucket(AVATARS_BUCKET, {
      public: true,
      fileSizeLimit: AVATAR_MAX_BYTES,
      allowedMimeTypes: Object.keys(AVATAR_CONTENT_TYPES),
    });
  }

  const path = `${userId}/avatar.${ext}`;
  const body = data instanceof Uint8Array ? data : new Uint8Array(data);
  const { error } = await admin.storage
    .from(AVATARS_BUCKET)
    .upload(path, body, { contentType, upsert: true });
  if (error) throw new Error(error.message);

  const { data: pub } = admin.storage.from(AVATARS_BUCKET).getPublicUrl(path);
  // cache-busting para a UI refletir a troca imediatamente
  return `${pub.publicUrl}?v=${Date.now()}`;
}
