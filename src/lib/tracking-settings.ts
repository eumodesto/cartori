import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  EMPTY_TRACKING_CONFIG,
  parseStoredTracking,
  type TrackingConfig,
} from "@/lib/tracking";

const TRACKING_KEY = "tracking.tags";
const TRACKING_CACHE_TAG = "tracking-config";

async function readTrackingRaw(): Promise<string | null> {
  const row = await prisma.appSetting.findUnique({ where: { key: TRACKING_KEY } });
  return row?.value ?? null;
}

// Erro de banco lança dentro do cache e é tratado fora, para não ficar cacheado.
const readTrackingRawCached = unstable_cache(readTrackingRaw, [TRACKING_CACHE_TAG], {
  tags: [TRACKING_CACHE_TAG],
  revalidate: 3600,
});

/** Configuração usada pelo layout raiz (cacheada; invalidada ao salvar). */
export async function getTrackingConfig(): Promise<TrackingConfig> {
  try {
    return parseStoredTracking(await readTrackingRawCached());
  } catch {
    return { ...EMPTY_TRACKING_CONFIG };
  }
}

/** Leitura direta para o painel administrativo. */
export async function getTrackingConfigFresh(): Promise<TrackingConfig> {
  try {
    return parseStoredTracking(await readTrackingRaw());
  } catch {
    return { ...EMPTY_TRACKING_CONFIG };
  }
}

export async function saveTrackingConfig(config: TrackingConfig): Promise<void> {
  const value = JSON.stringify(config);
  await prisma.appSetting.upsert({
    where: { key: TRACKING_KEY },
    create: { key: TRACKING_KEY, value },
    update: { value },
  });
  revalidateTag(TRACKING_CACHE_TAG);
  revalidatePath("/", "layout");
}
