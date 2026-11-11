"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import type { ProjectKind, PublishedProject } from "@/data/portfolio";

type StorePayload = {
  ok: boolean;
  name?: string | null;
  description?: string | null;
  images?: string[];
  imageUrl?: string | null;
};

type LoadState =
  | { status: "loading" }
  | { status: "ready"; data: StorePayload }
  | { status: "error" };

function kindLabel(kind: ProjectKind) {
  if (kind === "ios") return "App Store";
  if (kind === "android") return "Google Play";
  return "Website";
}

function AppIconFallback({ name }: { name: string }) {
  const initial = name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <div
      className="col-span-3 flex min-h-[10rem] items-center justify-center bg-gradient-to-br from-cyan-500/25 to-violet-500/25 text-2xl font-semibold text-white/90 sm:min-h-[12rem]"
      aria-hidden
    >
      {initial}
    </div>
  );
}

export function AppCard({ project }: { project: PublishedProject }) {
  const [state, setState] = useState<LoadState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    const ac = new AbortController();

    async function load() {
      setState({ status: "loading" });
      try {
        const res = await fetch(
          `/api/store-preview?url=${encodeURIComponent(project.url)}`,
          { signal: ac.signal },
        );
        const data = (await res.json()) as StorePayload;
        if (cancelled) return;
        setState({ status: "ready", data });
      } catch {
        if (!cancelled) setState({ status: "error" });
      }
    }

    void load();
    return () => {
      cancelled = true;
      ac.abort();
    };
  }, [project.url]);

  if (state.status === "loading") {
    return (
      <motion.article
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] shadow-[0_20px_50px_-20px_rgba(0,0,0,0.65)] backdrop-blur-md"
      >
        <div className="grid grid-cols-3 gap-1 bg-zinc-950 p-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="aspect-[9/16] animate-pulse rounded-lg bg-white/5"
            />
          ))}
        </div>
        <div className="space-y-2 p-4">
          <div className="h-5 w-[68%] animate-pulse rounded bg-white/10" />
          <div className="h-3 w-full animate-pulse rounded bg-white/5" />
        </div>
      </motion.article>
    );
  }

  const loadFailed = state.status === "error";
  const data = state.status === "ready" ? state.data : null;
  const images =
    data?.images?.filter(Boolean).length && data.images
      ? data.images
      : data?.imageUrl
        ? [data.imageUrl]
        : [];

  const displayName = (data?.name?.trim() || project.name).trim();
  const description = (data?.description ?? "").trim();
  const descPreviewLen = 180;
  const descPreview =
    description.length > descPreviewLen
      ? `${description.slice(0, descPreviewLen).trim()}…`
      : description;

  const galleryImages =
    images.length >= 3
      ? images.slice(0, 3)
      : images.length > 0
        ? images
        : [];

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] shadow-[0_24px_60px_-24px_rgba(0,0,0,0.72)] backdrop-blur-md"
    >
      <div className="relative bg-zinc-950 p-1.5">
        {galleryImages.length > 0 ? (
          <div className="grid grid-cols-3 gap-1">
            {galleryImages.map((src, idx) => (
              <div
                key={`${src}-${idx}`}
                className="relative flex aspect-[9/16] items-center justify-center overflow-hidden rounded-lg bg-zinc-900"
              >
                <Image
                  src={src}
                  alt={`${displayName} screenshot ${idx + 1}`}
                  fill
                  sizes="(max-width: 640px) 33vw, 20vw"
                  className="object-cover object-top"
                  unoptimized
                />
              </div>
            ))}
          </div>
        ) : loadFailed ? (
          <div className="flex min-h-[10rem] flex-col items-center justify-center gap-2 px-4 py-8 text-center sm:min-h-[12rem]">
            <p className="text-sm text-zinc-400">Preview could not be loaded.</p>
            <p className="text-xs text-zinc-600">Use the link below to open it.</p>
          </div>
        ) : (
          <AppIconFallback name={project.name} />
        )}

        <span className="absolute left-3 top-3 rounded-full bg-black/50 px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wide text-cyan-200/95 ring-1 ring-white/10 backdrop-blur-sm">
          {kindLabel(project.kind)}
        </span>
        {images.length > 3 ? (
          <span className="absolute right-3 top-3 rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-medium text-zinc-300 ring-1 ring-white/10 backdrop-blur-sm">
            +{images.length - 3} more
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
        <div>
          <h3 className="text-base font-semibold tracking-tight text-white sm:text-lg">
            {displayName}
          </h3>
          {project.tagline ? (
            <p className="text-xs text-zinc-500 sm:text-sm">{project.tagline}</p>
          ) : null}
        </div>

        {description ? (
          <p className="text-sm leading-relaxed text-zinc-400">{descPreview}</p>
        ) : loadFailed ? null : (
          <p className="text-sm text-zinc-500">No description available.</p>
        )}

        <div className="mt-auto">
          <a
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 px-4 py-2.5 text-sm font-semibold text-zinc-950 shadow-lg shadow-cyan-500/20 transition hover:brightness-110 active:scale-[0.98]"
          >
            {project.kind === "ios" ? (
              <AppStoreGlyph className="h-4 w-4" />
            ) : project.kind === "android" ? (
              <PlayStoreGlyph className="h-4 w-4" />
            ) : (
              <WebGlyph className="h-4 w-4" />
            )}
            View more details
          </a>
        </div>
      </div>
    </motion.article>
  );
}

function AppStoreGlyph({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M16.365 1.43c0 1.14-.493 2.27-1.177 3.08-.744.9-1.99 1.57-2.987 1.57-.12 0-.23-.02-.3-.03-.01-.06-.04-.22-.04-.39 0-1.15.572-2.27 1.206-2.98.804-.94 2.142-1.64 3.248-1.68.03.13.05.28.05.43zm4.565 15.71c-.03.07-.463 1.58-1.518 3.12-.945 1.34-1.94 2.71-3.43 2.71-1.517 0-1.9-.88-3.63-.88-1.698 0-2.302.91-3.67.91-1.377 0-2.332-1.26-3.428-2.8-1.287-1.82-2.323-4.63-2.323-7.28 0-4.28 2.797-6.55 5.552-6.55 1.448 0 2.675.95 3.6.95.865 0 2.222-1.01 3.902-1.01.613 0 2.886.06 4.374 2.19-.13.09-2.383 1.37-2.383 4.19 0 3.26 2.854 4.42 2.91 4.45z" />
    </svg>
  );
}

function PlayStoreGlyph({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M8 5v14l11-7-11-7z" />
    </svg>
  );
}

function WebGlyph({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}
