import { extractStoreImageUrl } from "@/lib/extract-store-image";

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
}

export function extractPlayStoreMeta(html: string): {
  title: string | null;
  description: string | null;
} {
  const ogTitle =
    html.match(/property="og:title"\s+content="([^"]+)"/i)?.[1] ??
    html.match(/content="([^"]+)"\s+property="og:title"/i)?.[1];
  const ogDesc =
    html.match(/property="og:description"\s+content="([^"]+)"/i)?.[1] ??
    html.match(/content="([^"]+)"\s+property="og:description"/i)?.[1];
  const title = ogTitle ? decodeHtmlEntities(ogTitle.trim()) : null;
  const description = ogDesc ? decodeHtmlEntities(ogDesc.trim()) : null;
  return { title, description };
}

function upscalePlayImageUrl(u: string): string {
  return u
    .replace(/=w526-h296\b/i, "=w1052-h592")
    .replace(/=w240-h480\b/i, "=w480-h960")
    .replace(/=w480-h960-rw\b/i, "=w480-h960");
}

function playDimensionScore(u: string): number {
  const m = u.match(/=w(\d+)-h(\d+)/i);
  return m ? Number(m[1]) * Number(m[2]) : 0;
}

function isPlayScreenshotUrl(u: string): boolean {
  const m = u.match(/=w(\d+)-h(\d+)/i);
  if (!m) return false;
  const w = Number(m[1]);
  const h = Number(m[2]);
  const area = w * h;

  if (/=w48-h|=w96-h|=w600-h300/i.test(u)) return false;

  if (w >= 240 && h >= 400 && h > w) return true;
  if (w >= 500 && h >= 250 && w > h && area >= 130_000) return true;
  return false;
}

/** Play Store screenshots (portrait and wide carousel images). */
export function extractPlayStoreScreenshots(html: string, max = 8): string[] {
  const re = /https:\/\/play-lh\.googleusercontent\.com\/[^"'\\<>\s)]+/g;
  const raw = html.match(re) ?? [];
  const normalized = raw.map((u) =>
    upscalePlayImageUrl(u.replace(/\\u003d/g, "=").trim()),
  );

  const baseKey = (u: string) => {
    const i = u.indexOf("=");
    return i === -1 ? u : u.slice(0, i);
  };

  const bestByBase = new Map<string, string>();
  for (const u of normalized) {
    if (!isPlayScreenshotUrl(u)) continue;
    const key = baseKey(u);
    const prev = bestByBase.get(key);
    if (!prev || playDimensionScore(u) > playDimensionScore(prev)) {
      bestByBase.set(key, u);
    }
  }

  const portrait = [...bestByBase.values()].filter((u) => {
    const m = u.match(/=w(\d+)-h(\d+)/i);
    return m && Number(m[2]) > Number(m[1]);
  });
  const landscape = [...bestByBase.values()].filter((u) => {
    const m = u.match(/=w(\d+)-h(\d+)/i);
    return m && Number(m[1]) > Number(m[2]);
  });

  const ordered =
    portrait.length >= 3
      ? portrait
      : [...portrait, ...landscape.filter((u) => !portrait.includes(u))];

  return ordered
    .sort((a, b) => playDimensionScore(b) - playDimensionScore(a))
    .slice(0, max);
}

/** Screenshots for Play listings; falls back to app icon. */
export function extractPlayStoreGallery(html: string, max = 8): string[] {
  const shots = extractPlayStoreScreenshots(html, max);
  if (shots.length) return shots;
  const icon = extractStoreImageUrl(html);
  return icon ? [icon] : [];
}
