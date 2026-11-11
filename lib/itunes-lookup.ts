type ItunesApp = {
  trackName?: string;
  description?: string;
  screenshotUrls?: string[];
  ipadScreenshotUrls?: string[];
  artworkUrl512?: string;
  artworkUrl100?: string;
  artworkUrl60?: string;
};

export type AppleStoreDetails = {
  name: string;
  description: string;
  /** Screenshots only; icon stored separately. */
  images: string[];
  iconUrl: string;
};

type ItunesLookupResult = {
  resultCount: number;
  results: ItunesApp[];
};

/** Numeric App Store id from paths like `/us/app/name/id123456789`. */
export function extractAppleAppId(url: URL): string | null {
  const m = url.pathname.match(/\/id(\d+)/);
  return m?.[1] ?? null;
}

/** Two-letter storefront prefix from paths like `/pk/app/...`. */
export function inferAppleStorefront(url: URL): string | null {
  const m = url.pathname.match(/^\/([a-z]{2})\//i);
  return m?.[1]?.toLowerCase() ?? null;
}

function iconFromApp(app: ItunesApp): string | null {
  return app.artworkUrl512 ?? app.artworkUrl100 ?? app.artworkUrl60 ?? null;
}

function buildAppleScreenshots(app: ItunesApp, max = 8): string[] {
  const shots = [
    ...(app.screenshotUrls ?? []),
    ...(app.ipadScreenshotUrls ?? []),
  ];

  const out: string[] = [];
  const seen = new Set<string>();

  for (const s of shots) {
    if (!s?.startsWith("http")) continue;
    const key = s.split("?")[0];
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(s);
  }

  return out.slice(0, max);
}

export async function lookupAppleAppDetails(
  appId: string,
  storefrontHint: string | null,
): Promise<AppleStoreDetails | null> {
  const countries = [
    storefrontHint,
    "us",
    "pk",
    "gb",
    "za",
    "ae",
    "sa",
    "in",
    "au",
  ].filter((c): c is string => Boolean(c));

  const unique = [...new Set(countries)];

  for (const country of unique) {
    const lookupUrl = `https://itunes.apple.com/lookup?id=${appId}&country=${country}`;
    try {
      const res = await fetch(lookupUrl, {
        headers: { Accept: "application/json" },
        next: { revalidate: 86400 },
      });
      if (!res.ok) continue;
      const data = (await res.json()) as ItunesLookupResult;
      const app = data.results?.[0];
      if (!app?.trackName) continue;

      const iconUrl = iconFromApp(app);
      if (!iconUrl) continue;

      const description = (app.description ?? "").trim();
      const images = buildAppleScreenshots(app);

      return {
        name: app.trackName,
        description,
        iconUrl,
        images,
      };
    } catch {
      continue;
    }
  }

  return null;
}
