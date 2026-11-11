"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  education,
  experience,
  getProfileSummary,
  getTotalExperienceLabel,
  keyFeatures,
  profile,
  publishedProjects,
} from "@/data/portfolio";
import { AppCard } from "@/components/AppCard";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export function Portfolio() {
  const experienceLabel = getTotalExperienceLabel();

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-zinc-950 text-zinc-100">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -left-1/4 top-0 h-[420px] w-[420px] rounded-full bg-cyan-500/15 blur-[120px]" />
        <div className="absolute -right-1/4 bottom-0 h-[480px] w-[480px] rounded-full bg-violet-600/15 blur-[130px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(255,255,255,0.06),transparent_55%)]" />
      </div>

      <header className="sticky top-0 z-50 border-b border-white/5 bg-zinc-950/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-3 sm:gap-4 sm:px-6">
          <Link
            href="#top"
            className="shrink-0 text-sm font-semibold tracking-tight text-white sm:text-base"
          >
            Portfolio
          </Link>

          <div className="flex items-center gap-1 sm:gap-2">
            <a
              href={`mailto:${profile.email}`}
              className="rounded-full p-2 text-zinc-400 transition hover:bg-white/5 hover:text-white"
              aria-label="Email"
              title={profile.email}
            >
              <EmailIcon className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
            </a>
            <a
              href={profile.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full p-2 text-zinc-400 transition hover:bg-white/5 hover:text-emerald-400"
              aria-label="WhatsApp"
              title="WhatsApp"
            >
              <WhatsAppIcon className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
            </a>
            <a
              href={`tel:${profile.phoneTel}`}
              className="rounded-full p-2 text-zinc-400 transition hover:bg-white/5 hover:text-cyan-400"
              aria-label={`Call ${profile.phone}`}
              title={profile.phone}
            >
              <PhoneIcon className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
            </a>
            <a
              href={profile.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full p-2 text-zinc-400 transition hover:bg-white/5 hover:text-white"
              aria-label="LinkedIn"
            >
              <LinkedInIcon className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
            </a>
            <a
              href={profile.github}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full p-2 text-zinc-400 transition hover:bg-white/5 hover:text-white"
              aria-label="GitHub"
            >
              <GitHubIcon className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
            </a>
          </div>

          <a
            href={profile.cvPath}
            download="Muhammad_Arslan_Senior_Flutter_Developer_CV.pdf"
            className="inline-flex shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-teal-500 px-3 py-2 text-xs font-semibold text-zinc-950 shadow-md shadow-cyan-500/15 transition hover:brightness-110 active:scale-[0.98] sm:px-4 sm:text-sm"
          >
            Download CV
          </a>
        </div>
      </header>

      <main id="top" className="mx-auto max-w-6xl px-4 pb-24 pt-10 sm:px-6 sm:pt-14">
        <section
          id="about"
          className="grid gap-10 lg:grid-cols-[auto_1fr] lg:items-start"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto lg:mx-0"
          >
            <div className="relative h-44 w-44 overflow-hidden rounded-3xl border border-white/10 shadow-2xl shadow-cyan-500/10 ring-2 ring-cyan-500/20 sm:h-52 sm:w-52">
              <Image
                src={profile.photoPath}
                alt={profile.name}
                fill
                sizes="(max-width: 640px) 176px, 208px"
                className="object-cover object-top"
                priority
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              {profile.name}
            </h1>
            <p className="mt-2 text-lg text-cyan-100/80 sm:text-xl">
              {profile.title}
            </p>
            <p className="mt-4 inline-flex items-center rounded-full border border-cyan-500/25 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-100 sm:text-sm">
              {experienceLabel} of professional experience
            </p>
            <p className="mt-6 max-w-2xl text-pretty text-base leading-relaxed text-zinc-400 sm:text-lg">
              {getProfileSummary()}
            </p>
            <p className="mt-4 text-sm text-zinc-500">{profile.location}</p>
          </motion.div>
        </section>

        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.12 }}
          className="mt-10 rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-transparent p-6 backdrop-blur-md sm:p-8"
        >
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
            Education
          </h2>
          <p className="mt-3 text-lg font-medium text-white">{education.degree}</p>
          <p className="mt-1 text-zinc-400">{education.school}</p>
          <p className="mt-4 text-sm text-zinc-500">
            {education.period} · {education.detail}
          </p>
        </motion.section>

        <section id="experience" className="mt-24">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Experience
            </h2>
          </motion.div>
          <div className="mt-10 space-y-6">
            {experience.map((job, i) => (
              <motion.div
                key={job.company}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
                className="relative rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-md sm:p-8"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{job.role}</h3>
                    <p className="text-cyan-300/90">{job.company}</p>
                  </div>
                  <p className="text-sm text-zinc-500 sm:text-right">{job.period}</p>
                </div>
                <p className="mt-4 max-w-3xl text-sm leading-relaxed text-zinc-400 sm:text-base">
                  {job.description}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        <section id="features" className="mt-24">
          <motion.h2
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl font-semibold tracking-tight text-white sm:text-3xl"
          >
            Key features &amp; tools
          </motion.h2>
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-40px" }}
            className="mt-8 flex flex-wrap gap-2"
          >
            {keyFeatures.map((feature) => (
              <motion.span
                key={feature}
                variants={item}
                className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3.5 py-1.5 text-xs font-medium text-cyan-100 sm:text-sm"
              >
                {feature}
              </motion.span>
            ))}
          </motion.div>
        </section>

        <section id="apps" className="mt-24">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Projects &amp; published apps
            </h2>
            <p className="mt-3 max-w-2xl text-sm text-zinc-400 sm:text-base">
              Live store and web previews with up to three screenshots per project.
              Tap <span className="text-zinc-300">View more details</span> to open
              the full listing or site.
            </p>
          </motion.div>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2">
            {publishedProjects.map((project) => (
              <AppCard key={project.url} project={project} />
            ))}
          </div>
        </section>
      </main>

      <section
        id="contact"
        className="border-t border-white/5 bg-zinc-950/90 py-12"
      >
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 text-center sm:px-6">
          <h2 className="text-lg font-semibold text-white sm:text-xl">
            Get in touch
          </h2>
          <div className="flex flex-col gap-3 sm:flex-row sm:gap-8">
            <a
              href={`mailto:${profile.email}`}
              className="text-sm font-medium text-cyan-300 hover:text-cyan-200 sm:text-base"
            >
              {profile.email}
            </a>
            <a
              href={`tel:${profile.phoneTel}`}
              className="text-sm font-medium text-cyan-300 hover:text-cyan-200 sm:text-base"
            >
              {profile.phone}
            </a>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/5 py-8 text-center text-xs text-zinc-600">
        © {new Date().getFullYear()} {profile.name}
      </footer>
    </div>
  );
}

function EmailIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
    </svg>
  );
}

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.062 2.062 0 0 1 2.063-2.063 2.063 2.063 0 0 1 2.064 2.063 2.062 2.062 0 0 1-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
    </svg>
  );
}
