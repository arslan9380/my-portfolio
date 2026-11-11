/**
 * Best-effort extraction of a preview image from App Store / Play Store HTML.
 */

function decodeEntities(url: string): string {
  return url
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'");
}

export function extractStoreImageUrl(html: string): string | null {
  const patterns: RegExp[] = [
    /<meta\s+property="og:image"\s+content="([^"]+)"/i,
    /<meta\s+content="([^"]+)"\s+property="og:image"/i,
    /<meta\s+name="twitter:image"\s+content="([^"]+)"/i,
    /<meta\s+content="([^"]+)"\s+name="twitter:image"/i,
    /<meta\s+itemprop="image"\s+content="([^"]+)"/i,
    /<meta\s+content="([^"]+)"\s+itemprop="image"/i,
  ];

  for (const re of patterns) {
    const m = html.match(re);
    if (m?.[1]) {
      const raw = m[1].trim();
      if (raw.startsWith("http")) return decodeEntities(raw);
    }
  }

  // Play Store sometimes embeds icon in JSON-LD
  const ld = html.match(
    /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/i,
  );
  if (ld?.[1]) {
    try {
      const data = JSON.parse(ld[1]) as { image?: string | string[] };
      const img = Array.isArray(data.image) ? data.image[0] : data.image;
      if (typeof img === "string" && img.startsWith("http")) return img;
    } catch {
      /* ignore */
    }
  }

  return null;
}

const STORE_HOSTS = new Set([
  "apps.apple.com",
  "play.google.com",
  "itunes.apple.com",
]);

const BLOCKED_HOSTS = new Set([
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
]);

export function isStoreUrl(url: URL): boolean {
  return STORE_HOSTS.has(url.hostname);
}

export function assertAllowedPreviewUrl(raw: string): URL {
  const url = new URL(raw);
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new Error("Only HTTP(S) URLs are allowed");
  }
  if (BLOCKED_HOSTS.has(url.hostname)) {
    throw new Error("URL host not allowed");
  }
  return url;
}

/** @deprecated Use assertAllowedPreviewUrl */
export function assertAllowedStoreUrl(raw: string): URL {
  const url = assertAllowedPreviewUrl(raw);
  if (!isStoreUrl(url)) {
    throw new Error("URL host not allowed");
  }
  return url;
}
