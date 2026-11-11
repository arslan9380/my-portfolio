import { NextResponse } from "next/server";
import {
  extractAllAppleStoreScreenshots,
  extractAppleStoreMeta,
} from "@/lib/apple-store-details";
import {
  assertAllowedPreviewUrl,
  extractStoreImageUrl,
  isStoreUrl,
} from "@/lib/extract-store-image";
import {
  extractAppleAppId,
  inferAppleStorefront,
  lookupAppleAppDetails,
} from "@/lib/itunes-lookup";
import {
  extractPlayStoreGallery,
  extractPlayStoreMeta,
} from "@/lib/play-store-details";
import { mergeWithScreenshotCache } from "@/lib/store-screenshot-cache";
import { extractWebPreview } from "@/lib/web-preview";

const DESKTOP_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

export type StorePreviewPayload = {
  ok: boolean;
  name?: string | null;
  description?: string | null;
  /** Gallery images — screenshots when available, otherwise icon / preview. */
  images: string[];
  imageUrl?: string | null;
  source?: string;
  status?: number;
};

function cleanPlayTitle(title: string | null): string | null {
  if (!title) return null;
  return title.replace(/\s*-\s*Apps on Google Play\s*$/i, "").trim();
}

function cleanAppleTitle(title: string | null): string | null {
  if (!title) return null;
  return title.replace(/\s*on the App\s*Store\s*$/i, "").trim();
}

async function fetchHtml(
  url: string,
  retries = 2,
): Promise<{ html: string; status: number }> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const res = await fetch(url, {
      headers: {
        "User-Agent": DESKTOP_UA,
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
      next: { revalidate: 86400 },
    });

    if (res.status === 429 && attempt < retries) {
      await new Promise((resolve) => setTimeout(resolve, 800 * (attempt + 1)));
      continue;
    }

    const html = res.ok ? await res.text() : "";
    return { html, status: res.status };
  }

  return { html: "", status: 429 };
}

function isIconOnlyFallback(images: string[], iconUrl: string | null): boolean {
  if (!iconUrl || images.length !== 1) return false;
  return images[0] === iconUrl || /AppIcon|512x512bb|marketing-0/i.test(images[0]);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const raw = searchParams.get("url");
  if (!raw) {
    return NextResponse.json({ error: "Missing url" }, { status: 400 });
  }

  let target: URL;
  try {
    target = assertAllowedPreviewUrl(raw);
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  const storeUrl = target.toString();

  try {
    if (target.hostname === "apps.apple.com") {
      const appId = extractAppleAppId(target);
      const storefront = inferAppleStorefront(target);
      const { html, status } = await fetchHtml(storeUrl);
      const htmlMeta = html ? extractAppleStoreMeta(html) : { title: null, description: null };
      const htmlShots = html ? extractAllAppleStoreScreenshots(html) : [];

      let name = cleanAppleTitle(htmlMeta.title);
      let description = htmlMeta.description;
      let iconUrl: string | null = html ? extractStoreImageUrl(html) : null;
      let images = htmlShots;
      let source = htmlShots.length ? "apple-html+itunes" : "itunes-lookup";

      if (appId) {
        const details = await lookupAppleAppDetails(appId, storefront);
        if (details) {
          name = details.name;
          description = details.description || description;
          iconUrl = details.iconUrl;
          if (!images.length && details.images.length) {
            images = details.images;
            source = "itunes-lookup";
          }
        }
      }

      if (!images.length && iconUrl) {
        images = [iconUrl];
        source = "itunes-lookup";
      }

      const cached = mergeWithScreenshotCache(storeUrl, images, source);
      images = cached.images;
      source = cached.source;
      if (cached.name && !name) name = cached.name;

      if (isIconOnlyFallback(images, iconUrl)) {
        const retry = mergeWithScreenshotCache(storeUrl, [], source);
        if (retry.images.length) {
          images = retry.images;
          source = retry.source;
          if (retry.name && !name) name = retry.name;
        }
      }

      const payload: StorePreviewPayload = {
        ok: Boolean(images.length),
        name,
        description,
        images,
        imageUrl: iconUrl ?? images[0] ?? null,
        source,
        status: status >= 400 ? status : undefined,
      };
      return NextResponse.json(payload, {
        status: 200,
        headers: cacheHeaders(),
      });
    }

    if (target.hostname === "play.google.com") {
      const { html, status } = await fetchHtml(storeUrl);
      if (!html) {
        const cached = mergeWithScreenshotCache(storeUrl, [], "play-html");
        return NextResponse.json(
          {
            ok: cached.images.length > 0,
            name: cached.name ?? null,
            description: null,
            images: cached.images,
            imageUrl: cached.images[0] ?? null,
            source: cached.source,
            status,
          },
          { status: 200, headers: cacheHeaders() },
        );
      }

      const meta = extractPlayStoreMeta(html);
      const gallery = extractPlayStoreGallery(html);
      const fallbackIcon = extractStoreImageUrl(html);
      let images =
        gallery.length > 0
          ? gallery
          : fallbackIcon
            ? [fallbackIcon]
            : [];
      let source = "play-html";

      const cached = mergeWithScreenshotCache(storeUrl, images, source);
      images = cached.images;
      source = cached.source;

      const payload: StorePreviewPayload = {
        ok: images.length > 0,
        name: cleanPlayTitle(meta.title) ?? cached.name ?? null,
        description: meta.description,
        images,
        imageUrl: fallbackIcon ?? images[0] ?? null,
        source,
      };
      return NextResponse.json(payload, {
        status: 200,
        headers: cacheHeaders(),
      });
    }

    if (!isStoreUrl(target)) {
      const fetchUrl = target.protocol === "http:" ? target.toString().replace(/^http:/, "https:") : target.toString();
      const { html, status } = await fetchHtml(fetchUrl);
      if (!html) {
        return NextResponse.json(
          { ok: false, images: [], imageUrl: null, status },
          { status: 200, headers: cacheHeaders() },
        );
      }

      const web = extractWebPreview(html);
      const payload: StorePreviewPayload = {
        ok: Boolean(web.images.length || web.title),
        name: web.title,
        description: web.description,
        images: web.images,
        imageUrl: web.images[0] ?? null,
        source: "web-og",
      };
      return NextResponse.json(payload, {
        status: 200,
        headers: cacheHeaders(),
      });
    }

    return NextResponse.json(
      { ok: false, images: [], imageUrl: null },
      { status: 200, headers: cacheHeaders() },
    );
  } catch {
    const cached = mergeWithScreenshotCache(storeUrl, [], "error");
    if (cached.images.length) {
      return NextResponse.json(
        {
          ok: true,
          name: cached.name ?? null,
          description: null,
          images: cached.images,
          imageUrl: cached.images[0] ?? null,
          source: cached.source,
        },
        { status: 200, headers: cacheHeaders() },
      );
    }

    return NextResponse.json(
      { ok: false, images: [], imageUrl: null },
      { status: 200, headers: cacheHeaders() },
    );
  }
}

function cacheHeaders(): HeadersInit {
  return {
    "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
  };
}
