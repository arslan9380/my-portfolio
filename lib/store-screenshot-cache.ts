import screenshotCache from "@/data/store-screenshot-cache.json";

type CacheEntry = {
  name?: string;
  images: string[];
};

const cacheByUrl = screenshotCache as Record<string, CacheEntry>;

/** Normalize store URLs so cache hits survive query-string differences. */
export function normalizeStorePreviewUrl(raw: string): string {
  const url = new URL(raw);
  if (url.hostname === "play.google.com") {
    const id = url.searchParams.get("id");
    if (id) return `play:${id}`;
  }
  if (url.hostname === "apps.apple.com") {
    const id = url.pathname.match(/\/id(\d+)/)?.[1];
    if (id) return `apple:${id}`;
  }
  url.search = "";
  url.hash = "";
  return url.toString();
}

export function getCachedStoreScreenshots(raw: string): CacheEntry | null {
  const direct = cacheByUrl[raw];
  if (direct?.images?.length) return direct;

  const key = normalizeStorePreviewUrl(raw);
  for (const [cachedUrl, entry] of Object.entries(cacheByUrl)) {
    if (!entry.images?.length) continue;
    if (normalizeStorePreviewUrl(cachedUrl) === key) return entry;
  }

  return null;
}

export function mergeWithScreenshotCache(
  raw: string,
  images: string[],
  source: string,
  minScreenshots = 3,
): { images: string[]; source: string; name?: string } {
  if (images.length >= minScreenshots) {
    return { images, source };
  }

  const cached = getCachedStoreScreenshots(raw);
  if (!cached?.images.length) {
    return { images, source };
  }

  return {
    images: cached.images,
    source: images.length ? `${source}+cache` : "cache",
    name: cached.name,
  };
}
