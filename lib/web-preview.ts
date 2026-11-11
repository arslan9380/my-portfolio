function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
}

function metaContent(html: string, key: string): string | null {
  const patterns = [
    new RegExp(`property="${key}"\\s+content="([^"]+)"`, "i"),
    new RegExp(`content="([^"]+)"\\s+property="${key}"`, "i"),
    new RegExp(`name="${key}"\\s+content="([^"]+)"`, "i"),
    new RegExp(`content="([^"]+)"\\s+name="${key}"`, "i"),
  ];
  for (const re of patterns) {
    const m = html.match(re);
    if (m?.[1]) return decodeHtmlEntities(m[1].trim());
  }
  return null;
}

export function extractWebPreview(html: string): {
  title: string | null;
  description: string | null;
  images: string[];
} {
  const title =
    metaContent(html, "og:title") ??
    html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim() ??
    null;

  const description =
    metaContent(html, "og:description") ??
    metaContent(html, "description") ??
    null;

  const images: string[] = [];
  const seen = new Set<string>();

  for (const key of ["og:image", "twitter:image"]) {
    const img = metaContent(html, key);
    if (img?.startsWith("http") && !seen.has(img)) {
      seen.add(img);
      images.push(img);
    }
  }

  return { title, description, images };
}
