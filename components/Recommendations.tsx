"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import type { LinkedInRecommendation } from "@/data/recommendations";
import { profile } from "@/data/portfolio";

type Payload = {
  ok: boolean;
  items: LinkedInRecommendation[];
  linkedinProfile?: string;
};

export function Recommendations() {
  const [items, setItems] = useState<LinkedInRecommendation[]>([]);
  const [linkedinUrl, setLinkedinUrl] = useState(
    `${profile.linkedin}/details/recommendations/`,
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/linkedin-recommendations");
        const data = (await res.json()) as Payload;
        if (cancelled) return;
        setItems(data.items ?? []);
        if (data.linkedinProfile) setLinkedinUrl(data.linkedinProfile);
      } catch {
        if (!cancelled) setItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section id="recommendations" className="mt-24">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"
      >
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Recommendations
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-zinc-400 sm:text-base">
            What colleagues and clients say on LinkedIn.
          </p>
        </div>
        <a
          href={linkedinUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center gap-2 text-sm font-medium text-cyan-400 hover:text-cyan-300"
        >
          View on LinkedIn
          <span aria-hidden>→</span>
        </a>
      </motion.div>

      {loading ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {[0, 1].map((i) => (
            <div
              key={i}
              className="h-40 animate-pulse rounded-2xl border border-white/10 bg-white/[0.04]"
            />
          ))}
        </div>
      ) : items.length > 0 ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {items.map((rec, i) => (
            <motion.blockquote
              key={`${rec.name}-${i}`}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
              className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-md"
            >
              <p className="flex-1 text-sm leading-relaxed text-zinc-300 sm:text-base">
                &ldquo;{rec.text}&rdquo;
              </p>
              <footer className="mt-5 border-t border-white/5 pt-4">
                <p className="font-semibold text-white">{rec.name}</p>
                <p className="text-sm text-zinc-500">
                  {[rec.role, rec.company].filter(Boolean).join(" · ")}
                </p>
                {rec.relationship ? (
                  <p className="mt-1 text-xs text-zinc-600">{rec.relationship}</p>
                ) : null}
              </footer>
            </motion.blockquote>
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-8 rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-8 text-center sm:p-10"
        >
          <p className="text-sm text-zinc-400 sm:text-base">
            Recommendations on LinkedIn are only visible when you are signed in,
            so they cannot be loaded automatically on this site. Use the button
            below to read them on LinkedIn.
          </p>
          <a
            href={linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Open LinkedIn recommendations
          </a>
        </motion.div>
      )}
    </section>
  );
}
