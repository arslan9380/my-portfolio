function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
}

export function extractAppleStoreMeta(html: string): {
  title: string | null;
  description: string | null;
} {
  const ogTitle =
    html.match(/property="og:title"\s+content="([^"]+)"/i)?.[1] ??
    html.match(/content="([^"]+)"\s+property="og:title"/i)?.[1];
  const ogDesc =
    html.match(/property="og:description"\s+content="([^"]+)"/i)?.[1] ??
    html.match(/content="([^"]+)"\s+property="og:description"/i)?.[1];
  return {
    title: ogTitle ? decodeHtmlEntities(ogTitle.trim()) : null,
    description: ogDesc ? decodeHtmlEntities(ogDesc.trim()) : null,
  };
}

function dimensionScore(u: string): number {
  const m = u.match(/\/(\d+)x(\d+)bb/i);
  if (!m) return 0;
  return Number(m[1]) * Number(m[2]);
}

function normalizeAppleImageUrl(u: string): string | null {
  let url = u.replace(/\);$/g, "").trim();

  if (/\{w\}x\{h\}\{c\}\.\{f\}/.test(url)) {
    url = url.replace(/\{w\}x\{h\}\{c\}\.\{f\}/, "600x1300bb.webp");
  }

  if (/\{[a-z]\}/i.test(url)) return null;
  if (!/\/\d+x\d+bb/i.test(url)) return null;
  return url;
}

function isAppleJunkAsset(u: string): boolean {
  return /AppIcon|Placeholder|Features\d+|1200x630wa|marketing-0|\/Union\.png\//i.test(
    u,
  );
}

function isAppleScreenshotUrl(u: string): boolean {
  if (isAppleJunkAsset(u)) return false;

  const normalized = normalizeAppleImageUrl(u);
  if (normalized) {
    if (isAppleJunkAsset(normalized)) return false;
    return true;
  }

  if (
    /\/(Screen[-_]?\d+|Artboard_\d+|\d{2}_[A-Za-z0-9_ -]+|Screenshot|IMG_|image_\d+)\.[a-z]+/i.test(
      u,
    )
  ) {
    return !/\{[a-z]\}/i.test(u);
  }

  const m = u.match(/\/(\d+)x(\d+)bb/i);
  if (!m) return false;
  const w = Number(m[1]);
  const h = Number(m[2]);
  if (h > w && w >= 157 && h >= 300) return true;
  if (w > h && w >= 400 && h >= 280) return true;
  return false;
}

function appleAssetKey(u: string): string {
  const named = u.match(
    /\/([A-Za-z0-9][A-Za-z0-9_. -]*\.(?:jpg|jpeg|png|webp))\//i,
  )?.[1];
  if (named && !/AppIcon/i.test(named)) return named.toLowerCase();

  const idx = u.indexOf("/thumb/");
  if (idx === -1) return u;
  const rest = u.slice(idx + 7);
  const slash = rest.lastIndexOf("/");
  return slash === -1 ? rest : rest.slice(0, slash);
}

function resolveAppleTemplate(template: string, crop = "bb"): string | null {
  if (/\{[a-z]\}/i.test(template) && !/\{w\}x\{h\}\{c\}\.\{f\}/.test(template)) {
    return null;
  }

  return template.replace(/\{w\}x\{h\}\{c\}\.\{f\}/, `600x1300${crop}.webp`);
}

/** Screenshots from App Store embedded JSON (more reliable than HTML regex alone). */
export function extractAppleStoreScreenshotsFromSerialized(
  html: string,
  max = 8,
): string[] {
  const match = html.match(/id="serialized-server-data"[^>]*>([^<]+)/);
  if (!match?.[1]) return [];

  let data: unknown;
  try {
    data = JSON.parse(match[1]);
  } catch {
    return [];
  }

  const shelfMapping = (
    data as {
      data?: Array<{ data?: { shelfMapping?: Record<string, { items?: unknown[] }> } }>;
    }
  )?.data?.[0]?.data?.shelfMapping;

  if (!shelfMapping) return [];

  const items =
    shelfMapping.product_media_phone_?.items ??
    shelfMapping.product_media_iphone_?.items ??
    [];

  const urls: string[] = [];
  const seen = new Set<string>();

  for (const item of items) {
    const screenshot = (item as { screenshot?: { template?: string; crop?: string } })
      ?.screenshot;
    if (!screenshot?.template) continue;

    const resolved = resolveAppleTemplate(
      screenshot.template,
      screenshot.crop ?? "bb",
    );
    if (!resolved || !isAppleScreenshotUrl(resolved)) continue;

    const key = appleAssetKey(resolved);
    if (seen.has(key)) continue;
    seen.add(key);
    urls.push(resolved);
  }

  return urls.slice(0, max);
}

/** Screenshot URLs from App Store HTML (iTunes lookup often omits these). */
export function extractAppleStoreScreenshots(html: string, max = 8): string[] {
  const re =
    /https:\/\/is[0-9]-ssl\.mzstatic\.com\/image\/thumb\/[^"'\\<> )]+/g;
  const raw = html.match(re) ?? [];

  const bestByAsset = new Map<string, { url: string; order: number }>();
  let orderIndex = 0;

  for (const u of raw) {
    const clean = u
      .replace(/\\u002F/g, "/")
      .replace(/\\u0026/g, "&")
      .replace(/\);$/g, "");
    if (!isAppleScreenshotUrl(clean)) continue;

    const normalized = normalizeAppleImageUrl(clean);
    if (!normalized) continue;

    const key = appleAssetKey(normalized);
    const prev = bestByAsset.get(key);
    if (!prev) {
      bestByAsset.set(key, { url: normalized, order: orderIndex++ });
    } else if (dimensionScore(normalized) > dimensionScore(prev.url)) {
      bestByAsset.set(key, { url: normalized, order: prev.order });
    }
  }

  return [...bestByAsset.values()]
    .sort((a, b) => a.order - b.order)
    .map((entry) => entry.url)
    .slice(0, max);
}

/** Merge serialized JSON and HTML regex sources, preserving store order. */
export function extractAllAppleStoreScreenshots(html: string, max = 8): string[] {
  const merged: string[] = [];
  const seen = new Set<string>();

  for (const url of [
    ...extractAppleStoreScreenshotsFromSerialized(html, max),
    ...extractAppleStoreScreenshots(html, max),
  ]) {
    const key = appleAssetKey(url);
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(url);
    if (merged.length >= max) break;
  }

  return merged;
}
