import fs from "node:fs";
import path from "node:path";
import PDFDocument from "pdfkit";
import {
  publishedProjects,
  profile,
  type ProjectKind,
  type PublishedProject,
} from "../data/portfolio";
import { extractAllAppleStoreScreenshots } from "../lib/apple-store-details";
import {
  extractPlayStoreGallery,
  extractPlayStoreMeta,
} from "../lib/play-store-details";
import {
  extractAppleAppId,
  inferAppleStorefront,
  lookupAppleAppDetails,
} from "../lib/itunes-lookup";
import {
  getCachedStoreScreenshots,
  mergeWithScreenshotCache,
} from "../lib/store-screenshot-cache";
import sharp from "sharp";

const DESKTOP_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN = 48;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const OUTPUT_PATH = path.join(
  process.cwd(),
  "public",
  "Muhammad_Arslan_Projects.pdf",
);

type ProjectDetails = {
  name: string;
  tagline?: string;
  kind: ProjectKind;
  url: string;
  description: string;
  images: string[];
};

function kindLabel(kind: ProjectKind): string {
  if (kind === "ios") return "App Store";
  if (kind === "android") return "Google Play";
  return "Website";
}

async function fetchHtml(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      "User-Agent": DESKTOP_UA,
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
    },
  });
  return res.ok ? await res.text() : "";
}

async function loadProjectDetails(
  project: PublishedProject,
): Promise<ProjectDetails> {
  const cached = getCachedStoreScreenshots(project.url);
  let name = cached?.name?.trim() || project.name;
  let description = "";
  let images = cached?.images?.slice(0, 3) ?? [];

  try {
    const target = new URL(project.url);
    if (target.hostname === "apps.apple.com") {
      const appId = extractAppleAppId(target);
      const storefront = inferAppleStorefront(target);
      const html = await fetchHtml(project.url);
      const htmlShots = html ? extractAllAppleStoreScreenshots(html, 8) : [];

      if (appId) {
        const details = await lookupAppleAppDetails(appId, storefront);
        if (details) {
          name = details.name || name;
          description = details.description.trim();
          if (!images.length) {
            images = (htmlShots.length ? htmlShots : details.images).slice(0, 3);
          }
        }
      }

      if (!images.length && htmlShots.length) {
        images = htmlShots.slice(0, 3);
      }

      const merged = mergeWithScreenshotCache(project.url, images, "apple-html");
      images = merged.images.slice(0, 3);
      if (merged.name && !name) name = merged.name;
    } else if (target.hostname === "play.google.com") {
      const html = await fetchHtml(project.url);
      if (html) {
        const meta = extractPlayStoreMeta(html);
        name =
          meta.title?.replace(/\s*-\s*Apps on Google Play\s*$/i, "").trim() ||
          name;
        description = (meta.description ?? "").trim();
        if (!images.length) {
          images = extractPlayStoreGallery(html, 8).slice(0, 3);
        }
      }

      const merged = mergeWithScreenshotCache(project.url, images, "play-html");
      images = merged.images.slice(0, 3);
      if (merged.name && !name) name = merged.name;
    }
  } catch {
    // Fall back to portfolio data and cache.
  }

  return {
    name,
    tagline: project.tagline,
    kind: project.kind,
    url: project.url,
    description,
    images,
  };
}

function pdfSafeImageUrl(url: string): string {
  if (/\.webp(?:\?|$)/i.test(url)) {
    return url.replace(/\.webp(\?|$)/i, ".jpg$1");
  }
  return url;
}

async function fetchImageBuffer(url: string): Promise<Buffer | null> {
  const candidates = [pdfSafeImageUrl(url), url].filter(
    (value, index, list) => list.indexOf(value) === index,
  );

  for (const candidate of candidates) {
    try {
      const res = await fetch(candidate, {
        headers: { "User-Agent": DESKTOP_UA },
      });
      if (!res.ok) continue;
      const raw = Buffer.from(await res.arrayBuffer());
      return sharp(raw).jpeg({ quality: 88 }).toBuffer();
    } catch {
      continue;
    }
  }

  return null;
}

function truncate(text: string, max: number): string {
  const trimmed = text.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1).trim()}…`;
}

type PdfDoc = InstanceType<typeof PDFDocument>;

function ensureSpace(
  doc: PdfDoc,
  needed: number,
  onNewPage?: () => void,
): void {
  if (doc.y + needed <= PAGE_HEIGHT - MARGIN) return;
  doc.addPage();
  onNewPage?.();
}

async function renderProject(
  doc: PdfDoc,
  project: ProjectDetails,
  index: number,
): Promise<void> {
  const cardTop = doc.y;
  const screenshotGap = 10;
  const screenshotWidth = (CONTENT_WIDTH - screenshotGap * 2) / 3;
  const screenshotHeight = screenshotWidth * (16 / 9);
  const estimatedHeight = 28 + 18 + 70 + screenshotHeight + 24;

  ensureSpace(doc, estimatedHeight);

  if (index > 0) {
    doc
      .moveTo(MARGIN, doc.y)
      .lineTo(PAGE_WIDTH - MARGIN, doc.y)
      .strokeColor("#e4e4e7")
      .lineWidth(0.75)
      .stroke();
    doc.moveDown(0.8);
  }

  doc
    .font("Helvetica-Bold")
    .fontSize(15)
    .fillColor("#18181b")
    .text(project.name, MARGIN, doc.y, { width: CONTENT_WIDTH });

  const meta = [
    project.tagline,
    kindLabel(project.kind),
  ]
    .filter(Boolean)
    .join(" · ");

  doc
    .font("Helvetica")
    .fontSize(10)
    .fillColor("#71717a")
    .text(meta, MARGIN, doc.y + 2, { width: CONTENT_WIDTH });

  doc.moveDown(0.35);

  if (project.description) {
    doc
      .font("Helvetica")
      .fontSize(9.5)
      .fillColor("#3f3f46")
      .text(truncate(project.description, 420), MARGIN, doc.y, {
        width: CONTENT_WIDTH,
        lineGap: 2,
      });
    doc.moveDown(0.45);
  }

  const imageY = doc.y;
  const shotUrls = project.images.slice(0, 3);
  const buffers = await Promise.all(shotUrls.map(fetchImageBuffer));
  const count = Math.min(shotUrls.length, 3);
  const slotWidth =
    count > 0 ? (CONTENT_WIDTH - screenshotGap * (count - 1)) / count : screenshotWidth;

  for (let i = 0; i < count; i++) {
    const x = MARGIN + i * (slotWidth + screenshotGap);
    const buffer = buffers[i];

    doc
      .roundedRect(x, imageY, slotWidth, screenshotHeight, 6)
      .fillColor("#f4f4f5")
      .fill();

    if (buffer) {
      try {
        doc.image(buffer, x, imageY, {
          fit: [slotWidth, screenshotHeight],
          align: "center",
          valign: "center",
        });
        doc
          .roundedRect(x, imageY, slotWidth, screenshotHeight, 6)
          .strokeColor("#e4e4e7")
          .lineWidth(0.75)
          .stroke();
      } catch {
        // Skip screenshots pdfkit cannot decode.
      }
    }
  }

  if (count > 0) {
    doc.y = imageY + screenshotHeight + 10;
  }

  doc
    .font("Helvetica")
    .fontSize(9)
    .fillColor("#0891b2")
    .text(project.url, MARGIN, doc.y, {
      width: CONTENT_WIDTH,
      link: project.url,
      underline: true,
    });

  doc.y = Math.max(doc.y, cardTop + estimatedHeight - 10);
  doc.moveDown(0.6);
}

async function generateProjectsPdf(): Promise<void> {
  const projects = await Promise.all(
    publishedProjects.map((project) => loadProjectDetails(project)),
  );

  await new Promise<void>((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margins: { top: MARGIN, bottom: MARGIN, left: MARGIN, right: MARGIN },
      info: {
        Title: "Projects & Published Apps",
        Author: profile.name,
        Subject: "Portfolio projects",
      },
    });

    const stream = fs.createWriteStream(OUTPUT_PATH);
    doc.pipe(stream);

    doc
      .font("Helvetica-Bold")
      .fontSize(24)
      .fillColor("#18181b")
      .text("Projects & published apps", MARGIN, MARGIN, {
        width: CONTENT_WIDTH,
      });

    doc
      .font("Helvetica")
      .fontSize(11)
      .fillColor("#52525b")
      .text(profile.name, MARGIN, doc.y + 4, { width: CONTENT_WIDTH });

    doc
      .font("Helvetica")
      .fontSize(10)
      .fillColor("#71717a")
      .text(
        "Live store listings with screenshots and links.",
        MARGIN,
        doc.y + 2,
        { width: CONTENT_WIDTH },
      );

    doc.moveDown(1.2);

    (async () => {
      try {
        for (let i = 0; i < projects.length; i++) {
          await renderProject(doc, projects[i], i);
        }
        doc.end();
      } catch (error) {
        reject(error);
      }
    })();

    stream.on("finish", () => resolve());
    stream.on("error", reject);
    doc.on("error", reject);
  });

  console.log(`Created ${OUTPUT_PATH}`);
}

generateProjectsPdf().catch((error) => {
  console.error(error);
  process.exit(1);
});
